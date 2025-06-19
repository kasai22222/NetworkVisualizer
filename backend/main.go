// package main

// import (
// 	dataparsing "backend/dataParsing"
// 	"backend/debugging"
// 	"backend/types"
// 	"backend/websocket"
// 	"fmt"
// 	"log"
// 	"sync"
// 	"backend/mqttclient"
// )

// // TODO: make it use env vars

// // "backend/websocket"

// var filesToWatch = []string{"alert_json.txt"}
// var processedData = map[string]*types.RuleInfo{}
// var dataMutex sync.Mutex

// func main() {
// 	mqttclient.InitMQTT("tcp://192.168.0.12:1883")
// 	fileChangeEvents, err := dataparsing.StartWatchingFiles(filesToWatch)
// 	if err != nil {
// 		log.Fatal("failed to start fileWatching, ", err)
// 	}

// 	//TODO: change to do each file on startup
// 	dataMutex.Lock()
// 	_, err = dataparsing.ProcessData("alert_json.txt", processedData)
// 	if err != nil {
// 		fmt.Printf("Error processing data: %v", err)
// 	}

// 	dataMutex.Unlock()
// 	debugging.CountCount("After Initial data processing", processedData)
// 	go websocket.RunWebsocketServer(processedData, &dataMutex)
// 	go func() {
// 		for event := range fileChangeEvents {
// 			dataMutex.Lock()
// 			currentProcessedData, err := dataparsing.ProcessData(event.Path, processedData)
// 			if err != nil {
// 				log.Fatal("Error processing data: ", err)
// 			}
// 			dataMutex.Unlock()
// 			debugging.CountCount("Before sending to clients", processedData)
// 			// websocket.SendMessageToClients(currentProcessedData)
// 			mqttclient.PublishAlert("snort/alerts", currentProcessedData)
// 		}
// 	}()
// 	select {}
// }

// //	func getData(path string) {
// //		alerts, err := dataparsing.JsonHelper(path)
// //		if err != nil {
// //			log.Fatalf("Failed to parse json data %s", err)
// //		}
// //		// var coords []geoIpLookup.Coordinates
// //
// //		for _, raw := range alerts {
// //			// var coords []geoIpLookup.Coordinates
// //			currentParsedData, err := parseData(raw)
// //			if err != nil {
// //				log.Printf("Failed to parse data")
// //			}
// //
// //			rule := raw.Rule
// //			srcIp := currentParsedData.SrcIp.String()
// //
// //			if _, ok := parsedData[rule]; !ok {
// //				parsedData[rule] = &types.RuleInfo{
// //					Message: raw.Msg,
// //					Stats:   map[string]*types.RuleStats{},
// //				}
// //			}
// //			stats, exists := parsedData[rule].Stats[srcIp]
// //			if exists {
// //				stats.Count++
// //			} else {
// //				parsedData[rule].Stats[srcIp] = &types.RuleStats{
// //					Count: 1,
// //					Alert: currentParsedData,
// //				}
// //			}
// //		}
// //	}
// //
// //	func testing() {
// //		// data, err := json.MarshalIndent(parsedData, "", "  ")
// //		// if err != nil {
// //		// 	log.Fatal("temp test broken")
// //		// }
// //		// fmt.Println(string(data))
// //		fmt.Println(len(parsedData))
// //		// for _, value := range parsedData {
// //		// 	fmt.Println(*value)
// //		// }
// //	}

// //NOTE: Current working code
// // func main() {
// // 	go websocket.RunWebsocketServer(parsedData)
// // 	for _, val := range filesToWatch {
// // 		dataparsing.StartWatching(val, parsedData, &dataMutex)
// // 	}
// // 	go func() {
// // 		for range time.Tick(5 * time.Second) {
// // 			dataMutex.Lock()
// // 			countAdd := 0
// // 			fmt.Printf("Total Rule Count: %d\n", len(parsedData))
// // 			for _, val := range parsedData {
// // 				for _, innerVal := range val.Stats {
// // 					countAdd += innerVal.Count
// // 				}
// // 			}
// // 			fmt.Printf("Total Count: %d", countAdd)
// // 			dataMutex.Unlock()
// // 		}
// // 	}()
// // 	select {}
// // }





package main

import (
	dataparsing "backend/dataParsing"
	"backend/debugging"
	"backend/types"
	"backend/websocket"
	"fmt"
	"log"
	"os"
	"sync"
	"backend/mqttclient"
)

var processedData = map[string]*types.RuleInfo{}
var dataMutex sync.Mutex

func main() {
	// 環境変数でファイルパス取得、なければローカルの標準パスにフォールバック
	filePath := os.Getenv("ALERT_JSON_PATH")
	if filePath == "" {
		filePath = "/build/alert_json.txt" // ローカル実行環境用
	}

	// ファイル存在チェック
	_, err := os.Stat(filePath)
	if err != nil {
		log.Printf("file not found: %s, err: %v", filePath, err)
	} else {
		log.Printf("file found: %s", filePath)
	}

	// デバッグ用カレントディレクトリ出力
	dir, err := os.Getwd()
	if err != nil {
		log.Printf("Failed to get working directory: %v", err)
	} else {
		log.Printf("Current working directory: %s", dir)
	}

	filesToWatch := []string{filePath}

	// MQTT初期化
	mqttclient.InitMQTT("tcp://192.168.0.12:1883")

	// ファイル監視開始
	fileChangeEvents, err := dataparsing.StartWatchingFiles(filesToWatch)
	if err != nil {
		log.Fatal("failed to start fileWatching, ", err)
	}

	// 初回データ処理
	dataMutex.Lock()
	_, err = dataparsing.ProcessData(filePath, processedData)
	if err != nil {
		fmt.Printf("Error processing data: %v\n", err)
	}
	dataMutex.Unlock()

	debugging.CountCount("After Initial data processing", processedData)

	// WebSocketサーバ起動
	go websocket.RunWebsocketServer(processedData, &dataMutex)

	// ファイル変更イベント監視
	go func() {
		for event := range fileChangeEvents {
			dataMutex.Lock()
			currentProcessedData, err := dataparsing.ProcessData(event.Path, processedData)
			if err != nil {
				log.Fatal("Error processing data: ", err)
			}
			dataMutex.Unlock()

			debugging.CountCount("Before sending to clients", processedData)
			mqttclient.PublishAlert("snort/alerts", currentProcessedData)
		}
	}()


	// --- MQTT パブリッシュ テスト ---
	testData := map[string]*types.RuleInfo{
		"test-rule": {
			Message: "This is a test MQTT message from Go!",
			Stats: map[string]*types.RuleStats{
				"127.0.0.1": {
					Count: 1,
				},
			},
		},
	}
	mqttclient.PublishAlert("snort/alerts", testData)
	log.Println("✅ テストメッセージを MQTT に publish 済み (topic: snort/alerts)")

	select {}
}
