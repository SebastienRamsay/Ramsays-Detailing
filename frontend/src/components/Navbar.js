import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";
import LogOutBtn from "./LogOutBtn";
import GoogleButton from "./googleButton";

const Navbar = () => {
  const { loggedIn, displayName, profilePicture, isAdmin, isEmployee } =
    useContext(AuthContext);
  const { cartLength } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    <header className="relative bg-primary-0 py-[45px] text-white nav:py-[10px] md:py-5">
      <nav className="" ref={menuRef}>
        <Link
          to="https://ramsaysdetailing.ca/"
          className="absolute left-3 top-5 md:left-5 md:top-8"
        >
          <img
            className="w-[155px] nav:w-[240px] md:w-[275px]"
            src="images/LOGO.png"
            alt="logo"
          />
          <h1 className="font-title text-[18px] font-bold italic text-white nav:text-[28px] md:text-[32px] ">
            RAMSAY'S DETAILING
          </h1>
        </Link>

        <div>
          <div className="hidden nav:block">
            <div className="mt-24 flex flex-row justify-center gap-10 text-lg font-semibold">
              <Link to="https://ramsaysdetailing.ca/">
                <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                  Home
                </button>
              </Link>
              <Link to="https://ramsaysdetailing.ca/services">
                <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                  Services
                </button>
              </Link>
              {loggedIn && (
                <Link to="https://ramsaysdetailing.ca/bookings">
                  <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                    Bookings
                  </button>
                </Link>
              )}

              {isAdmin && (
                <Link to="https://ramsaysdetailing.ca/admin">
                  <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                    Admin
                  </button>
                </Link>
              )}

              {isEmployee && (
                <Link to="https://ramsaysdetailing.ca/employee">
                  <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                    Employee
                  </button>
                </Link>
              )}

              <Link to="https://ramsaysdetailing.ca/about">
                <button className="transition-all duration-300 hover:text-xl hover:font-bold">
                  About
                </button>
              </Link>
            </div>
          </div>
          <div>
            <span className="absolute right-0 top-5 flex flex-row-reverse items-center gap-4 nav:top-10">
              {loggedIn && (
                <div className="flex flex-row-reverse items-center gap-2">
                  <div className="mr-5 hidden md:flex md:flex-row">
                    <div className="group relative ml-3">
                      {/* Profile Picture and Name */}
                      <div className="mb-3 flex flex-row items-center gap-3 p-3">
                        <h1 className="text-lg">{displayName}</h1>
                        <img
                          src={profilePicture}
                          className="h-11 w-11 rounded-full"
                          alt="Profile"
                        />
                      </div>

                      {/* group-hover: Profile Picture and Name With Logout */}
                      <div className="absolute right-0 top-0 hidden origin-top rounded-xl bg-ramsayBlue-0 p-3 group-hover:block group-hover:animate-fade-in">
                        <div className="mb-3 flex flex-row items-center gap-3">
                          <h1 className="whitespace-nowrap text-lg">
                            {displayName}
                          </h1>
                          <img
                            src={profilePicture}
                            className="h-11 w-11 rounded-full"
                            alt="Profile"
                          />
                        </div>

                        <div className="button mx-auto my-auto w-[87px] bg-red-700 text-center">
                          <LogOutBtn />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-row-reverse">
                    <Link
                      to="https://ramsaysdetailing.ca/cart"
                      className="relative mr-20 mt-1 flex flex-col items-center nav:mt-[12px] md:mr-0 md:mt-0"
                    >
                      <h1 className={"absolute ml-1"}>
                        <b>{cartLength || 0}</b>
                      </h1>
                      <img
                        alt="cart"
                        src="images/cart.png"
                        className="max-h-11"
                      />
                    </Link>
                    <div className="mr-5 hidden items-center gap-2 social:flex social:flex-row-reverse">
                      <a
                        href="https://www.instagram.com/ramsays_detailing/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src="images/instagram.png"
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
                          src="images/facebook.png"
                          alt="facebook"
                          className="max-h-11"
                        />
                      </a>
                      <a href="tel:+16137692098" className="">
                        <img
                          src="images/phone.png"
                          alt="phone"
                          className="max-h-7"
                        />
                      </a>
                    </div>
                  </div>

                  <div className="mr-5 md:hidden">
                    <div className="w-10">
                      <img
                        src={"images/MenuLogo.png"}
                        alt="mobile nav"
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                        className={
                          "absolute right-5 top-2 w-10 transition-transform nav:top-[15px] " +
                          (mobileNavOpen
                            ? "scale-0"
                            : "scale-1 animate-open-menu-spin-reverse")
                        }
                      />
                      <img
                        src={"images/MenuLogoX.png"}
                        alt="mobile nav"
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                        className={
                          "absolute right-5 top-2 w-10 transition-transform nav:top-[15px] " +
                          (mobileNavOpen
                            ? "scale-1 animate-open-menu-spin"
                            : "scale-0")
                        }
                      />
                    </div>

                    <div
                      className={
                        mobileNavOpen
                          ? "absolute right-0 top-[70px] z-40 flex w-[350px] origin-right animate-open-menu flex-col gap-6 rounded-l-xl bg-ramsayBlue-0 p-5 nav:top-[105px]"
                          : "hidden"
                      }
                    >
                      <div className="flex flex-col gap-4">
                        <div className="mx-auto flex flex-row-reverse items-center gap-3">
                          <img
                            src={profilePicture}
                            className="h-[55px] w-[55px] rounded-full"
                            alt="Profile"
                          />
                          <h1 className="truncate text-xl">{displayName}</h1>
                        </div>
                        <div className="button mx-auto my-auto w-[150px] bg-red-700 text-center text-lg">
                          <LogOutBtn />
                        </div>
                      </div>

                      <div className="mx-7 flex flex-col items-center gap-7 text-4xl nav:hidden">
                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/"
                        >
                          <button className="font-bold">Home</button>
                        </Link>
                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/services"
                        >
                          <button className="font-bold">Services</button>
                        </Link>

                        {loggedIn && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/bookings"
                          >
                            <button className="font-bold">Bookings</button>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/admin"
                          >
                            <button className="font-bold">Admin</button>
                          </Link>
                        )}

                        {isEmployee && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/employee"
                          >
                            <button className="font-bold">Employee</button>
                          </Link>
                        )}

                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/about"
                        >
                          <button className="font-bold">About</button>
                        </Link>
                      </div>

                      <div className="mx-auto flex flex-row-reverse gap-3">
                        <a
                          href="https://www.instagram.com/ramsays_detailing/"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-[9px]"
                        >
                          <img
                            src="images/instagram.png"
                            alt="instagram"
                            className="max-h-9"
                          />
                        </a>
                        <a
                          href="https://www.facebook.com/ramsaydetailing"
                          target="_blank"
                          rel="noreferrer"
                          className=""
                        >
                          <img
                            src="images/facebook.png"
                            alt="facebook"
                            className="max-h-12"
                          />
                        </a>
                        <a href="tel:+16137692098" className="mt-2">
                          <img
                            src="images/phone.png"
                            alt="phone"
                            className="max-h-9"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!loggedIn && (
                <div className="flex flex-row-reverse gap-5">
                  {/* MOBILE NAVBAR */}
                  <div className="mr-5 nav:hidden">
                    <div className="w-10">
                      <img
                        src={"images/MenuLogo.png"}
                        alt="mobile nav"
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                        className={
                          "absolute right-5 top-2 w-10 transition-transform nav:top-[10px] " +
                          (mobileNavOpen
                            ? "scale-0"
                            : "scale-1 animate-open-menu-spin-reverse")
                        }
                      />
                      <img
                        src={"images/MenuLogoX.png"}
                        alt="mobile nav"
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                        className={
                          "absolute right-5 top-2 w-10 transition-transform nav:top-[10px] " +
                          (mobileNavOpen
                            ? "scale-1 animate-open-menu-spin"
                            : "scale-0")
                        }
                      />
                    </div>

                    <div
                      className={
                        mobileNavOpen
                          ? "absolute right-0 top-[70px] z-40 flex w-[300px] origin-right animate-open-menu flex-col gap-6 rounded-l-xl bg-ramsayBlue-0 p-5 nav:top-[105px]"
                          : "hidden"
                      }
                    >
                      <div className="mx-7 mt-3 flex flex-col items-center gap-7 text-4xl">
                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/"
                        >
                          <button className="font-bold">Home</button>
                        </Link>
                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/services"
                        >
                          <button className="font-bold">Services</button>
                        </Link>

                        {loggedIn && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/bookings"
                          >
                            <button className="font-bold">Bookings</button>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/admin"
                          >
                            <button className="font-bold">Admin</button>
                          </Link>
                        )}

                        {isEmployee && (
                          <Link
                            onClick={() => setMobileNavOpen(false)}
                            to="https://ramsaysdetailing.ca/employee"
                          >
                            <button className="font-bold">Employee</button>
                          </Link>
                        )}

                        <Link
                          onClick={() => setMobileNavOpen(false)}
                          to="https://ramsaysdetailing.ca/about"
                        >
                          <button className="font-bold">About</button>
                        </Link>
                      </div>

                      <div className="mx-auto flex flex-row-reverse gap-5">
                        <a
                          href="https://www.instagram.com/ramsays_detailing/"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-[9px]"
                        >
                          <img
                            src="images/instagram.png"
                            alt="instagram"
                            className="max-h-9"
                          />
                        </a>
                        <a
                          href="https://www.facebook.com/ramsaydetailing"
                          target="_blank"
                          rel="noreferrer"
                          className=""
                        >
                          <img
                            src="images/facebook.png"
                            alt="facebook"
                            className="max-h-12"
                          />
                        </a>
                        <a href="tel:+16137692098" className="mt-2">
                          <img
                            src="images/phone.png"
                            alt="phone"
                            className="max-h-9"
                          />
                        </a>
                      </div>

                      <div className="mx-auto mt-5 block sm:hidden"></div>
                    </div>
                  </div>
                  <div className="mr-1 flex flex-row-reverse gap-7 nav:mr-5 nav:mt-[4.5px]">
                    <div className="hidden sm:block">
                      <GoogleButton />
                    </div>
                    <div className="hidden items-center gap-2 md:flex md:flex-row-reverse">
                      <a
                        href="https://www.instagram.com/ramsays_detailing/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src="images/instagram.png"
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
                          src="images/facebook.png"
                          alt="facebook"
                          className="max-h-11"
                        />
                      </a>
                      <a href="tel:+16137692098" className="">
                        <img
                          src="images/phone.png"
                          alt="phone"
                          className="max-h-7"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
