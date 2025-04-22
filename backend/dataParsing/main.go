package dataparsing

import (
	"backend/geoIpLookup"
	"backend/types"
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
)

var processedLineCount = 0

// Function to decode a line of json
func decodeJsonToRawAlert(line string) (*types.RawAlert, error) {

	var data types.RawAlert
	err := json.Unmarshal([]byte(line), &data)
	if err != nil {
		return &types.RawAlert{}, fmt.Errorf("failed to parse json data %w", err)
	}
	return &data, nil
}

// Function that takes in a RawAlert type and parses the data into it's different required fields
func parseJsonData(data types.RawAlert) (types.ParsedAlert, error) {
	var parsedData types.ParsedAlert

	parsedData.SrcIp = net.ParseIP(data.Src_addr)
	parsedData.DstIp = net.ParseIP(data.Dst_addr)

	srcCoords, err := geoIpLookup.GetCoordinates(parsedData.SrcIp)
	if err != nil {
		return parsedData, fmt.Errorf("failed to get source coords %v", err)
	}
	parsedData.SrcCoords = srcCoords
	dstCoords, err := geoIpLookup.GetCoordinates(parsedData.DstIp)
	if err != nil {
		return parsedData, fmt.Errorf("failed to get destination coords %v", err)
	}
	parsedData.DstCoords = dstCoords

	parsedData.Priority = data.Priority
	parsedData.Timestamp = data.Timestamp
	return parsedData, nil

}

// Function that will take a json line and return a parsed alert, msg, and rule
// TODO: find a better way to return the msg and rule
func processJsonLine(line string) (types.ParsedAlert, string, string, error) {
	var parsedAlert types.ParsedAlert
	rawAlert, err := decodeJsonToRawAlert(line)
	if err != nil {
		return parsedAlert, "", "", fmt.Errorf("failed to decode json: %v", err)
	}
	parsedData, err := parseJsonData(*rawAlert)
	if err != nil {
		return parsedAlert, "", "", fmt.Errorf("failed to parse data: %v", err)
	}
	return parsedData, rawAlert.Msg, rawAlert.Rule, nil

}

func readFile(filePath string) ([]string, error) {
	var readLines []string
	// var lineStart int = 0
	// if len(lineStartNumber) > 0 {
	// 	lineStart = lineStartNumber[0]
	// }
	file, err := os.Open(filePath)
	if err != nil {
		return []string{}, fmt.Errorf("failed to open file %s: %v", filePath, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNumber := 0

	for scanner.Scan() {
		lineNumber++
		if processedLineCount >= lineNumber {
			continue
		}
		// fmt.Printf("Bigger than processedLineCount:\nProcessed: %d\nLine Number: %d", processedLineCount, lineNumber)
		line := scanner.Text()
		readLines = append(readLines, line)
	}
	fmt.Println("Previous processed line count: ", processedLineCount)
	processedLineCount = processedLineCount + len(readLines)
	fmt.Println("Current processed line count: ", processedLineCount)
	return readLines, nil
}

func updateDataMap(dataMap map[string]*types.RuleInfo, rule string, msg string, parsedAlert types.ParsedAlert) {
	if _, ok := dataMap[rule]; !ok {
		dataMap[rule] = &types.RuleInfo{
			Message: msg,
			Stats:   map[string]*types.RuleStats{},
		}
	}
	srcIp := parsedAlert.SrcIp.String()
	if stats, exists := dataMap[rule].Stats[srcIp]; exists {
		stats.Count++
	} else {
		dataMap[rule].Stats[srcIp] = &types.RuleStats{
			Count: 1,
			Alert: parsedAlert,
		}
	}
}

func ProcessData(filePath string, processedData map[string]*types.RuleInfo) (map[string]*types.RuleInfo, error) {
	currentProcessedData := make(map[string]*types.RuleInfo)
	jsonLines, err := readFile(filePath)
	if err != nil {
		return currentProcessedData, fmt.Errorf("failed to process data for file %s: %v", filePath, err)
	}
	for _, jsonLine := range jsonLines {
		parsedAlert, msg, rule, err := processJsonLine(jsonLine)
		if err != nil {
			return currentProcessedData, fmt.Errorf("failed to process json line:\n%s\n%v", jsonLine, err)
		}
		updateDataMap(currentProcessedData, rule, msg, parsedAlert)
		updateDataMap(processedData, rule, msg, parsedAlert)
		// if _, ok := currentProcessedData[rule]; !ok {
		// 	currentProcessedData[rule] = &types.RuleInfo{
		// 		Message: msg,
		// 		Stats:   map[string]*types.RuleStats{},
		// 	}
		// }
		// srcIp := parsedAlert.SrcIp.String()
		// stats, exists := currentProcessedData[rule].Stats[srcIp]
		// if exists {
		// 	stats.Count++
		// } else {
		// 	currentProcessedData[rule].Stats[srcIp] = &types.RuleStats{
		// 		Count: 1,
		// 		Alert: parsedAlert,
		// 	}
		// }
	}
	return currentProcessedData, nil
	// parsedAlert, msg, rule, err := processJsonLine(jsonLines)
}
