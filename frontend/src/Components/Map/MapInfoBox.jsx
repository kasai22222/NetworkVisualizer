import { Clipboard } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const filterItems = (processedData, { priority, message, startDate, endDate }, debugging, setDebugging) => {
  if (debugging) {
    debugger
    console.log("PRIORITY FILTER: ", priority)
  }
  let items = processedData.filter((item, i) => {

    // if (i < 10) {
    //   oonsole.log(`TIMESTAMP: ${item.Alert.Timestamp}\nDATE: ${new Date(item.Alert.Timestamp)}`)
    // }
    const messageMatch = message == null || item.Message.toLowerCase().includes(message.toLowerCase())
    const priorityMatch =
      priority == null ||
      (item.Alert.Priority >= 1 &&
        item.Alert.Priority <= 10 &&
        item.Alert.Priority === Number(priority));

    // let timestamp = item.Alert.Timestamp
    // const timestampMatch = (startDate == null && endDate == null) ||
    //   (startDate < timestamp && timestamp < endDate)

    return messageMatch && priorityMatch
  })
  setDebugging(false)
  return items

}


const ItemFilterer = ({ setItemFilters, setDebugging }) => {
  const localSetItemFilters = (e) => {
    if (!e) { return }

    let localItemFilters = {}
    localItemFilters["priority"] = e.get("priority")
    localItemFilters["message"] = e.get("message")
    localItemFilters["startDate"] = e.get("startDate")
    localItemFilters["endDate"] = e.get("endDate")
    setItemFilters(localItemFilters)
    setDebugging(true)
  }

  const inputField = (name, type) => {
    return (
      <label className="input input-error"><input className="grow" placeholder={name} name={name} type={type} /></label>
    )
  }
  return (
    <form className="flex flex-col w-96" onSubmit={(e) => {
      e.preventDefault();
      let formData = new FormData(e.target);
      localSetItemFilters(formData)
    }}>
      {inputField("priority", "number")}
      {inputField("message", "text")}
      {inputField("startDate", "date")}
      {inputField("endDate", "date")}

      <label className="input input-lg">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input type="search" className="grow" placeholder="Search" />
        <kbd className="kbd kbd-sm">⌘</kbd>
        <kbd className="kbd kbd-sm">K</kbd>
      </label>
      <button type="submit" className="p-5 bg-blue-800">Submit here</button>
    </form>
  )
}




export const MapInfoBox = ({ filteredItems, setFilteredItems, processedData, setCurrentDisplayedData }) => {
  const [itemFilters, setItemFilters] = useState({
    priority: null,
    message: null,
    startDate: null,
    endDate: null
  })

  const [debugging, setDebugging] = useState(false);
  // FIXME: Filtering Borked
  useEffect(() => {
    setFilteredItems(filterItems(processedData, itemFilters, debugging, setDebugging))
  }, [processedData, itemFilters, debugging])

  useEffect(() => {
    console.log("filtered length:", filteredItems.length)
    console.log(filteredItems)
  }, [filteredItems])


  const prettifyDate = (unixTime) => {
    let date = new Date(unixTime * 1000)
    let minutes
    if (date.getMinutes().toString().length == 1) {
      minutes = "0" + date.getMinutes()
    } else {
      minutes = date.getMinutes()
    }
    let month = date.getMonth() + 1 //NOTE:  date.getMonth return index based date :/

    return `${date.getFullYear()}/${month}/${date.getDate()} - ${date.getHours()}:${minutes}`
  }


  const checkScroll = (event) => {

    console.log(event.currentTarget.scrollTop)
  }



  const [itemIsHovered, setItemIsHovered] = useState(null)
  return (
    <div className='grid grid-cols-2 bg-red-100 absolute h-66 bottom-0 w-screen'>
      <div className='rounded-2xl w-full h-full'>
        <ItemFilterer setItemFilters={setItemFilters} setDebugging={setDebugging} />
      </div>


      <div className='bg-slate-400 overflow-auto flex flex-col p-2 w-full h-full' onScroll={(event) => checkScroll(event)}>
        {filteredItems.map((item, i) => {
          return (
            <div key={i} className='relative flex items-center bg-slate-400 brightness-100 hover:cursor-pointer hover:brightness-105 border-2 border-t-0 first:border-t-2 justify-between w-full'>

              <p onMouseLeave={() => setItemIsHovered(null)} onMouseEnter={() => {
                setItemIsHovered(i)
                setCurrentDisplayedData(item)
              }
              }
                onClick={(event) => {
                  navigator.clipboard.writeText(event.target.textContent)
                  toast("Copied to Clipboard")
                }} className='grow' >{prettifyDate(item.Alert.Timestamp)} {item.Message}</p>
              {itemIsHovered === i && (
                <div className='flex-shrink-0'>
                  <Clipboard />
                </div>
              )}
            </div>
          )
        })}
      </div>


    </div >
  )
}
