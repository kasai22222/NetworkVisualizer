package main

import (
	dataparsing "backend/dataParsing"
	"backend/debugging"
	"backend/mqttclient"
	"backend/types"
	"backend/websocket"
	"fmt"
	"log"
	"net"
	"os"
	"sync"
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
	// mqttclient.InitMQTT("tcp://localhost:1883")
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
		"1:254:17": {
			Message: "PROTOCOL-DNS SPOOF query response with TTL of 1 min. and no authority",
			Stats: map[string]*types.RuleStats{
				"2404:1a8:7f01:a::3": {
					Count: 1,
					Alert: types.ParsedAlert{
						SrcIp: net.ParseIP("192.168.0.12"),
						DstIp: net.ParseIP("192.168.0.11"),
						SrcCoords: types.Coordinates{
							133.24, 120.55,
						},
						DstCoords: types.Coordinates{
							64.1, 108.3,
						},
						Priority:       1,
						Timestamp:      4564587364,
						SrcCountryInfo: types.CountryInfo{IsoCode: "JP", Name: "Japan"},
						DstCountryInfo: types.CountryInfo{IsoCode: "GB", Name: "United Kingdom"},
					},
				},
			},
		},
	}

	mqttclient.PublishAlert("snort/alerts", testData)
	log.Println("✅ テストメッセージを MQTT に publish 済み (topic: snort/alerts)")

	select {}
}
