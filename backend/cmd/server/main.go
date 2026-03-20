package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/go-chi/chi/v5"
	_ "github.com/lib/pq"
	"google.golang.org/api/option"

	"github.com/markmorcos/booking/backend/internal/config"
	"github.com/markmorcos/booking/backend/internal/handler"
	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/notification"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/scheduler"
	"github.com/markmorcos/booking/backend/internal/service"
)

func main() {
	migrate := flag.Bool("migrate", false, "Run database migrations and exit")
	flag.Parse()

	cfg := config.Load()

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	if *migrate {
		if err := runMigrations(db); err != nil {
			log.Fatalf("migration failed: %v", err)
		}
		log.Println("migrations completed successfully")
		return
	}

	// Initialize Firebase
	ctx := context.Background()
	var firebaseApp *firebase.App
	if cfg.FirebaseServiceAccountJSON != "" {
		opt := option.WithCredentialsJSON([]byte(cfg.FirebaseServiceAccountJSON))
		firebaseApp, err = firebase.NewApp(ctx, nil, opt)
	} else {
		firebaseApp, err = firebase.NewApp(ctx, nil)
	}
	if err != nil {
		log.Fatalf("failed to initialize firebase: %v", err)
	}

	authClient, err := firebaseApp.Auth(ctx)
	if err != nil {
		log.Fatalf("failed to get firebase auth client: %v", err)
	}

	var fcmClient *messaging.Client
	fcmClient, err = firebaseApp.Messaging(ctx)
	if err != nil {
		log.Printf("warning: failed to get FCM client: %v", err)
	}

	// Initialize layers
	queries := repository.New(db)

	userService := service.NewUserService(db, queries)
	slotService := service.NewSlotService(db, queries)
	appointmentService := service.NewAppointmentService(db, queries)

	// Templates directory
	templatesDir := "/app/templates"
	if _, err := os.Stat(templatesDir); os.IsNotExist(err) {
		// Try relative path for development
		templatesDir = "internal/notification/templates"
	}

	emailSender := notification.NewEmailSender(cfg, templatesDir)
	whatsappSender := notification.NewWhatsAppSender(cfg)
	fcmSender := notification.NewFCMSender(fcmClient)
	dispatcher := notification.NewDispatcher(queries, emailSender, whatsappSender, fcmSender)

	// Handlers
	healthHandler := handler.NewHealthHandler()
	authHandler := handler.NewAuthHandler(userService)
	slotsHandler := handler.NewSlotsHandler(slotService)
	appointmentsHandler := handler.NewAppointmentsHandler(appointmentService, dispatcher, queries)
	adminSlotsHandler := handler.NewAdminSlotsHandler(slotService)
	adminAppointmentsHandler := handler.NewAdminAppointmentsHandler(appointmentService, userService, dispatcher)
	adminRecurrenceHandler := handler.NewAdminRecurrenceHandler(queries, slotService)
	adminUsersHandler := handler.NewAdminUsersHandler(userService, dispatcher)

	// Auth middleware
	authMiddleware := middleware.NewAuthMiddleware(authClient, queries)

	// Router
	r := chi.NewRouter()
	r.Use(middleware.CORS)
	r.Use(middleware.Logging)

	r.Get("/health", healthHandler.Health)

	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Post("/register", authHandler.Register)

			r.Group(func(r chi.Router) {
				r.Use(authMiddleware.RequireUser)
				r.Get("/me", authHandler.Me)
				r.Put("/me", authHandler.UpdateMe)
				r.Put("/me/fcm-token", authHandler.UpdateFCMToken)
			})
		})

		// User routes (require auth + registered user)
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Use(authMiddleware.RequireUser)

			r.Get("/slots", slotsHandler.List)
			r.Get("/slots/{id}", slotsHandler.Get)

			r.Get("/appointments", appointmentsHandler.List)
			r.Post("/appointments", appointmentsHandler.Book)
			r.Patch("/appointments/{id}/cancel", appointmentsHandler.Cancel)
			r.Patch("/appointments/{id}/reschedule", appointmentsHandler.Reschedule)
		})

		// Admin routes
		r.Route("/admin", func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Use(authMiddleware.RequireUser)
			r.Use(middleware.RequireAdmin)

			r.Post("/slots", adminSlotsHandler.Create)
			r.Post("/slots/batch", adminSlotsHandler.CreateBatch)
			r.Delete("/slots/{id}", adminSlotsHandler.Delete)
			r.Delete("/slots/range", adminSlotsHandler.DeleteRange)

			r.Get("/recurrence-rules", adminRecurrenceHandler.List)
			r.Post("/recurrence-rules", adminRecurrenceHandler.Create)
			r.Put("/recurrence-rules/{id}", adminRecurrenceHandler.Update)
			r.Delete("/recurrence-rules/{id}", adminRecurrenceHandler.Delete)
			r.Post("/recurrence-rules/{id}/exceptions", adminRecurrenceHandler.CreateException)
			r.Post("/recurrence-rules/materialize", adminRecurrenceHandler.Materialize)

			r.Get("/appointments", adminAppointmentsHandler.List)
			r.Patch("/appointments/{id}/confirm", adminAppointmentsHandler.Confirm)
			r.Patch("/appointments/{id}/cancel", adminAppointmentsHandler.Cancel)
			r.Patch("/appointments/{id}/reschedule", adminAppointmentsHandler.Reschedule)
			r.Patch("/appointments/{id}/complete", adminAppointmentsHandler.Complete)
			r.Patch("/appointments/{id}/no-show", adminAppointmentsHandler.NoShow)

			r.Get("/users", adminUsersHandler.List)
			r.Post("/users/invite", adminUsersHandler.Invite)
		})
	})

	// Start scheduler
	schedulerCtx, schedulerCancel := context.WithCancel(context.Background())
	defer schedulerCancel()

	materializer := scheduler.NewMaterializer(queries, slotService)
	reminder := scheduler.NewReminder(queries, dispatcher)
	cleanup := scheduler.NewCleanup(queries)
	sched := scheduler.NewScheduler(materializer, reminder, cleanup)
	sched.Start(schedulerCtx)

	// Start server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down server...")

	schedulerCancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	log.Println("server stopped")
}

func runMigrations(db *sql.DB) error {
	// Create migrations tracking table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Find migration files
	migrationsDir := "/app/migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = "db/migrations"
	}

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var upFiles []string
	for _, entry := range entries {
		if strings.HasSuffix(entry.Name(), ".up.sql") {
			upFiles = append(upFiles, entry.Name())
		}
	}
	sort.Strings(upFiles)

	for _, file := range upFiles {
		version := strings.TrimSuffix(file, ".up.sql")

		// Check if already applied
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM schema_migrations WHERE version = $1", version).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check migration %s: %w", version, err)
		}
		if count > 0 {
			log.Printf("migration %s already applied, skipping", version)
			continue
		}

		content, err := os.ReadFile(filepath.Join(migrationsDir, file))
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", file, err)
		}

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("failed to begin transaction for %s: %w", file, err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %s: %w", file, err)
		}

		if _, err := tx.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", version); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", file, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", file, err)
		}

		log.Printf("applied migration: %s", file)
	}

	return nil
}
