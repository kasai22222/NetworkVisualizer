package main

import (
	dataparsing "backend/dataParsing"
	"backend/geoIpLookup"
	"backend/types"
	"backend/websocket"
	"fmt"
	"log"
	"net"
)

// TODO: make it use env vars

// "backend/websocket"

var filesToWatch = []string{"alert_json.txt"}
var parsedData = map[string]*types.RuleInfo{}

func parseData(data types.RawAlert) (types.ParsedAlert, error) {
	var parsedData types.ParsedAlert
	/////TESSTINGGGG
	// stringified, err := json.MarshalIndent(data, "", "  ")
	// fmt.Println(string(stringified))
	// test, err := geoIpLookup.GetCity(data.Src_addr)
	// if err != nil {
	// 	return types.AlertData{}, err
	// }
	// parsedData.City = *test
	parsedData.SrcIp = net.ParseIP(data.Src_addr)
	parsedData.DstIp = net.ParseIP(data.Dst_addr)
	parsedData.Priority = data.Priority
	parsedData.Timestamp = data.Timestamp
	srcCoords, err := geoIpLookup.GetCoordinates(parsedData.SrcIp)
	if err != nil {
		log.Fatal("Failed to get src coords", err)
	}
	parsedData.SrcCoords = srcCoords
	dstCoords, err := geoIpLookup.GetCoordinates(parsedData.DstIp)
	if err != nil {
		log.Fatal("Failed to get dst coords", err)
	}
	parsedData.DstCoords = dstCoords
	return parsedData, nil
}

// var parsedData []types.ParsedAlert

func getData(path string) {
	alerts, err := dataparsing.JsonHelper(path)
	if err != nil {
		log.Fatalf("Failed to parse json data %s", err)
	}
	// var coords []geoIpLookup.Coordinates

	for _, raw := range alerts {
		// var coords []geoIpLookup.Coordinates
		currentParsedData, err := parseData(raw)
		if err != nil {
			log.Printf("Failed to parse data")
		}

		rule := raw.Rule
		srcIp := currentParsedData.SrcIp.String()

		if _, ok := parsedData[rule]; !ok {
			parsedData[rule] = &types.RuleInfo{
				Message: raw.Msg,
				Stats:   map[string]*types.RuleStats{},
			}
		}
		stats, exists := parsedData[rule].Stats[srcIp]
		if exists {
			stats.Count++
		} else {
			parsedData[rule].Stats[srcIp] = &types.RuleStats{
				Count: 1,
				Alert: currentParsedData,
			}
		}
	}
}
func main() {
	go websocket.RunWebsocketServer(parsedData)
	for _, val := range filesToWatch {
		getData(val)
	}

	changeChan, err := dataparsing.WatchFile(filesToWatch)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for event := range changeChan {
			if event.FileChange {
				fmt.Println("New data detected")
				getData(event.Path)
				websocket.SendMessage(parsedData)
				// for _, srcMap := range parsedData {
				// 	for _, data := range srcMap {
				// 		// Pass the Alert field (which is of type ParsedAlert) to SendMessage
				// 		websocket.SendMessage(data.Alert)
				// 	}
				// }
			}
		}
	}()
	// type Ips struct {
	// 	SrcIp net.IP
	// 	DstIp net.IP
	// }

	// go func() {
	// 	done := []Ips{}
	// 	i := 0
	//
	// 	fmt.Println(len(parsedData))
	// 	for {
	// 		if i == 48 {
	// 			fmt.Print("here")
	// 		}
	// 		fmt.Println("i: ", i)
	// 		if i == len(parsedData)-1 {
	// 			websocket.SendFinish()
	// 			done = []Ips{}
	// 			i = 0
	// 			continue
	// 		}
	// 		skip := false
	// 		currVal := parsedData[i]
	// 		fmt.Println("CurrVal: ", currVal)
	// 		for _, doneVals := range done {
	// 			if currVal.SrcIp.Equal(doneVals.SrcIp) || currVal.DstIp.Equal(doneVals.DstIp) {
	// 				skip = true
	// 				i++
	// 				break
	// 			}
	//
	// 		}
	// 		if skip {
	// 			continue
	// 		}
	// 		done = append(done, Ips{currVal.SrcIp, currVal.DstIp})
	// 		i++
	// 		websocket.SendMessage(currVal)
	// 		time.Sleep(1 * time.Second)
	// 	}
	// }()
	select {}
}
