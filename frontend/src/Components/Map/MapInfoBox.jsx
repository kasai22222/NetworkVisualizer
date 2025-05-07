import { Clipboard } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"


const filterItems = (processedData, { priority, message, startDate, endDate }, debugging = false) => {
  if (debugging) {
    debugger;
  }
  let items = processedData.filter((item) => {
    // if (i < 10) {
    //   oonsole.log(`TIMESTAMP: ${item.Alert.Timestamp}\nDATE: ${new Date(item.Alert.Timestamp)}`)
    // }
    const messageMatch = message == null || item.Message.toLowerCase().includes(message.toLowerCase())
    const priorityMatch =
      priority == null ||
      (item.Alert.Priority >= 1 &&
        item.Alert.Priority <= 10 &&
        item.Alert.Priority === priority);

    // let timestamp = item.Alert.Timestamp
    // const timestampMatch = (startDate == null && endDate == null) ||
    //   (startDate < timestamp && timestamp < endDate)

    return messageMatch && priorityMatch
  })

  return items

}


const ItemFilterer = ({ setItemFilters }) => {
  const localSetItemFilters = (e) => {
    if (!e) { return }
    console.log(e)
    let localItemFilters = {}
    localItemFilters["priority"] = e.get("priority")
    localItemFilters["message"] = e.get("message")
    localItemFilters["startDate"] = e.get("startDate")
    localItemFilters["endDate"] = e.get("endDate")
    setItemFilters(localItemFilters)
  }
  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        let formData = new FormData(e.target);
        localSetItemFilters(formData)
      }}>
        <input name="priority" type={"number"} />
        <input name="message" type={"text"} />
        <input name="startDate" type={"date"} />
        <input name="endDate" type={"date"} />
        <button type="submit" className="p-5 bg-blue-800">Submit here</button>
      </form>
    </>
  )
}

export const MapInfoBox = ({ processedData }) => {
  const [filteredItems, setFilteredItems] = useState(processedData.sort((a, b) => {
    return b.Alert.Timestamp - a.Alert.Timestamp
  }))
  const [itemFilters, setItemFilters] = useState({
    priority: null,
    message: null,
    startDate: null,
    endDate: null
  })
  // FIXME: Filtering Borked
  useEffect(() => {
    setFilteredItems(filterItems(processedData, itemFilters))
  }, [processedData, itemFilters])

  useEffect(() => {
    console.log("filtered length:", filteredItems.length)
  }, [processedData])


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
    <div className='grid grid-cols-2 absolute h-66 bottom-0 bg-red-500 w-screen'>
      <div className='bg-gray-400 border-2 rounded-2xl w-full h-full'>
        <div className=''>
          <ItemFilterer setItemFilters={setItemFilters} />
        </div>
      </div>



      <div className='bg-slate-400 overflow-auto flex flex-col p-2 w-full h-full' onScroll={(event) => checkScroll(event)}>
        {filteredItems.map((item, i) => {
          return (
            <div key={i} className='flex items-center bg-slate-400 brightness-100 hover:cursor-pointer hover:brightness-105 border-2 border-t-0 first:border-t-2 justify-between w-full'>
              <p onMouseLeave={() => setItemIsHovered(null)} onMouseEnter={() => setItemIsHovered(i)} onClick={(event) => {
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
