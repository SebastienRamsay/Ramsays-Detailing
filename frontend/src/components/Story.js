import { Link } from "react-router-dom";

const Story = () => {
  return (
    <div className=" bg-ramsayBlue-0 p-5 md:p-20">
      <div className="flex flex-col items-center gap-10 rounded-xl bg-primary-0 p-5 text-center sm:p-10 2xl:flex-row">
        <div className="2xl:w-2/3">
          <h1 className="title mx-auto mb-8 max-w-sm text-xl sm:text-4xl">
            <b>THE STORY OF RAMSAY'S DETAILING</b>
          </h1>
          <p className="text-sm leading-5 md:text-lg md:leading-9 lg:px-8">
            Ramsay's Detailing is a buisness built around the customers needs.
            Logging in with google not only lets us keep track of your bookings
            but it also allows us to make an event in your calendar to remind
            you about your booking. We have a built in online payment system to
            allow users to securly make transcations. The customer is not
            expected to pay until after the job is complete. On top of this we
            also integrated a before and after system to allow you to see the
            amazing results on our services. At Ramsay's Detailing we are
            dedicated to ensure our customers satisfaction. Your vehicle is
            important to us, we want to ensure both you and your vehicle are
            happy. We offer top of the line services at unbeatable prices.
            Please be sure to get in touch if you have any questions about the
            business or the services we provide.
          </p>
          <div className="mt-5 text-sm sm:mt-10 ">
            <Link
              to="https://www.instagram.com/ramsays_detailing/"
              className="mr-5 rounded-full border px-5 py-2 transition-all duration-500 hover:bg-white hover:text-black sm:px-10 md:text-lg"
            >
              Instagram
            </Link>
            <Link
              to="https://www.facebook.com/ramsaydetailing"
              className="rounded-full border px-5 py-2 transition-all duration-500 hover:bg-white hover:text-black sm:px-10 md:text-lg"
            >
              Facebook
            </Link>
          </div>
        </div>
        <span className="object-scale-down">
          <img
            src="https://ramsaysdetailing.ca:4000/images/wipedown.png"
            alt="wipedown"
            className=""
          />
        </span>
      </div>
    </div>
  );
};

export default Story;
