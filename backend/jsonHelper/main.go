package jsonhelper

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
)

func handleJsonError(msg string, err error) error {
	if err != nil {
		return fmt.Errorf("%s: %w", msg, err)
	}
	return nil
}

type Alert struct {
	Timestamp string
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
	Rule      string
	Action    string
	Msg       string
	Iface     string
}

// type alert struct {
// 	Src_addr string
// }

// TODO: Add net.ip instead of string?

func JsonHelper(filePath string) ([]Alert, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return []Alert{}, handleJsonError("Failed to get data", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var alertsJson []Alert
	for scanner.Scan() {
		var data Alert
		err := json.Unmarshal([]byte(scanner.Text()), &data)
		if err != nil {
			fmt.Errorf("ERROR HERE")
			return []Alert{}, fmt.Errorf("Failed to parse json data %w", err)
		}
		alertsJson = append(alertsJson, data)

	}
	// if err := scanner.Err(); err != nil {
	// 	fmt.Println(err)
	// }
	return alertsJson, nil
}
