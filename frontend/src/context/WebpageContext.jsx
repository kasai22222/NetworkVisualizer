import { createContext, useState } from 'react'
import { useSearchParams } from 'react-router'

const WebpageContext = createContext({
  isEmbedded: false,
  setIsEmbedded: () => { }
})

const WebpageProvider = ({ children }) => {

  const [queryParams] = useSearchParams();
  const [isEmbedded, setIsEmbedded] = useState(queryParams.get("embedded") ?? false)
  return (<WebpageContext.Provider value={{ isEmbedded, setIsEmbedded }}>{children}</WebpageContext.Provider>)
}

export { WebpageContext, WebpageProvider }
