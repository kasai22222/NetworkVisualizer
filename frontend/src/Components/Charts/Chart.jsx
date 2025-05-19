import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";
import { FilterContext } from "../../context/FilterContext";
import { WebpageContext } from "../../context/WebpageContext";
import { ItemFilterer } from "../Map/ItemFilterer/ItemFilterer";
import dataSortByX from "./dataSorting";

export const LocalChart = ({ children }) => {
  const [sortingSettings, setSortingSettings] = useState({
    groupBy: "country",
    sortDescending: true,
    topN: 5,
  });
  const { data } = useContext(DataContext)
  const handleSortChange = (e) => {
    setSortingSettings((prev) => ({
      ...prev,
      groupBy: e.target.value,
    }));
  };

  const handleSortDirectionChange = (e) => {
    setSortingSettings((prev) => ({
      ...prev,
      sortDescending: e.target.value === "descending",
    }));
  };

  const handleTopNChange = (e) => {
    const value = e.target.value === "all" ? null : parseInt(e.target.value);
    setSortingSettings((prev) => ({
      ...prev,
      topN: value,
    }));
  };

  const sortedData = dataSortByX(data, sortingSettings);
  console.log(sortedData)
  const SortByMenu = () => {
    return (
      <>
        <div className="absolute bg-black p-1 top-0 left-0 z-50">
          <select
            value={sortingSettings.groupBy}
            onChange={handleSortChange}
            className="p-2 border rounded"
          >
            <option value="country">Country</option>
            <option value="ip">IP</option>
            <option value="rule">Rule</option>
            <option value="priority">Priority level</option>
          </select>

          <select
            value={sortingSettings.sortDescending ? "descending" : "ascending"}
            onChange={handleSortDirectionChange}
            className="p-2 border rounded"
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>

          <select
            value={sortingSettings.topN || "all"}
            onChange={handleTopNChange}
            className="p-2 border rounded"
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">All</option>
          </select>
        </div>
      </>
    )
  }
  {/* <ResponsiveContainer> */ }
  {/* <PieChart> */ }
  {/*   <Pie */ }
  {/*     data={sortedData} */ }
  {/*     dataKey={"value"} */ }
  {/*     cx="50%" */ }
  {/*     cy="50%" */ }
  {/*     label={}></Pie> */ }
  {/* </PieChart> */ }
  {/* </ResponsiveContainer> */ }

  const { isEmbedded } = useContext(WebpageContext)
  if (isEmbedded === true) {
    return React.Children.map(children, (child) => {
      return React.cloneElement(child, { sortedData })
    }
    )
  }
  else {
    return (
      <>
        <SortByMenu />
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, { sortedData })
        })}
      </>
    )
  }
};
