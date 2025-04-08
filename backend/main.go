package main

import jsonhelper "backend/jsonHelper"

func main() {
	// var testIp string = "174.211.227.158"
	// // // fmt.Println(geoIpLookup.GetGeoip())
	// // fmt.Print(geoIpLookup.GetCoordinates(testIp))
	// geoIp, err := geoIpLookup.NewGeoIp()
	// if err != nil {
	// 	log.Fatal("Error initializing GeoIp:", err)
	// }
	// defer geoIp.Close()

	// coordinates, err := geoIp.GetCoordinates(testIp)
	// if err != nil {
	// 	log.Fatal("Could not get city info", err)
	// }
	// fmt.Println(coordinates)
	jsonhelper.JsonHelper()
}
