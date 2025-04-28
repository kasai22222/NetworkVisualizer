package debugging

import "backend/types"

func CountCount(data map[string]*types.RuleInfo) int {
	count := 0
	for _, val := range data {
		for _, val2 := range val.Stats {
			count = count + val2.Count
		}
	}
	return count
}
