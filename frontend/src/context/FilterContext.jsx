import { createContext, useEffect, useState } from "react"


const FilterContext = createContext({
  itemFiltererValues: {
    // priority: 0,
    // message: "",
    // startDate: null,
    // endDate: null,
  },
  setItemFiltererValues: () => { }
})

const FilterProvider = ({ children }) => {
  const [itemFiltererValues, setItemFiltererValues] = useState({
    priority: 0,
    message: "",
    startDate: null,
    endDate: null,
  })
  useEffect(() => {
    console.log(itemFiltererValues)
  }, [itemFiltererValues])
  return (
    <FilterContext.Provider value={{ itemFiltererValues: itemFiltererValues, setItemFiltererValues: setItemFiltererValues }}>
      {children}
    </FilterContext.Provider>
  )
}
export { FilterContext, FilterProvider }
