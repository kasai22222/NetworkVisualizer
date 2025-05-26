import whyDidYouRender from "@welldone-software/why-did-you-render";
import { Filter } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import "react-modern-drawer/dist/index.css";
import { FilterContext } from "../../../context/FilterContext";

const ItemFilterMenu = ({ itemFiltererValues, localSetItemFilters }) => {
  const [formData, setFormData] = useState({
    priority: itemFiltererValues.priority || "",
    message: itemFiltererValues.message || "",
    startDate: itemFiltererValues.startDate || "",
    endDate: itemFiltererValues.endDate || "",
  });

  // Update local state if context changes (optional, for sync)
  useEffect(() => {
    setFormData({
      priority: itemFiltererValues.priority || "",
      message: itemFiltererValues.message || "",
      startDate: itemFiltererValues.startDate || "",
      endDate: itemFiltererValues.endDate || "",
    });
  }, [itemFiltererValues]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form
      className="p-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        localSetItemFilters(new Map(Object.entries(formData)));
      }}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <input
          name="priority"
          type="number"
          placeholder="Enter priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <input
          name="message"
          type="text"
          placeholder="Enter message"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply Filters
      </button>
    </form>
  );
};

export const ItemFilterer = React.memo(({ className = "" }) => {
  const { itemFiltererValues, setItemFiltererValues } = useContext(FilterContext);
  const [isOpen, setIsOpen] = useState(true);

  const localSetItemFilters = (e) => {
    if (!e) return;

    let localItemFilters = {
      priority: e.get("priority"),
      message: e.get("message"),
      startDate: e.get("startDate"),
      endDate: e.get("endDate")
    };
    setItemFiltererValues(localItemFilters);
  };

  return (
    <div className={className}>
      <div
        className={`relative transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <ItemFilterMenu
            itemFiltererValues={itemFiltererValues}
            localSetItemFilters={localSetItemFilters}
          />
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute top-4 -left-10 p-2 bg-white rounded-l-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
});
