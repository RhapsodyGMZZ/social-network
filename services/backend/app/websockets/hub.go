package livechat

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"server/app"
	"server/app/middleware"
	"strings"
	"time"
)

type Hub struct {
	clients    map[string]*Client
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	status     []*Client
}
type Message struct {
	Msg_type string `json:"msg_type"`
	Content  string `json:"content"`
	Target   string `json:"target"`
	Sender   string `json:"sender"`
	Date     string `json:"date"`
	Image    string `json:"image"`
}
type StatusMessage struct {
	Msg_type string    `json:"msg_type"`
	Target   string    `json:"target"`
	Status   []*Client `json:"status"`
}

func InitHub(app *app.App) *Hub {
	users := middleware.GetAllUsers(app.DB.DB) //TODO Get all users from db ?
	offlineInit := make([]*Client, 0)
	for _, user := range users {
		client := &Client{Username: user, send: make(chan []byte)}
		offlineInit = append(offlineInit, client)
	}
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]*Client),
		status:     offlineInit,
	}
}
func (h *Hub) Run(app *app.App) {
	for {
		select {
		case client := <-h.register:
			client.Online = true
			h.clients[client.Username] = client
			h.status = Remove(h.status, client)
			h.status = append(h.status, client)
			h.SendStatusMessage(app, client)
		case client := <-h.unregister:
			if _, ok := h.clients[client.Username]; ok {
				client.Online = false
				h.status = Remove(h.status, client)
				h.status = append(h.status, client)
				h.SendStatusMessage(app, client)
				close(h.clients[client.Username].send)
				delete(h.clients, client.Username)
			}
		case message := <-h.broadcast:
			msg := &Message{}
			json.Unmarshal(message, msg)
			switch msg.Msg_type {
			case "notification":
				notif := &Message{Msg_type: "notification", Target: msg.Target, Sender: msg.Sender}
				jsonNotif, _ := json.Marshal(notif)
				h.SendMessageToTarget(app, msg.Target, jsonNotif)
			case "chat":
				h.SendMessageToTarget(app, msg.Target, message)
			case "typing":
				typing := &Message{Msg_type: "typing", Target: msg.Target, Sender: msg.Sender}
				if msg.Content == "typing" {
					typing.Content = "typing"
				} else {
					typing.Content = "stop"
				}
				jsonTyping, _ := json.Marshal(typing)
				h.SendMessageToTarget(app, msg.Target, jsonTyping)
			}
		}
	}
}
func (h *Hub) SendStatusMessage(app *app.App, current *Client) {
	h.clients[current.Username].LastMsg = []string{}
	h.clients[current.Username].LastMsg = GetLastestMessages(app, current.Username)
	msg := &StatusMessage{Msg_type: "status", Target: current.Username, Status: h.status}
	jsonClients, _ := json.Marshal(msg)
	for c := range h.clients {
		h.clients[c].send <- jsonClients
	}
}
func (h *Hub) SendMessageToTarget(app *app.App, username string, message []byte) {
	msg := &Message{}
	json.Unmarshal(message, msg)
	if msg.Msg_type == "chat" {
		if client, ok := h.clients[username]; ok {
			if client.Username == msg.Target || client.Username == msg.Sender {
				SavePrivateMessage(app, msg)
				client.send <- message
			}
		}
	}
	if msg.Msg_type == "notification" {
		if client, ok := h.clients[username]; ok {
			if client.Username == msg.Target {
				client.send <- message
			}
		}
	}
	if msg.Msg_type == "typing" {
		if client, ok := h.clients[username]; ok {
			if client.Username == msg.Target {
				client.send <- message
			}
		}
	}
}
func Remove(clients []*Client, c *Client) []*Client {
	index := -1
	for i, v := range clients {
		if v.Username == c.Username {
			index = i
			break
		}
	}
	if index == -1 {
		return clients
	}
	return append(clients[:index], clients[index+1:]...)
}
func SavePrivateMessage(app *app.App, message *Message) error {
	var image []byte
	if message.Image != "" {
		dataURLParts := strings.Split(message.Image, ",")
		if len(dataURLParts) != 2 {
			return errors.New("invalid base64 data")
		}
		image, _ = base64.StdEncoding.DecodeString(dataURLParts[1])
	}
	_, err := app.DB.Exec(
		"INSERT INTO private_messages(sender, target, content, date, creation, image) VALUES (?,?,?,?,?, ?)",
		message.Sender,
		message.Target,
		message.Content,
		message.Date,
		time.Now(),
		image,
	)
	return err
}
func GetOldMessages(app *app.App, sender, target string, limit, offset int) ([]*Message, error) {
	rows, err := app.DB.Query("SELECT sender, target, content, date,image FROM private_messages WHERE ((target = ? AND sender = ?) OR (target = ? AND sender = ?)) ORDER BY creation DESC LIMIT ? OFFSET ?",
		target,
		sender,
		sender,
		target,
		limit,
		offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	messages := []*Message{}
	for rows.Next() {
		message := &Message{Msg_type: "historic"}
		blob := make([]byte, 0)
		if err := rows.Scan(&message.Sender, &message.Target, &message.Content, &message.Date, &blob); err != nil {
			return nil, err
		}
		message.Image = base64.StdEncoding.EncodeToString(blob)
		messages = append(messages, message)
	}
	return messages, nil
}
func GetLastestMessages(app *app.App, target string) []string {
	clients := []string{}
	rows, err := app.DB.Query("SELECT sender FROM private_messages WHERE target = ? ORDER BY creation DESC", target)
	if err != nil {
		return nil
	}
	defer rows.Close()
	for rows.Next() {
		var sender string
		if err := rows.Scan(&sender); err != nil {
			return nil
		}
		if !contains(clients, sender) {
			clients = append(clients, sender)
		}
	}
	return clients
}
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
