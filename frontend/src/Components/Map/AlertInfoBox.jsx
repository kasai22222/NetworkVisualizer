import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const AlertInfoBox = ({ data }) => {
  const { Alert, Message } = data;
  const { SrcIp, DstIp, Priority } = Alert;
  const [copiedField, setCopiedField] = useState(null);

  const getPriorityColor = (priority) => {
    if (priority >= 7) return 'text-red-500';
    if (priority >= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleCopy = async (text, field) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());
      setCopiedField(field);
      toast.success(`Copied ${field} to clipboard`, {
        position: "top-right",
        autoClose: 1100,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      setTimeout(() => setCopiedField(null), 1100);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard', {
        position: "top-right",
        autoClose: 1100,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const CopyButton = ({ text, field }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1 hover:bg-gray-200 rounded-md transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm">
      <div className="p-4 space-y-4">
        {/* Priority Section */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Priority</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${getPriorityColor(Priority)}`}>
              {Priority}
            </span>
            <CopyButton text={Priority} field="priority" />
          </div>
        </div>

        {/* Message Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Message</span>
            <CopyButton text={Message} field="message" />
          </div>
          <p className="text-gray-800 break-words">{Message}</p>
        </div>

        {/* IP Addresses Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Source IP</span>
              <CopyButton text={SrcIp} field="source IP" />
            </div>
            <p className="text-gray-800 font-mono text-sm break-all">{SrcIp}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Destination IP</span>
              <CopyButton text={DstIp} field="destination IP" />
            </div>
            <p className="text-gray-800 font-mono text-sm break-all">{DstIp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
