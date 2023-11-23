import React from "react";
import { Link } from "react-router-dom";

export default function GoogleButton() {
  return (
    <Link to="https://ramsaysdetailing.ca:4000/auth/google">
      <button className="flex items-center rounded-full bg-[#BBBBBB] p-2 text-lg text-black transition-all duration-500">
        <img
          src="/images/google-n.png"
          alt="google"
          className="h-auto w-9 rounded-full sm:w-8"
        />
        <span className="text-bold mx-2 font-bold">Sign in with Google</span>
      </button>
    </Link>
  );
}
