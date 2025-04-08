package geoIpLookup

import (
	"fmt"
	"net"

	"github.com/oschwald/geoip2-golang"
)

const databaseFilePath string = "./GeoLite2-City.mmdb"

type coordinates struct {
	Latitude  float64
	Longitude float64
}

type GeoIP struct {
	db *geoip2.Reader
}

func handleGeoIpError(msg string, err error) error {
	if err != nil {
		return fmt.Errorf("%s: %w", msg, err)
	}
	return nil
}

func NewGeoIp() (*GeoIP, error) {
	db, err := geoip2.Open(databaseFilePath)
	if err != nil {
		handleGeoIpError("failed to open database", err)
	}
	return &GeoIP{db: db}, nil
}

func parseIp(ip string) (net.IP, error) {
	parsedIp := net.ParseIP(ip)
	if parsedIp == nil {
		return nil, fmt.Errorf("failed to parse IP: %s", ip)
	}
	return parsedIp, nil

}

func (g *GeoIP) GetCity(ip string) (*geoip2.City, error) {
	parsedIp, err := parseIp(ip)
	if err != nil {
		return nil, err
	}

	record, err := g.db.City(parsedIp)
	if err != nil {
		return nil, fmt.Errorf("failed to get city info: %w", err)
	}

	return record, nil
}

func (g *GeoIP) Close() {
	if g.db != nil {
		g.db.Close()
	}
}

func (g *GeoIP) GetCoordinates(ip string) (coordinates, error) {
	parsedIp, err := parseIp(ip)
	if err != nil {
		return coordinates{}, err
	}
	record, err := g.db.City(parsedIp)
	if err != nil {
		return coordinates{}, err
	}

	return coordinates{Latitude: record.Location.Latitude, Longitude: record.Location.Longitude}, nil
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

// 	return result, nil
// }
