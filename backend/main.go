package main

import (
	"backend/geoIpLookup"
	jsonhelper "backend/jsonHelper"
	"backend/types"
	"backend/websocket"
	"log"
	"time"
)

// "backend/websocket"

func parseData(data jsonhelper.Alert) (types.AlertData, error) {
	var parsedData types.AlertData
	test, err := geoIpLookup.GetCity(data.Src_addr)
	if err != nil {
		return types.AlertData{}, err
	}
	parsedData.City = *test
	return parsedData, nil
}

func main() {
	// var testIp string = "174.211.227.158"
	// // fmt.Println(geoIpLookup.GetGeoip())
	// fmt.Print(geoIpLookup.GetCoordinates(testIp))

	// coordinates, err := geoIpLookup.GetCoordinates(testIp)
	// if err != nil {
	// 	log.Fatal("Could not get city info", err)
	// }
	// city, err := geoIpLookup.GetCity(testIp)
	// if err != nil {
	// 	log.Fatal("Could not get city info", err)
	// }
	dataFile := "alert_json.txt"
	alerts, err := jsonhelper.JsonHelper(dataFile)
	if err != nil {
		log.Fatalf("Failed to parse json data %s", err)
	}
	// var coords []geoIpLookup.Coordinates

	var parsedData []types.AlertData
	for _, value := range alerts {
		__, err := parseData(value)
		if err != nil {
			log.Fatal("Failed to parse data")
		}
		parsedData = append(parsedData, __)
		// val, err := geoIpLookup.GetCoordinates(value.Src_addr)
		// if err != nil {
		// 	log.Fatalf("Could not get coords for ip %s: %s", value.Src_addr, err)
		// }
		// 	// coords = append(coords, val)
		go websocket.RunWebsocketServer()

		go func() {
			i := 0
			for {
				websocket.SendMessage(parsedData[i%len(parsedData)])
				i++
				time.Sleep(3 * time.Second)
			}
		}()
		select {}
	}
}
