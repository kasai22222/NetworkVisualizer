package main

import (
	dataparsing "backend/dataParsing"
	"backend/debugging"
	"backend/types"
	"backend/websocket"
	"log"
	"sync"
)

// TODO: make it use env vars

// "backend/websocket"

var filesToWatch = []string{"alert_json.txt"}
var processedData = map[string]*types.RuleInfo{}
var dataMutex sync.Mutex

func main() {
	fileChangeEvents, err := dataparsing.StartWatchingFiles(filesToWatch)
	if err != nil {
		log.Fatal("failed to start fileWatching, ", err)
	}

	//TODO: change to do each file on startup
	dataMutex.Lock()
	dataparsing.ProcessData("alert_json.txt", processedData)
	dataMutex.Unlock()
	debugging.CountCount("After Initial data processing", processedData)
	go websocket.RunWebsocketServer(processedData, &dataMutex)
	go func() {
		for event := range fileChangeEvents {
			dataMutex.Lock()
			currentProcessedData, err := dataparsing.ProcessData(event.Path, processedData)
			if err != nil {
				log.Fatal("Error processing data: ", err)
			}
			dataMutex.Unlock()
			debugging.CountCount("Before sending to clients", processedData)
			websocket.SendMessageToClients(currentProcessedData)
		}
	}()
	select {}
}

//	func getData(path string) {
//		alerts, err := dataparsing.JsonHelper(path)
//		if err != nil {
//			log.Fatalf("Failed to parse json data %s", err)
//		}
//		// var coords []geoIpLookup.Coordinates
//
//		for _, raw := range alerts {
//			// var coords []geoIpLookup.Coordinates
//			currentParsedData, err := parseData(raw)
//			if err != nil {
//				log.Printf("Failed to parse data")
//			}
//
//			rule := raw.Rule
//			srcIp := currentParsedData.SrcIp.String()
//
//			if _, ok := parsedData[rule]; !ok {
//				parsedData[rule] = &types.RuleInfo{
//					Message: raw.Msg,
//					Stats:   map[string]*types.RuleStats{},
//				}
//			}
//			stats, exists := parsedData[rule].Stats[srcIp]
//			if exists {
//				stats.Count++
//			} else {
//				parsedData[rule].Stats[srcIp] = &types.RuleStats{
//					Count: 1,
//					Alert: currentParsedData,
//				}
//			}
//		}
//	}
//
//	func testing() {
//		// data, err := json.MarshalIndent(parsedData, "", "  ")
//		// if err != nil {
//		// 	log.Fatal("temp test broken")
//		// }
//		// fmt.Println(string(data))
//		fmt.Println(len(parsedData))
//		// for _, value := range parsedData {
//		// 	fmt.Println(*value)
//		// }
//	}

//NOTE: Current working code
// func main() {
// 	go websocket.RunWebsocketServer(parsedData)
// 	for _, val := range filesToWatch {
// 		dataparsing.StartWatching(val, parsedData, &dataMutex)
// 	}
// 	go func() {
// 		for range time.Tick(5 * time.Second) {
// 			dataMutex.Lock()
// 			countAdd := 0
// 			fmt.Printf("Total Rule Count: %d\n", len(parsedData))
// 			for _, val := range parsedData {
// 				for _, innerVal := range val.Stats {
// 					countAdd += innerVal.Count
// 				}
// 			}
// 			fmt.Printf("Total Count: %d", countAdd)
// 			dataMutex.Unlock()
// 		}
// 	}()
// 	select {}
// }
