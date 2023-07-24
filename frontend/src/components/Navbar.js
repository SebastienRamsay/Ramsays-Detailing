import { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";
import NavbarContext from "../context/NavbarContext";
import LogOutBtn from "./LogOutBtn";

const Navbar = () => {
  const { loggedIn } = useContext(AuthContext);
  const { cartLength } = useContext(CartContext);
  const { mobileNavOpen, setMobileNavOpen } = useContext(NavbarContext);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileNavOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <header className="relative bg-primary-0 py-11 text-white lg:h-[150px]">
      <nav className="" ref={menuRef}>
        <Link to="/" className="absolute left-4 top-5 sm:left-8 sm:top-8">
          <img
            className="w-[155px] lg:w-[275px]"
            src="http://45.74.32.213:4000/images/LOGO.png"
            alt="logo"
          />
          <h1 className="font-title text-lg font-bold italic text-white lg:text-[32px]">
            RAMSAY'S DETAILING
          </h1>
        </Link>

        {loggedIn && (
          <div>
            <div className="hidden lg:block">
              <div className="mt-16 flex flex-row justify-center gap-10 font-semibold">
                <Link to="/">
                  <button className="hover:text-lg hover:font-bold">
                    Home
                  </button>
                </Link>
                <Link to="/services">
                  <button className="hover:text-lg hover:font-bold">
                    Services
                  </button>
                </Link>
                <Link to="/about">
                  <button className="hover:text-lg hover:font-bold">
                    About
                  </button>
                </Link>
              </div>
              <span className="absolute right-10 top-14 flex flex-row-reverse items-center gap-4">
                <div className="button mt-3 bg-red-600 text-lg transition-all duration-500 hover:bg-red-700">
                  <LogOutBtn />
                </div>

                <Link
                  to="/cart"
                  className="relative flex flex-col items-center"
                >
                  <h1 className={"absolute ml-1"}>
                    <b>{cartLength}</b>
                  </h1>
                  <img
                    alt="cart"
                    src="http://45.74.32.213:4000/images/cart.png"
                    className="max-h-11"
                  />
                </Link>

                <a
                  href="https://www.instagram.com/ramsays_detailing/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src="http://45.74.32.213:4000/images/instagram.png"
                    alt="instagram"
                    className="max-h-7"
                  />
                </a>
                <a
                  href="https://www.facebook.com/ramsaydetailing"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src="http://45.74.32.213:4000/images/facebook.png"
                    alt="facebook"
                    className="max-h-11"
                  />
                </a>
                <a href="tel:+16137692098">
                  <img
                    src="http://45.74.32.213:4000/images/phone.png"
                    alt="phone"
                    className="max-h-7"
                  />
                </a>
              </span>
            </div>

            {/* MOBILE NAVBAR */}
            <div className="lg:hidden">
              <img
                src={"http://45.74.32.213:4000/images/MenuLogo.png"}
                alt="mobile nav"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className={
                  "absolute right-3 top-7 w-10 transition-transform " +
                  (mobileNavOpen
                    ? "scale-0"
                    : "scale-1 animate-open-menu-spin-reverse")
                }
              />
              <img
                src={"http://45.74.32.213:4000/images/MenuLogoX.png"}
                alt="mobile nav"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className={
                  "absolute right-3 top-7 w-10 transition-transform " +
                  (mobileNavOpen ? "scale-1 animate-open-menu-spin" : "scale-0")
                }
              />

              <div
                className={
                  mobileNavOpen
                    ? "bg-white-0 absolute right-0 top-[88px] origin-right animate-open-menu rounded-l-xl bg-ramsayBlue-0 pb-10"
                    : "hidden"
                }
              >
                <div className="ml-1 mt-3 flex flex-row-reverse gap-3">
                  <div className="button my-auto mr-4 w-[87px] bg-red-700 text-center">
                    <LogOutBtn />
                  </div>

                  <Link to="/cart" className="flex flex-col items-center">
                    <h1 className="absolute ml-1">
                      <b>{cartLength}</b>
                    </h1>
                    <img
                      alt="cart"
                      src="http://45.74.32.213:4000/images/cart.png"
                      className="max-h-11"
                    />
                  </Link>

                  <a
                    href="https://www.instagram.com/ramsays_detailing/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-[9px]"
                  >
                    <img
                      src="http://45.74.32.213:4000/images/instagram.png"
                      alt="instagram"
                      className="max-h-6"
                    />
                  </a>
                  <a
                    href="https://www.facebook.com/ramsaydetailing"
                    target="_blank"
                    rel="noreferrer"
                    className=""
                  >
                    <img
                      src="http://45.74.32.213:4000/images/facebook.png"
                      alt="facebook"
                      className="max-h-10"
                    />
                  </a>
                  <a
                    href="tel:+16137692098"
                    className="absolute right-72 top-12 mr-6"
                  >
                    <img
                      src="http://45.74.32.213:4000/images/phone.png"
                      alt="phone"
                      className="max-h-6"
                    />
                  </a>
                </div>
                <div className="mt-7 flex flex-col items-center gap-7 text-4xl">
                  <Link to="/">
                    <button className="font-bold">Home</button>
                  </Link>
                  <Link to="/services">
                    <button className="font-bold">Services</button>
                  </Link>
                  <Link to="/about">
                    <button className="font-bold">About</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
