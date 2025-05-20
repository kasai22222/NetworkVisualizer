import { createContext, useState } from 'react'
import { useSearchParams } from 'react-router'

const WebpageContext = createContext({
  isEmbedded: false,
  setIsEmbedded: () => { }
})

const WebpageProvider = ({ children }) => {

  const [queryParams] = useSearchParams();
  console.log(`PARAMS: ${queryParams}`)
  let _isEmbedded = queryParams.has("embedded") && queryParams.get("embedded")?.toLowerCase() === "true";
  const [isEmbedded, setIsEmbedded] = useState(_isEmbedded)
  return (<WebpageContext.Provider value={{ isEmbedded, setIsEmbedded }}>{children}</WebpageContext.Provider>)
}

export { WebpageContext, WebpageProvider }
