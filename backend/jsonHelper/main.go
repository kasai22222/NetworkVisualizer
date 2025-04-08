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

type alert struct {
	Src_addr string
}

func JsonHelper() any {
	file, err := os.Open("alert_json.txt")
	if err != nil {
		handleJsonError("Failed to get data", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var data alert
	for scanner.Scan() {
		err := json.Unmarshal([]byte(scanner.Text()), &data)
		if err != nil {
			fmt.Printf("Could not unmarshall6")
		}

		fmt.Println(data.Src_addr)

	}
	// if err := scanner.Err(); err != nil {
	// 	fmt.Println(err)
	// }
	return nil
}
