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

func handleConnection(w http.ResponseWriter, r *http.Request, processedData map[string]*types.RuleInfo, dataMutex *sync.Mutex) {
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
		dataMutex.Lock()
		sendMessage(conn, processedData)
		dataMutex.Unlock()
		// for _, srcMap := range processedData {
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

// func SendFinish() {
// 	clientsMutex.Lock()
// 	defer clientsMutex.Unlock()
//
// 	for conn := range clients {
// 		err := conn.WriteMessage(websocket.TextMessage, []byte("finish"))
// 		if err != nil {
// 			log.Fatal("Error sending finish ", err)
// 			conn.Close()
// 			delete(clients, conn)
// 		}
// 	}
// }

func SendMessageToClients(message map[string]*types.RuleInfo) {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()
	for conn := range clients {
		sendMessage(conn, message)
	}
}

func sendMessage(conn *websocket.Conn, message map[string]*types.RuleInfo) {
	// msg, err := json.Marshal(message)
	// if err != nil {
	// 	log.Print("Error on marshall: ", err)
	// }
	err := conn.WriteJSON(message)
	if err != nil {
		log.Print("Error writing to client: ", err)
		conn.Close()

		clientsMutex.Lock()
		delete(clients, conn)
		clientsMutex.Unlock()
	}
	// for conn := range clients {
	// 	err := conn.WriteJSON(message)
	// 	if err != nil {
	// 		log.Print("Error writing to client", err)
	// 		conn.Close()
	// 		delete(clients, conn)
	// 	}
	// }
}

func RunWebsocketServer(processedData map[string]*types.RuleInfo, dataMutex *sync.Mutex) error {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) { handleConnection(w, r, processedData, dataMutex) })
	http.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(processedData)
		if err != nil {
			http.Error(w, "Unable to encode json", http.StatusInternalServerError)
			return
		}
	})
	fmt.Println("Websocket started on :3000")
	return http.ListenAndServe("0.0.0.0:3000", nil)
}
