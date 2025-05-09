function dateToUnixSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

const filterItems = (processedData, itemFilters) => {
  const { priority, message, startDate, endDate } = itemFilters;
  if (priority == 0 && message == "" && startDate == null && endDate == null) {
    return processedData;
  }
  let items = processedData.filter((item) => {
    const messageMatch =
      message == "" ||
      item.Message.toLowerCase().includes(message.toLowerCase());

    const priorityMatch =
      priority == null ||
      priority == "" ||
      (item.Alert.Priority >= 1 &&
        item.Alert.Priority <= 10 &&
        item.Alert.Priority === Number(priority));

    const timestamp = item.Alert.Timestamp;
    const startDateUnix = startDate
      ? dateToUnixSeconds(new Date(startDate))
      : null;
    const endDateUnix = endDate ? dateToUnixSeconds(new Date(endDate)) : null;

    const timestampMatch =
      (startDateUnix == null && endDateUnix == null) ||
      (startDateUnix < timestamp && timestamp < endDateUnix);

    const matchesAll = messageMatch && priorityMatch && timestampMatch;
    return matchesAll;
  });
  return items;
};

export default filterItems;
