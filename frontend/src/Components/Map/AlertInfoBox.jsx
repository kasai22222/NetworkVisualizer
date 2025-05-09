export const AlertInfoBox = ({ data }) => {
  if (data == null) {
    return;
  }
  return (
    // FIXME: Make it look good with word wrapping and max width (max-w-[x] doesn't work)
    <div className="fixed left-0 top-0 bg-gray-600 z-50 p-2 rounded-2xl wrap-anywhere">
      <p>Priority: {data.Alert.Priority}</p>
      <p>Message: {data.Message}</p>
      <p>Source IP: {data.Alert.SrcIp}</p>
      <p>Destination IP: {data.Alert.DstIp}</p>
    </div>
  );
};
