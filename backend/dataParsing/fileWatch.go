package dataparsing

import (
	"backend/types"
	"fmt"
	"time"

	"github.com/fsnotify/fsnotify"
)

func WatchFile(fileToWatch []string) (<-chan types.FileChannel, error) {
	changeChan := make(chan types.FileChannel)
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("Failed to create file watcher: %w", err)
	}
	for _, val := range fileToWatch {
		err := watcher.Add(val)
		if err != nil {
			return nil, fmt.Errorf("Error adding file to watch. File: %s. %w", val, err)
		}
	}
	go func() {
		defer watcher.Close()
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				fmt.Println("Event: ", event)
				if event.Op&(fsnotify.Write|fsnotify.Create|fsnotify.Rename) != 0 {
					time.Sleep(10000)
					changeChan <- types.FileChannel{FileChange: true, Path: event.Name}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Println("Watcher error: ", err)
			}
		}
	}()
	return changeChan, nil
}
