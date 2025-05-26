import { useContext } from "react";
import { DataContext } from "../../context/DataContext";
import { AlertInfoBox } from "./AlertInfoBox";
import generateKey from "./utils/generateKey";

export const MapInfoBox = ({
  currentObjectKey,
  setCurrentObjectKey,
  currentDisplayedData,
  setCurrentDisplayedData,
  setCurrentObjectIndex,
}) => {
  const { data } = useContext(DataContext);

  const prettifyDate = (unixTime) => {
    let date = new Date(unixTime * 1000);
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');

    return `${date.getFullYear()}/${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-2 h-[300px]">
        {/* Current Alert Details */}
        <div className="p-4 border-r border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Alert</h3>
          <AlertInfoBox data={currentDisplayedData} />
        </div>

        {/* Alert History */}
        <div
          className="p-4 overflow-y-auto"
          onMouseLeave={() => setCurrentObjectKey(null)}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Alert History</h3>
          <div className="space-y-2">
            {data && data.length > 0 && data.map((item, i) => {
              let key = generateKey(item);
              let isActiveLog = currentObjectKey === key;

              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg transition-all cursor-pointer
                    ${isActiveLog
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                    } border-2`}
                  onClick={() => {
                    setCurrentObjectIndex(i);
                    setCurrentObjectKey(key);
                    setCurrentDisplayedData(item);
                  }}
                  onMouseEnter={() => {
                    if (currentObjectKey === null) {
                      setCurrentObjectIndex(i);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {prettifyDate(item.Alert.Timestamp)}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {item.Message}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
