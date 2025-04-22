package dataparsing

import (
	"backend/types"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/fsnotify/fsnotify"
)

const maxTries = 10
const stabilisationDuration = 500 * time.Millisecond
const debounceTime = 500 * time.Millisecond

func checkFileIsOk(filePath string) error {
	time.Sleep(stabilisationDuration)
	initialStat, err := os.Stat(filePath)
	if err != nil {
		return err
	}
	time.Sleep(stabilisationDuration)
	finalStat, err := os.Stat(filePath)
	if err != nil {
		return err
	}
	if initialStat.Size() != finalStat.Size() {

	}
	return nil
}

func StartWatchingFiles(filesToWatch []string) (<-chan types.FileChannel, error) {
	changeChan := make(chan types.FileChannel)
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create file watcher: %w", err)
	}
	for _, file := range filesToWatch {
		err := watcher.Add(file)
		if err != nil {
			return nil, fmt.Errorf("failed to start watching file %s : %w", file, err)
		}
	}
	go func() {
		defer watcher.Close()

		var lastEventTime = make(map[string]time.Time)
		var pendingEvents = make(map[string]fsnotify.Event)

		ticker := time.NewTicker(debounceTime)
		defer ticker.Stop()
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					// fmt.Print("HERERERER")
					return
				}
				// fmt.Print("EVENT: ", event.Op)
				if event.Op&(fsnotify.Write|fsnotify.Rename) != 0 {
					pendingEvents[event.Name] = event
					lastEventTime[event.Name] = time.Now()
					// err := checkFileIsOk(event.Name)
					// if err != nil {
					// 	log.Fatal("Failed to parse data file: ", err)
					// }
					// changeChan <- types.FileChannel{FileChange: true, Path: event.Name}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					fmt.Print("ERROR: ", err)
				}
				fmt.Println("Watcher error: ", err)
			case <-ticker.C:
				for filePath := range pendingEvents {
					if time.Since(lastEventTime[filePath]) >= debounceTime {
						err := checkFileIsOk(filePath)
						if err != nil {
							log.Printf("failed to parse data file %s: %v", filePath, err)
						} else {
							changeChan <- types.FileChannel{FileChange: true, Path: filePath}
						}
						delete(pendingEvents, filePath)
						delete(lastEventTime, filePath)
					}
				}
			}
		}
	}()
	return changeChan, nil
}
