package main

import (
	"backend/geoIpLookup"
	jsonhelper "backend/jsonHelper"
	"backend/types"
	"backend/websocket"
	"fmt"
	"log"
	"net"
	"time"
)

// "backend/websocket"

func parseData(data jsonhelper.Alert) (types.AlertData, error) {
	var parsedData types.AlertData
	// test, err := geoIpLookup.GetCity(data.Src_addr)
	// if err != nil {
	// 	return types.AlertData{}, err
	// }
	// parsedData.City = *test
	parsedData.SrcIp = net.ParseIP(data.Src_addr)
	parsedData.DstIp = net.ParseIP(data.Dst_addr)
	coords, err := geoIpLookup.GetCoordinates(data.Src_addr)
	if err != nil {
		log.Fatal("Failed to get coords", err)
	}
	parsedData.Coords = coords
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
		// var coords []geoIpLookup.Coordinates
		__, err := parseData(value)
		if err != nil {
			log.Fatal("Failed to parse data")
		}
		parsedData = append(parsedData, __)
	}
	fmt.Println(parsedData)
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
