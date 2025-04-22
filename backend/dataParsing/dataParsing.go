package dataparsing

//
// import (
//
//	"backend/types"
//	"log"
//	"sync"
//
//	"github.com/nxadm/tail"
//
// )
//
// // 	if err != nil {
// // 		log.Printf("Error processing json line %s: %v", line, err)
// // 	}
// // 	parsedAlert, err := parseData(*rawAlert)
// // 	if err != nil {
// // 		log.Printf("Error parsing raw alert: %v", err)
// // 	}
// // 	dataMutex.Lock()
// // 	UpdateParsedData(parsedData, rawAlert, parsedAlert, initialLoad)
// // 	dataMutex.Unlock()
// // }
//
// // func readFile(filePath string, parsedData map[string]*types.RuleInfo, dataMutex *sync.Mutex, initialLoadComplete bool) {
// // 	if initialLoadComplete {
// // 		t, err := tail.TailFile(filePath, tail.Config{
// // 			Follow:    true,
// // 			ReOpen:    true,
// // 			MustExist: true,
// // 			Location:  &tail.SeekInfo{Offset: 0, Whence: os.SEEK_END},
// // 		})
// // 		if err != nil {
// // 			log.Fatalf("Error tailing file %s: %v", filePath, err)
// // 		}
// //
// // 	}
// // }
//
// // TODO: Add net.ip instead of string?
//
//	func watchAndAppend(filePath string, parsedData map[string]*types.RuleInfo, dataMutex *sync.Mutex) {
//		t, err := tail.TailFile(filePath, tail.Config{
//			Follow:    true,
//			ReOpen:    true,
//			MustExist: true,
//			// Poll:      true,
//		})
//		if err != nil {
//			log.Fatalf("Error tailing file %s: %v", filePath, err)
//			return
//		}
//		processedLines := make(map[string]bool)
//
//		for line := range t.Lines {
//			if line.Err != nil {
//				log.Printf("Error reading line from %s: %v", filePath, line.Err)
//				continue
//			}
//			if processedLines[line.Text] {
//				// log.Printf("Skipping processed Line: %s", line.Text)
//				continue
//			}
//			processedLines[line.Text] = true
//			rawAlert, err := decodeJsonLine(line.Text)
//			if err != nil {
//				log.Printf("Error decoding json line: %v", err)
//				continue
//			}
//			parsedAlert, err := parseData(*rawAlert)
//			if err != nil {
//				log.Printf("Error parsing raw alert: %v", err)
//				continue
//			}
//			dataMutex.Lock()
//			if _, ok := parsedData[rawAlert.Rule]; !ok {
//				parsedData[rawAlert.Rule] = &types.RuleInfo{
//					Message: rawAlert.Msg,
//					Stats:   make(map[string]*types.RuleStats),
//				}
//			}
//			ruleInfo := parsedData[rawAlert.Rule]
//			srcIpString := parsedAlert.SrcIp.String()
//			if _, ok := ruleInfo.Stats[srcIpString]; !ok {
//				ruleInfo.Stats[srcIpString] = &types.RuleStats{
//					Count: 0,
//					Alert: parsedAlert,
//				}
//			}
//			ruleInfo.Stats[srcIpString].Count++
//			dataMutex.Unlock()
//		}
//	}
//
//	func StartWatching(filePath string, parsedData map[string]*types.RuleInfo, dataMutex *sync.Mutex) {
//		go watchAndAppend(filePath, parsedData, dataMutex)
//	}
