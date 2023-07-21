import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const CartContext = createContext();

function CartContextProvider(props) {
  const [cart, setCart] = useState(undefined);
  const [cartLength, setCartLength] = useState(0);
  const [cartContextResponse, setCartResponse] = useState("");
  const { isGuest } = useContext(AuthContext);
  const [busyTimes, setBusyTimes] = useState([]);
  const [selectedDateTimes, setSelectedDateTimes] = useState([]);

  async function getCart() {
    if (isGuest === false) {
      try {
        const response = await axios.get("http://45.74.32.213:4000/api/cart", {
          withCredentials: true,
        });
        if (response.status === 200) {
          const data = response.data;
          setCart(data);
          setCartLength(data.services?.length);
        } else {
          console.log("Error getting cart: " + response);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    } else if (isGuest === true) {
      const storedCart = JSON.parse(localStorage.getItem("Cart"));
      if (storedCart?.services && !cart?.services) {
        setCart(storedCart);
      }
      setCartLength(cart?.services?.length || 0);
    }
  }

  async function fetchBusyTimes() {
    try {
      const response = await axios.get("http://45.74.32.213:4000/busyEvents", {
        withCredentials: true,
      });
      const busyEvents = response.data;
      setBusyTimes(busyEvents);
      console.log(busyEvents);
    } catch (error) {
      console.error("Error fetching busy events:", error);
    }
  }

  useEffect(() => {
    fetchBusyTimes();
  }, []);

  useEffect(() => {
    if (isGuest) {
      if (cart !== undefined && cart) {
        setCartResponse("Item added to cart");
        localStorage.setItem("Cart", JSON.stringify(cart));
      }
    }
    setCartLength(cart?.services?.length || 0);
  }, [cart, isGuest]);

  async function addToCartContext(service) {
    console.log(service.price);
    if (isGuest) {
      if (!cart || cart === undefined) {
        console.log("cart doesn't exist or is undefined");
        const newCart = {
          price: service.price,
          services: [
            {
              id: service._id,
              title: service.title,
              price: service.price,
              localImageName: service.localImageName,
              timeToComplete: service.timeToComplete,
              answeredQuestions: service.answeredQuestions,
            },
          ],
        };
        setCart(newCart);
        setCartLength(newCart?.services?.length);
        setCartResponse("Item added to cart");
      } else {
        const updatedCart = {
          price: cart.price ? cart.price + service.price : service.price,
          services: cart.services
            ? [...cart.services, { ...service }]
            : [
                {
                  id: service._id,
                  title: service.title,
                  price: service.price,
                  localImageName: service.localImageName,
                  timeToComplete: service.timeToComplete,
                  answeredQuestions: service.answeredQuestions,
                },
              ],
        };

        setCart(updatedCart);
        setCartResponse("Item added to cart");
      }
      localStorage.setItem("Cart", JSON.stringify(cart));
      setCartLength(cart?.services?.length);
    }

    if (!isGuest) {
      const response = await axios.post(
        "http://45.74.32.213:4000/api/cart",
        {
          service: {
            title: service.title,
            price: service.price,
            answeredQuestions: service.answeredQuestions,
          },
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
        console.log("Item added to cart: ", data);
        setCart(data);
        setCartResponse("Item added to cart");
        setCartLength(data.services.length);
      } else {
        console.error("failed to add item to cart: ", response);
      }
    }
    setCartLength(cart?.services?.length);
  }

  async function removeFromCartContext(service) {
    if (!cart) {
      return; // No items in the cart, nothing to remove
    }
    if (isGuest === false) {
      console.log(service._id);
      const response = await axios.delete("http://45.74.32.213:4000/api/cart", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          _id: service._id,
        },
      });

      if (response.ok) {
        const data = response.data;
        console.log("Item removed from cart: ", data);

        setCartLength(cartLength - 1);
      } else {
        console.error("failed to remove item from cart: ", response);
      }
    }

    // Find the index of the service to be removed in the cart
    const index = cart.services.findIndex(
      (item) => item.title === service.title
    );

    if (index !== -1) {
      const removedService = cart.services[index];
      cart.price -= removedService.price;
      cart.services.splice(index, 1); // Remove the service from the cart
      setCart({ ...cart }); // Update the cart state
    }

    if (isGuest) {
      localStorage.removeItem("Cart");
      localStorage.setItem("Cart", JSON.stringify(cart));
    }
  }

  async function clearStoredCart() {
    localStorage.removeItem("Cart");
    setCart({});
    setCartLength(0);
  }

  return (
    <CartContext.Provider
      value={{
        selectedDateTimes,
        setSelectedDateTimes,
        fetchBusyTimes,
        busyTimes,
        cart,
        cartLength,
        cartContextResponse,
        getCart,
        addToCartContext,
        removeFromCartContext,
        clearStoredCart,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}

export default CartContext;

export { CartContextProvider };
