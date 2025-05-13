const generateKey = (item) => {
  return `${item.Alert.Timestamp}-${item.Alert.SrcIp}-${item.Alert.DstIp}-${item.Rule}-${item.Message}-${item.Alert.Priority}`
}

export default generateKey
