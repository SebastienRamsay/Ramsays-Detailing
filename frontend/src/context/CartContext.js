import axios from "axios";
import { DateTime } from "luxon";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import AuthContext from "./AuthContext";
import PopupContext from "./PopupContext";

const CartContext = createContext();

function CartContextProvider(props) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart
      ? JSON.parse(savedCart)
      : { busyTimes: [], selectedDateTime: undefined };
  });
  const [cartLength, setCartLength] = useState(0);
  const [cartContextResponse, setCartResponse] = useState("");
  const { loggedIn } = useContext(AuthContext);
  const { setReScheduleBusyTimes } = useContext(PopupContext);

  const difference = DateTime.fromISO(cart.selectedDateTime).diff(
    DateTime.now(),
    "hours"
  );
  const differenceInHours = difference.hours;

  if (differenceInHours <= 48) {
    // Date is within 48 hours of right now
    setCart((oldCart) => {
      oldCart.selectedDateTime = undefined;
      return { ...oldCart }; // Ensure immutability
    });
  }

  const getCart = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const data = response.data;
        // Preserve properties from local storage
        const mergedCart = {
          ...data,
          phoneNumber: cart.phoneNumber || "",
          selectedDateTime: cart.selectedDateTime,
          createCalendarEvent: cart.createCalendarEvent || false,
          address: cart.address || "",
        };
        setCart(mergedCart);
        setCartLength(data.services?.length || 0);
      } else {
        console.log("Error getting cart: " + response);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [setCart, setCartLength, cart]);

  var isMounted = useRef(false);

  async function fetchBusyTimesForReSchedule(
    customerLocation,
    expectedTimeToComplete,
    serviceNames
  ) {
    try {
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/bookings/busyTimes",
        {
          customerLocation,
          expectedTimeToComplete,
          serviceNames,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const busyEvents = response.data;
      setReScheduleBusyTimes(busyEvents);
      console.log(busyEvents);
    } catch (error) {
      console.error("Error fetching busy events:", error);
    }
  }

  const fetchBusyTimes = useCallback(
    async ({ customerLocation, expectedTimeToComplete, serviceNames }) => {
      try {
        const response = await axios.post(
          "https://ramsaysdetailing.ca:4000/api/bookings/busyTimes",
          {
            customerLocation,
            expectedTimeToComplete,
            serviceNames,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const busyEvents = response.data;
        setCart((prev) => ({ ...prev, busyTimes: busyEvents }));
        console.log(busyEvents);
      } catch (error) {
        console.error("Error fetching busy events:", error);
      }
    },
    [setCart]
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!isMounted.current && loggedIn !== undefined && loggedIn) {
      getCart();
      isMounted.current = true;
    }
  }, [loggedIn, getCart, fetchBusyTimes]);

  async function addToCartContext(service) {
    try {
      if (cart.services.length > 2) {
        toast.error("You can only book 3 services at a time");
        return;
      }
      const response = await axios.post(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          service,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = await response.data;
        const newCart = {
          phoneNumber: cart.phoneNumber,
          address: cart.address,
          createCalendarEvent: cart.createCalendarEvent,
          ...data,
        };
        setCart(newCart);
        toast.success("Item added to cart");
        setCartLength(cartLength + 1);
      } else {
        toast.error("failed to add item to cart");
        console.error("failed to add item to cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function removeFromCartContext(service) {
    if (!cart) {
      return; // No items in the cart, nothing to remove
    }
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/cart",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            _id: service._id,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        const newCart = {
          phoneNumber: cart.phoneNumber,
          address: cart.address,
          createCalendarEvent: cart.createCalendarEvent,
          ...data,
        };
        setCart(newCart);
        setCartLength(cartLength - 1);
        toast.success("Item removed from cart");
      } else {
        toast.error("failed to remove item from cart");
        console.error("failed to remove item from cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const clearCartContext = async () => {
    if (!cart) {
      return; // No items in the cart, nothing to remove
    }
    try {
      const response = await axios.delete(
        "https://ramsaysdetailing.ca:4000/api/cart/clear",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Cart Cleared");
        setCart(data);
        setCartLength(0);
      } else {
        console.error("failed to clear cart: ", response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        fetchBusyTimes,
        fetchBusyTimesForReSchedule,
        cart,
        setCart,
        cartLength,
        cartContextResponse,
        setCartResponse,
        getCart,
        addToCartContext,
        removeFromCartContext,
        clearCartContext,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}

export default CartContext;

export { CartContextProvider };
