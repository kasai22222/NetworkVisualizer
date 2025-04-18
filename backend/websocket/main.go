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

func handleConnection(w http.ResponseWriter, r *http.Request, parsedData map[string]*types.RuleInfo) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	clientsMutex.Lock()
	clients[conn] = true
	clientsMutex.Unlock()

	go func() {
		defer func() {
			clientsMutex.Lock()
			delete(clients, conn)
			clientsMutex.Unlock()
			conn.Close()
		}()
		SendMessage(parsedData)
		// for _, srcMap := range parsedData {
		// 	for _, data := range srcMap {
		// 		SendMessage(data.Alert)
		// 	}
		// }
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Error readng message: %v", err)
				break
			}
		}
	}()
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

func SendFinish() {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	for conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, []byte("finish"))
		if err != nil {
			log.Fatal("Error sending finish ", err)
			conn.Close()
			delete(clients, conn)
		}
	}
}

func SendMessage(message map[string]*types.RuleInfo) {
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

func RunWebsocketServer(parsedData map[string]*types.RuleInfo) error {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) { handleConnection(w, r, parsedData) })
	http.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(parsedData)
		if err != nil {
			http.Error(w, "Unable to encode json", http.StatusInternalServerError)
			return
		}
	})
	fmt.Println("Websocket started on :8080")
	return http.ListenAndServe(":8080", nil)
}
