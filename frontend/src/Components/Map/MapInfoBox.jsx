import { Clipboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import filterItems from "./ItemFilterer/filterItems";

export const MapInfoBox = ({
  setMapArcs,
  filteredItems,
  setFilteredItems,
  processedData,
  setCurrentDisplayedData,
  currentObjectIndex,
  setCurrentObjectIndex,
  itemFilters,
}) => {
  useEffect(() => {
    setFilteredItems(filterItems(processedData, itemFilters));
  }, [itemFilters, processedData]);

  useEffect(() => {
    const filteredArcs = filterItems(processedData, itemFilters);
    setMapArcs(filteredArcs);
  }, [itemFilters, processedData]);

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

  const checkScroll = (event) => {
    console.log(event.currentTarget.scrollTop);
  };
  return (
    <>
      <div className="grid grid-cols-2 bg-red-100 absolute h-66 bottom-0 w-screen">
        <div className="rounded-2xl bg-black w-full h-full"></div>

        <div
          className="bg-slate-400 overflow-auto flex flex-col p-2 w-full h-full"
          onScroll={(event) => checkScroll(event)}
        >
          {filteredItems.map((item, i) => {
            // FIXME: Check for element and not index as the index of the element will change when new data is added
            let isActiveLog = currentObjectIndex == i ? "brightness-110" : "brightness-100";
            console.log(isActiveLog)
            return (
              <div
                key={i}
                className={`relative flex items-center brightness hover:cursor-pointer ${isActiveLog} bg-slate-400 hover:brightness-105 border-2 border-t-0 first:border-t-2 justify-between w-full`}
              >
                <p
                  onClick={() => {
                    console.log("Clicked on:", i);
                    setCurrentObjectIndex(i);
                    setCurrentDisplayedData(item);
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
