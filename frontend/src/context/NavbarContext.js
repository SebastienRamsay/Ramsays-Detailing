import { createContext, useState } from "react";

const NavbarContext = createContext();

function NavbarContextProvider(props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <NavbarContext.Provider value={{ mobileNavOpen, setMobileNavOpen }}>
      {props.children}
    </NavbarContext.Provider>
  );
}

export default NavbarContext;

export { NavbarContextProvider };
