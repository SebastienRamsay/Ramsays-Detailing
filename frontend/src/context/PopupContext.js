import React, { createContext, useState } from "react";

const PopupContext = createContext();

function PopupContextProvider(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [service, setServiceToDelete] = useState("Not Working");

  return (
    <PopupContext.Provider
      value={{
        isOpen,
        setIsOpen,
        setServiceToDelete,
        service,
      }}
    >
      {props.children}
    </PopupContext.Provider>
  );
}

export default PopupContext;

export { PopupContextProvider };
