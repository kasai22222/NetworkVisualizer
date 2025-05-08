import { Filter } from "lucide-react"
import { useEffect, useState } from "react"
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import './index.css'



export const ItemFilterer = ({ itemFilters, setItemFilters }) => {
  const [isOpen, setIsOpen] = useState(true)
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState)
  }

  const localSetItemFilters = (e) => {
    if (!e) { return }

    let localItemFilters = {}
    localItemFilters["priority"] = e.get("priority")
    localItemFilters["message"] = e.get("message")
    localItemFilters["startDate"] = e.get("startDate")
    localItemFilters["endDate"] = e.get("endDate")
    setItemFilters(localItemFilters)
  }

  const inputField = (name, type) => {
    return (
      <label className="input"><input className="grow" placeholder={name} name={name} type={type} /></label>
    )
  }
  // <button className="btn btn-accent z-[9999] absolute top-0 right-0" onClick={() => toggleDrawer()}></button>
  // <div className={`absolute top-0 right-0 transition-transform duration-150 transform ${isOpen ? '-translate-x-0' : 'translate-x-full'} z-50`}>tejhkjashgkasjhfglkasfhgaksjfhst</div>

  // return (
  //   <div className="fixed top-0 left-0 h-full z-50 flex items-start">
  //     {/* Button stays outside the sliding drawer */}
  //
  //     {/* Sliding content */}
  //     <div
  //       className={`flex transition-transform duration-150 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
  //     >
  //       <div className="bg-red-500 p-4">
  //         <p>test</p>
  //       </div>
  //     </div>
  //     <button
  //       className={`w-10 h-10 bg-blue-500 text-white transition-transform duration-150 ${isOpen ? 'translate-x-full' : 'translate-x-0'} absolute`}
  //       onClick={toggleDrawer}
  //     >
  //       {isOpen ? '→' : '←'}
  //     </button>
  //
  //   </div>
  //
  // )
  return (
    <div className="relative z-50">
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction='right'
        overlayOpacity={0}
        zIndex={10}
      >
        <div className="fixed -left-10 px-2 py-1 rounded bg-red-800"><Filter /></div>
        <form className="flex absolute flex-col" onSubmit={(e) => {
          e.preventDefault();
          let formData = new FormData(e.target);
          localSetItemFilters(formData)
        }}>
          {inputField("priority", "number")}
          {inputField("message", "text")}
          {inputField("startDate", "date")}
          {inputField("endDate", "date")}


          <button type="submit" className="p-1 bg-neutral-400 btn">Filter</button>
        </form>

      </Drawer>
    </div>
  )
}


