export const AlertInfoBox = ({ data }) => {
  const { Alert, Message } = data
  const { SrcIp, DstIp, Priority } = Alert
  return (
    // FIXME: Make it look good with word wrapping and max width (max-w-[x] doesn't work)
    <div className="flex flex-col p-3 h-full bg-gray-600 rounded-2xl">
      <div className="flex flex-col p-3 h-full bg-gray-600 rounded-2xl">
        <p>Priority: {Priority}</p>
        <p>Message: {Message}</p>
        <p>Source IP: {SrcIp}</p>
        <p>Destination IP: {DstIp}</p>
      </div>
    </div >
  );
};
