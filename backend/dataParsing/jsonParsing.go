package dataparsing

import (
	"backend/types"
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

// type alert struct {
// 	Src_addr string
// }

// TODO: Add net.ip instead of string?

func JsonHelper(filePath string) ([]types.RawAlert, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return []types.RawAlert{}, handleJsonError("Failed to get data", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var alertsJson []types.RawAlert
	for scanner.Scan() {
		var data types.RawAlert
		err := json.Unmarshal([]byte(scanner.Text()), &data)
		if err != nil {
			fmt.Errorf("ERROR HERE")
			return []types.RawAlert{}, fmt.Errorf("Failed to parse json data %w", err)
		}
		alertsJson = append(alertsJson, data)

	}
	// if err := scanner.Err(); err != nil {
	// 	fmt.Println(err)
	// }
	return alertsJson, nil
}
