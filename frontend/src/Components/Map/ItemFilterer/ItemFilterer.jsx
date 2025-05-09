import { Filter } from "lucide-react";
import { useState } from "react";
import "react-modern-drawer/dist/index.css";
import "./index.css";

const ItemFilterMenu = ({ localSetItemFilters }) => {
  const inputField = (name, type) => {
    return (
      <label className="input">
        <input className="" placeholder={name} name={name} type={type} />
      </label>
    );
  };
  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        let formData = new FormData(e.target);
        localSetItemFilters(formData);
      }}
    >
      {inputField("priority", "number")}
      {inputField("message", "text")}
      {inputField("startDate", "date")}
      {inputField("endDate", "date")}

      <button type="submit" className="bg-neutral-400 btn">
        Filter
      </button>
    </form>
  );
};

export const ItemFilterer = ({ setItemFilters }) => {
  /* TODO: Maybe set the filters to the current value of itemFilters*/
  const localSetItemFilters = (e) => {
    if (!e) {
      return;
    }

    let localItemFilters = {};
    localItemFilters["priority"] = e.get("priority");
    localItemFilters["message"] = e.get("message");
    localItemFilters["startDate"] = e.get("startDate");
    localItemFilters["endDate"] = e.get("endDate");
    setItemFilters(localItemFilters);
  };

  // <button className="btn btn-accent z-[9999] absolute top-0 right-0" onClick={() => toggleDrawer()}></button>
  // <div className={`absolute top-0 right-0 transition-transform duration-150 transform ${isOpen ? '-translate-x-0' : 'translate-x-full'} z-50`}>tejhkjashgkasjhfglkasfhgaksjfhst</div>
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed top-0 right-0 z-50">
      <div
        className={`relative transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer Panel */}
        <div className="bg-transparent max-w-44">
          <ItemFilterMenu localSetItemFilters={localSetItemFilters} />
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
};
