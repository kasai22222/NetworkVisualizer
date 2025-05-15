import { Clipboard } from "lucide-react";
import { useEffect } from "react";
import { AlertInfoBox } from "./AlertInfoBox";
import filterItems from "./ItemFilterer/filterItems";
import generateKey from "./utils/generateKey";

export const MapInfoBox = ({
  currentObjectKey,
  setCurrentObjectKey,
  filteredItems,
  setFilteredItems,
  data,
  currentDisplayedData,
  setCurrentDisplayedData,
  currentObjectIndex,
  setCurrentObjectIndex,
  itemFilters,
}) => {
  useEffect(() => {
    setFilteredItems(filterItems(data, itemFilters));
  }, [itemFilters, data]);



  useEffect(() => {
    console.log("filtered length:", filteredItems.length);
    console.log(filteredItems);
  }, [filteredItems]);

  const prettifyDate = (unixTime) => {
    let date = new Date(unixTime * 1000);
    let minutes;
    if (date.getMinutes().toString().length == 1) {
      minutes = "0" + date.getMinutes();
    } else {
      minutes = date.getMinutes();
    }
    let month = date.getMonth() + 1; //NOTE:  date.getMonth return index based date :/

    return `${date.getFullYear()}/${month}/${date.getDate()} - ${date.getHours()}:${minutes}`;
  };

  return (
    <>
      <div className="flex bg-slate-400 rounded-2xl absolute h-66 bottom-5 w-screen">
        <div className="w-full h-full">
          <AlertInfoBox data={currentDisplayedData} />
        </div>
        {/* TODO: Make the bar look better  */}
        <div className="divider rounded-2xl divider-horizontal  divider-neutral"></div>
        <div
          className="bg-slate-400 rounded-2xl overflow-auto flex flex-col w-full h-full"
          onMouseLeave={() => setCurrentObjectKey(null)}
        >
          {filteredItems && filteredItems.length > 0 && filteredItems.map((item, i) => {
            // FIXME: Check for element and not index as the index of the element will change when new data is added
            let key = generateKey(item)
            let isActiveLog = currentObjectKey == key
            let classNames = isActiveLog ? "brightness-110 border-red-400 border-t-2" : "brightness-100";
            return (
              <div
                key={i}
                className={`relative flex items-center brightness hover:cursor-pointer ${classNames} bg-slate-400 hover:brightness-105 border-2 border-t-0 first:border-t-2 rounded-2xl justify-between w-full`}
              >
                <p
                  onClick={() => {
                    console.log("Clicked on:", i);
                    setCurrentObjectIndex(i);
                    setCurrentObjectKey(key)
                    setCurrentDisplayedData(item);

                  }}
                  onMouseEnter={() => {
                    console.log(isActiveLog)
                    console.log(key)
                    if (currentObjectKey == null) {
                      setCurrentObjectIndex(i)
                    }
                  }}
                >
                  {prettifyDate(item.Alert.Timestamp)} {item.Message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
