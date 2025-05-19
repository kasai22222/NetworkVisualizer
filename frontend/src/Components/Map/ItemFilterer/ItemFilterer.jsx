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
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        // Use formData directly
        localSetItemFilters(new Map(Object.entries(formData)));
      }}
    >
      <label className="input">
        <input
          name="priority"
          type="number"
          placeholder="priority"
          value={formData.priority}
          onChange={handleChange}
        />
      </label>
      <label className="input">
        <input
          name="message"
          type="text"
          placeholder="message"
          value={formData.message}
          onChange={handleChange}
        />
      </label>
      <label className="input">
        <input
          name="startDate"
          type="date"
          placeholder="startDate"
          value={formData.startDate}
          onChange={handleChange}
        />
      </label>
      <label className="input">
        <input
          name="endDate"
          type="date"
          placeholder="endDate"
          value={formData.endDate}
          onChange={handleChange}
        />
      </label>
      <button type="submit" className="bg-neutral-400 btn">
        Filter
      </button>
    </form>
  );
};

export const ItemFilterer = React.memo(({ className = "top-0 right-0 z-50 fixed" }) => {
  /* TODO: Maybe set the filters to the current value of itemFilters*/
  const { itemFiltererValues, setItemFiltererValues } = useContext(FilterContext)
  const localSetItemFilters = (e) => {
    if (!e) {
      return;
    }

    let localItemFilters = {};
    localItemFilters["priority"] = e.get("priority");
    localItemFilters["message"] = e.get("message");
    localItemFilters["startDate"] = e.get("startDate");
    localItemFilters["endDate"] = e.get("endDate");
    setItemFiltererValues(localItemFilters);
  };

  // <button className="btn btn-accent z-[9999] absolute top-0 right-0" onClick={() => toggleDrawer()}></button>
  // <div className={`absolute top-0 right-0 transition-transform duration-150 transform ${isOpen ? '-translate-x-0' : 'translate-x-full'} z-50`}>tejhkjashgkasjhfglkasfhgaksjfhst</div>
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={className}>
      <div
        className={`relative transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer Panel */}
        <div className="bg-transparent max-w-44">
          <ItemFilterMenu itemFiltererValues={itemFiltererValues} localSetItemFilters={localSetItemFilters} />
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute top-0 -left-9 bg-red-300 p-2 rounded shadow hover:bg-red-200 transition"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});
