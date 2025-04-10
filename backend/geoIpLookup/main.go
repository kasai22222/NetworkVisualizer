package geoIpLookup

import (
	"fmt"
	"log"
	"net"

	"github.com/oschwald/geoip2-golang"
)

const databaseFilePath string = "./GeoLite2-City.mmdb"

type Coordinates struct {
	Latitude  float64
	Longitude float64
}

type GeoIp struct {
	db *geoip2.Reader
}

var geoIpInstance *GeoIp

func init() {
	db, err := geoip2.Open(databaseFilePath)
	if err != nil {
		log.Fatalf("failed to open GeoIp database: %v", err)
	}
	geoIpInstance = &GeoIp{db: db}
}

func handleGeoIpError(err error) error {
	if err != nil {
		return fmt.Errorf("%w", err)
	}
	return nil
}

func parseIp(ip string) (net.IP, error) {
	parsedIp := net.ParseIP(ip)
	if parsedIp == nil {
		return nil, fmt.Errorf("failed to parse IP: %s", ip)
	}
	return parsedIp, nil

}

func GetCity(ip string) (*geoip2.City, error) {
	parsedIp, err := parseIp(ip)
	if err != nil {
		return nil, handleGeoIpError(err)
	}

	record, err := geoIpInstance.db.City(parsedIp)
	if err != nil {
		return nil, handleGeoIpError(err)
	}

	return record, nil
}

func GetCoordinates(ip string) (Coordinates, error) {
	parsedIp, err := parseIp(ip)
	if err != nil {
		return Coordinates{}, err
	}
	record, err := geoIpInstance.db.City(parsedIp)
	if err != nil {
		return Coordinates{}, err
	}

	return Coordinates{Latitude: record.Location.Latitude, Longitude: record.Location.Longitude}, nil
}

// func geoIpLookup(ip string, queryFunc func(*geoip2.Reader, net.IP) (interface{}, error)) (interface{}, error) {

// 	db, err := geoip2.Open(databaseFilePath)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer db.Close()

// 	parsedIp := net.ParseIP(ip)
// 	if parsedIp == nil {
// 		return nil, fmt.Errorf("invalid IP adress: %s", ip)
// 	}

// 	result, err := queryFunc(db, parsedIp)
// 	if err != nil {
// 		return nil, err
// 	}

//		return result, nil
//	}
func (g *GeoIp) Close() {
	if geoIpInstance.db != nil {
		geoIpInstance.db.Close()
	}
}
