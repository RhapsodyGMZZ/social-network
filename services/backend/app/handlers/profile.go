package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/app/middleware/session"
	"server/db/models"
)

func HandleGetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	email := r.URL.Query().Get("email")

	db := r.Context().Value("database").(*sql.DB)
	user := &models.User{}
	user, err := session.GetUserByEmail(db, email)
	if err != nil {
		http.Error(w, "Failed to get user", http.StatusInternalServerError)
		return
	}

	safeUser := map[string]interface{}{
		"uuid":        user.UUID,
		"email":       user.Email,
		"firstName":   user.FirstName,
		"lastName":    user.LastName,
		"dateOfBirth": user.DateOfBirth,
		"status":      user.Status,
		"nickname":    user.Nickname,
		"about":       user.About,
	}
	json.NewEncoder(w).Encode(safeUser)
}

func HandleFollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	type ctx struct {
		User     string `json:"user"`
		Follower string `json:"follower"`
	}

	followStatus := struct {
		Followed bool `json:"followed"`
	}{}

	newCtx := &ctx{}

	switch r.Method {
	case http.MethodPost:
		err := json.NewDecoder(r.Body).Decode(&newCtx)
		if err != nil {
			http.Error(w, "Failed to follow user", http.StatusInternalServerError)
			return
		}
	case http.MethodGet:
		newCtx.Follower = r.URL.Query().Get("user")
		newCtx.User = r.URL.Query().Get("author")
	}

	if newCtx.User == newCtx.Follower {
		return
	}

	db := r.Context().Value("database").(*sql.DB)

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM followers WHERE user_uuid = ? AND follower_uuid = ?)", newCtx.User, newCtx.Follower).Scan(&exists)
	if err != nil {
		http.Error(w, "Failed to follow user", http.StatusInternalServerError)
		return
	}

	followStatus.Followed = exists
	if r.Method == http.MethodPost {
		if exists {
			_, err := db.Exec("DELETE FROM followers WHERE user_uuid = ? AND follower_uuid = ?", newCtx.User, newCtx.Follower)
			if err != nil {
				http.Error(w, "Failed to unfollow user", http.StatusInternalServerError)
				return
			}
			followStatus.Followed = false
		} else {
			_, err = db.Exec("INSERT INTO followers (user_uuid, follower_uuid) VALUES (?, ?)", newCtx.User, newCtx.Follower)
			if err != nil {
				http.Error(w, "Failed to follow user", http.StatusInternalServerError)
				return
			}
			followStatus.Followed = true
		}
	}

	json.NewEncoder(w).Encode(followStatus)
}

func HandleGetFollowers(w http.ResponseWriter, r *http.Request) {
	var followers models.Follower
	var msg []models.Follower
	var currentUser, follow string

	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if r.Method == http.MethodGet {

		currentUser = r.URL.Query().Get("user")
		// currentUser = "5b4ae780-bd51-4aba-9e8b-5fff810219ff"
		db := r.Context().Value("database").(*sql.DB)

		rows, err := db.Query("SELECT follower_uuid FROM followers WHERE user_uuid = ?", currentUser)
		if err != nil {
			fmt.Println(err)
			return
		}
		for rows.Next() {
			rows.Scan(&follow)
			session.SetFollowers(w, db, follow, &followers)
			msg = append(msg, followers)
		}
	}
	json.NewEncoder(w).Encode(msg)
}

func HandleGetUserStatus(w http.ResponseWriter, r *http.Request) {
	var data models.User
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if r.Method == http.MethodPost {
		// db := r.Context().Value("database").(*sql.DB)
		json.NewDecoder(r.Body).Decode(&data)
		fmt.Println("status", data.Status)
	}

}
