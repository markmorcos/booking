package middleware

import (
	"context"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type contextKey string

const (
	UserContextKey     contextKey = "user"
	FirebaseContextKey contextKey = "firebase_token"
)

func UserFromContext(ctx context.Context) *repository.User {
	u, _ := ctx.Value(UserContextKey).(*repository.User)
	return u
}

func FirebaseTokenFromContext(ctx context.Context) *auth.Token {
	t, _ := ctx.Value(FirebaseContextKey).(*auth.Token)
	return t
}

type AuthMiddleware struct {
	firebaseAuth *auth.Client
	queries      *repository.Queries
}

func NewAuthMiddleware(firebaseAuth *auth.Client, queries *repository.Queries) *AuthMiddleware {
	return &AuthMiddleware{
		firebaseAuth: firebaseAuth,
		queries:      queries,
	}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			http.Error(w, `{"error":"invalid authorization header"}`, http.StatusUnauthorized)
			return
		}

		token, err := m.firebaseAuth.VerifyIDToken(r.Context(), parts[1])
		if err != nil {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), FirebaseContextKey, token)

		// Try to look up the user in DB
		user, err := m.queries.GetUserByFirebaseUID(r.Context(), token.UID)
		if err == nil {
			ctx = context.WithValue(ctx, UserContextKey, &user)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireUser ensures the user exists in DB (has registered)
func (m *AuthMiddleware) RequireUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := UserFromContext(r.Context())
		if user == nil {
			http.Error(w, `{"error":"user not registered"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
