package mqttclient

import (
	"backend/types"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var client mqtt.Client

func InitMQTT(defaultBroker string) {
	broker := os.Getenv("MQTT_BROKER")
	if broker == "" {
		broker = defaultBroker
	}

	opts := mqtt.NewClientOptions().
		AddBroker(broker).
		SetKeepAlive(30 * time.Second).
		SetPingTimeout(10 * time.Second).
		SetAutoReconnect(true).
		SetConnectRetry(true).
		SetConnectRetryInterval(10 * time.Second)

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown-host"
	}
	clientID := fmt.Sprintf("%s-%d", hostname, time.Now().UnixNano())
	opts.SetClientID(clientID)
	opts.SetCleanSession(false)

	client = mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("MQTT接続エラー: %v", token.Error())
	}
	log.Printf("✅ MQTT接続完了（接続先: %s, クライアントID: %s）", broker, clientID)
}

func PublishAlert(topic string, message map[string]*types.RuleInfo) {
	if client == nil || !client.IsConnected() {
		log.Println("⚠️ MQTTクライアントが未接続です")
		return
	}

	payload, err := json.Marshal(message)
	if err != nil {
		log.Printf("JSON変換エラー: %v", err)
		return
	}

	log.Printf("📤 MQTT送信データ: %s", payload)

	token := client.Publish(topic, 0, false, payload)
	token.Wait()

	if token.Error() != nil {
		log.Printf("❌ MQTT Publish失敗: %v", token.Error())
	} else {
		log.Printf("✅ MQTT Publish成功 (topic: %s)", topic)
	}
}
