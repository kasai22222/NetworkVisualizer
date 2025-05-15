const dataSortByX = (data, {
  groupBy = "country",
  sortDescending = true,
  topN = null,
}) => {
  const groups = new Map();

  // Helper function to get the key based on groupBy parameter
  const getKey = (item) => {
    switch (groupBy) {
      case 'ip':
        return item.Alert.SrcIp;
      case 'rule':
        return item.Rule;
      case 'priority':
        return item.Alert.Priority;
      case 'country':
        return item.Alert.SrcCountryInfo.IsoCode;
      default:
        return item.Alert.SrcCountryInfo.IsoCode;
    }
  };

  // Group the data
  for (const item of data) {
    const key = getKey(item);
    if (!key) continue; // Skip if key is undefined or null

    const currentCount = groups.get(key) || 0;
    groups.set(key, currentCount + item.Count);
  }

  // Convert to array and sort
  const result = Array.from(groups.entries()).map(([key, value]) => ({
    key,
    value
  }));

  result.sort((a, b) => sortDescending ? b.value - a.value : a.value - b.value);

  // Return top N results if specified
  return topN ? result.slice(0, topN) : result;
};

export default dataSortByX;
