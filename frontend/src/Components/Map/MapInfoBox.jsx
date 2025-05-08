import { Clipboard } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { ItemFilterer } from "./ItemFilterer/ItemFilterer"

const filterItems = (processedData, itemFilters) => {
  const { priority, message, startDate, endDate } = itemFilters
  if (priority == 0 && message == "" && startDate == null && endDate == null) {
    return processedData
  }
  let items = processedData.filter((item) => {

    const messageMatch = message == "" || item.Message.toLowerCase().includes(message.toLowerCase())

    const priorityMatch =
      (priority == null || priority == "") ||
      (
        item.Alert.Priority >= 1 &&
        item.Alert.Priority <= 10 &&
        item.Alert.Priority === Number(priority)
      );

    const timestamp = item.Alert.Timestamp
    const startDateUnix = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : null;
    const endDateUnix = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : null;

    const timestampMatch = (startDateUnix == null && endDateUnix == null) ||
      (startDateUnix < timestamp && timestamp < endDateUnix)



    const matchesAll = messageMatch && priorityMatch && timestampMatch
    return matchesAll
  })
  return items

}


export const MapInfoBox = ({ filteredItems, setFilteredItems, processedData, setCurrentDisplayedData }) => {
  const [itemFilters, setItemFilters] = useState({
    priority: 0,
    message: "",
    startDate: null,
    endDate: null
  })

  useEffect(() => {
    setFilteredItems(filterItems(processedData, itemFilters))
  }, [processedData, itemFilters, setFilteredItems])

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
    <>
      <ItemFilterer setItemFilters={setItemFilters} />
      <div className='grid grid-cols-2 bg-red-100 absolute h-66 bottom-0 w-screen'>
        <div className='rounded-2xl bg-black w-full h-full'>

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
    </>
  )
}
