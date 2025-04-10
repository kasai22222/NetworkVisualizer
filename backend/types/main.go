package types

import (
	"backend/geoIpLookup"

	"github.com/oschwald/geoip2-golang"
)

type AlertData struct {
	Coords geoIpLookup.Coordinates
	City   geoip2.City
}
