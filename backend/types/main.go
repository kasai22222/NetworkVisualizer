package types

import (
	"backend/geoIpLookup"
	"net"
)

type AlertData struct {
	Coords geoIpLookup.Coordinates
	SrcIp  net.IP
	DstIp  net.IP
	// City   geoip2.City
}
