import React from "react";
import { Link } from "react-router-dom";

export default function GoogleButton() {
  return (
    <Link to="https://ramsaysdetailing.ca:4000/auth/google">
      <button className="flex items-center rounded-full bg-ramsayBlue-0 p-2 text-white transition-all duration-500">
        <img
          src="/images/googleCalendar.png"
          alt="google"
          className="h-auto w-9 rounded-full sm:w-8"
        />
        <span className="text-bold mx-2 font-bold">
          Connect Google Calendar
        </span>
      </button>
    </Link>
  );
}
