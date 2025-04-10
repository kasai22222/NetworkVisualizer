package websocket

import (
	"backend/types"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients      = make(map[*websocket.Conn]bool)
	clientsMutex sync.Mutex
	upgrader     = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

// func wsHandler(w http.ResponseWriter, r *http.Request) {
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		fmt.Println("Error upgrading:", err)
// 		return
// 	}
// 	defer conn.Close()
//
// 	clientsMutex.Lock()
// 	clients[conn] = true
// 	clientsMutex.Unlock()
//
// 	go handleConnection(conn)
// }

func handleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: ", err)
		return
	}
	defer conn.Close()

	clientsMutex.Lock()
	clients[conn] = true
	clientsMutex.Unlock()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	clientsMutex.Lock()
	delete(clients, conn)
	clientsMutex.Unlock()
}

// defer func() {
// 	clientsMutex.Lock()
// 	delete(clients, conn)
// 	clientsMutex.Unlock()
// 	conn.Close()
// }()
// for {
// 	_, message, err := conn.ReadMessage()
// 	if err != nil {
// 		fmt.Println("Error reading message: ", err)
// 		return
// 	}
// 	if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
// 		fmt.Println("Error sending message", err)
// 		return
// 	}
// 	fmt.Printf(string(message))

func SendMessage(message types.AlertData) {
	msg, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error on marshall: ", err)
	}
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	for conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Printf("Error writing to client", err)
			conn.Close()
			delete(clients, conn)
		}
	}
}

func RunWebsocketServer() error {
	http.HandleFunc("/ws", handleConnection)
	fmt.Println("Websocket started on :8080")
	return http.ListenAndServe(":8080", nil)
}
