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
            Ramsay's Detailing is an idea that popped into my head one day.
            After working at a detailing shop for a few months I figured I could
            start something of my own. I started watching YouTube videos on how
            to properly deep clean the interior and exterior of vehicles and
            created my dream job. At Ramsay's Detailing we are dedicated to
            ensure our customers satisfaction. Your vehicle is important to us,
            we want to ensure both you and your vehicle are happy. We offer top
            of the line services at unbeatable prices. Please be sure to get in
            touch if you have any questions about the business or the services
            we provide.
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
            src="http://45.74.32.213:4000/images/wipedown.png"
            alt="wipedown"
            className=""
          />
        </span>
      </div>
    </div>
  );
};

export default Story;
