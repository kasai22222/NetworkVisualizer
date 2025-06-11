import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";
import { WebpageContext } from "../../context/WebpageContext";
import dataSortByX from "./dataSorting";

const ChartControls = ({ sortingSettings, onSortChange, onSortDirectionChange, onTopNChange }) => {
  return (
    <div className="absolute bg-black p-1 top-0 left-0 z-50">
      <select
        value={sortingSettings.groupBy}
        onChange={onSortChange}
        className="p-2 border rounded"
      >
        <option value="country">Country</option>
        <option value="ip">IP</option>
        <option value="rule">Rule</option>
        <option value="priority">Priority level</option>
      </select>

      <select
        value={sortingSettings.sortDescending ? "descending" : "ascending"}
        onChange={onSortDirectionChange}
        className="p-2 border rounded"
      >
        <option value="descending">Descending</option>
        <option value="ascending">Ascending</option>
      </select>

      <select
        value={sortingSettings.topN || "all"}
        onChange={onTopNChange}
        className="p-2 border rounded"
      >
        <option value="5">Top 5</option>
        <option value="10">Top 10</option>
        <option value="20">Top 20</option>
        <option value="all">All</option>
      </select>
    </div>
  );
};

export const LocalChart = ({ className, children, type = "bar" }) => {
  const [sortingSettings, setSortingSettings] = useState({
    groupBy: "country",
    sortDescending: true,
    topN: 5,
  });

  const { data } = useContext(DataContext);
  const { isEmbedded } = useContext(WebpageContext);

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

  return (
    <div className={`relative h-full ${className}`}>
      {!isEmbedded && (
        <ChartControls
          sortingSettings={sortingSettings}
          onSortChange={handleSortChange}
          onSortDirectionChange={handleSortDirectionChange}
          onTopNChange={handleTopNChange}
        />
      )}
      <div className="h-full ${className}">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          sortedData,
          type
        });
      })}
    </div>
    </div >
  );
};