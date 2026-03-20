package service

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type UserService struct {
	db      *sql.DB
	queries *repository.Queries
}

func NewUserService(db *sql.DB, queries *repository.Queries) *UserService {
	return &UserService{db: db, queries: queries}
}

func (s *UserService) GetByFirebaseUID(ctx context.Context, uid string) (repository.User, error) {
	return s.queries.GetUserByFirebaseUID(ctx, uid)
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (repository.User, error) {
	return s.queries.GetUserByID(ctx, id)
}

func (s *UserService) Register(ctx context.Context, firebaseUID, email, name, phone, tenantSlug string) (repository.User, error) {
	// Check if user already exists
	existing, err := s.queries.GetUserByFirebaseUID(ctx, firebaseUID)
	if err == nil {
		return existing, nil
	}

	// Find or create tenant
	tenant, err := s.queries.GetTenantBySlug(ctx, tenantSlug)
	if err != nil {
		if err == sql.ErrNoRows {
			// Create the tenant
			tenant, err = s.queries.CreateTenant(ctx, tenantSlug, tenantSlug, "UTC", "en")
			if err != nil {
				return repository.User{}, fmt.Errorf("failed to create tenant: %w", err)
			}
		} else {
			return repository.User{}, fmt.Errorf("failed to look up tenant: %w", err)
		}
	}

	// Determine role: first user with no existing admin becomes admin
	role := "user"
	adminCount, err := s.queries.CountAdminsByTenant(ctx, tenant.ID)
	if err != nil {
		return repository.User{}, fmt.Errorf("failed to count admins: %w", err)
	}
	if adminCount == 0 {
		role = "admin"
	}

	phoneNull := sql.NullString{}
	if phone != "" {
		phoneNull = sql.NullString{String: phone, Valid: true}
	}

	user, err := s.queries.CreateUser(ctx, repository.CreateUserParams{
		TenantID:    tenant.ID,
		FirebaseUID: firebaseUID,
		Email:       email,
		Name:        name,
		Phone:       phoneNull,
		Role:        role,
		Locale:      tenant.DefaultLocale,
	})
	if err != nil {
		return repository.User{}, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (s *UserService) Update(ctx context.Context, arg repository.UpdateUserParams) (repository.User, error) {
	return s.queries.UpdateUser(ctx, arg)
}

func (s *UserService) UpdateFCMToken(ctx context.Context, userID uuid.UUID, token string) error {
	return s.queries.UpdateUserFCMToken(ctx, userID, token)
}

func (s *UserService) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]repository.User, error) {
	return s.queries.ListUsersByTenant(ctx, tenantID)
}

func (s *UserService) GetByEmail(ctx context.Context, email string, tenantID uuid.UUID) (repository.User, error) {
	return s.queries.GetUserByEmail(ctx, email, tenantID)
}
