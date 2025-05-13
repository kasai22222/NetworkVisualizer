package types

import (
	"net"
)

type FileChannel struct {
	FileChange bool
	Path       string
}

type RawAlert struct {
	Timestamp int `json:"seconds"`
	Pkg_num   int
	Proto     string
	Pkg_gen   string
	Pkt_len   int
	Dir       string
	Src_addr  string
	Dst_addr  string
	Eth_dst   string
	Ip_id     int
	Ip_len    int
	Priority  int
	Rule      string
	Action    string
	Msg       string
	Iface     string
}

/*
rule = [

	SrcIp = {
		ParsedAlert
	}

]
*/
type RuleInfo struct {
	Message string
	Stats   map[string]*RuleStats
}

type RuleStats struct {
	Count int
	Alert ParsedAlert
}

type ParsedAlert struct {
	SrcIp          net.IP
	SrcCoords      Coordinates
	DstIp          net.IP
	DstCoords      Coordinates
	Priority       int
	Timestamp      int
	SrcCountryInfo CountryInfo
	DstCountryInfo CountryInfo
	// City   geoip2.City
}

// func (a ParsedAlert) Equals(b ParsedAlert) bool {
// 	return a.SrcIp.Equal(b.SrcIp) && a.DstIp.Equal(b.DstIp) &&
// 		reflect.DeepEqual(a.SrcCoords, b.SrcCoords) && reflect.DeepEqual(a.DstCoords, b.DstCoords)
// }

type Coordinates []float64

type CountryInfo struct {
	IsoCode string
	Name    string
}
