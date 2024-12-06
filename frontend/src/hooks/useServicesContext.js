import { ServicesContext } from "../context/ServicesContext"
import { useContext } from "react"

export const useServicesContext = () => {
  const context = useContext(ServicesContext)

  if(!context) {
    throw Error('useServicesContext must be used inside a ServicesContextProvider')
  }

  return context
}