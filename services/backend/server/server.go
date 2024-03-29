package server

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"server/app"
	livechat "server/app/websockets"
)

type Server struct {
	app *app.App
}

// NewServer creates a new instance of the Server struct with the provided app.
func NewServer(app *app.App) *Server {
	return &Server{app: app}
}

// Start starts the server and listens for incoming requests on port 8080.
// It takes a database connection as a parameter.
// func (s *Server) Start(database *sql.DB) {
func (s *Server) Start(database *sql.DB, hub *livechat.Hub) {

	http.HandleFunc("/api/ws", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Starting websocket connection...")
		livechat.WebsocketHandler(database, hub, w, r)
	})

	s.app.ServeHTTP(database)

	log.Println("Server is listening on port 8080...")
	// Enable CORS (Cross-Origin Resource Sharing) middleware
	cors := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "GET" || r.Method == "POST" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Add CORS middleware to the server
	http.Handle("/", cors(http.DefaultServeMux))
	http.ListenAndServe(":8080", nil)
}

//TODO FOR SSL ?

// tlsConf, err := config.SSL_Setup()
// 	fmt.Println(err)
// 	srv := &http.Server{
// 		Addr:         ":8080",
// 		ReadTimeout:  5 * time.Second,
// 		WriteTimeout: 10 * time.Second,
// 		IdleTimeout:  15 * time.Second,
// 		TLSConfig:    tlsConf,
// 		TLSNextProto: make(map[string]func(*http.Server, *tls.Conn, http.Handler), 0),
// 	}
// 	srv.ListenAndServeTLS("", "")
