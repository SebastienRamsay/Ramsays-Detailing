import { useContext } from "react";
import { Link } from "react-router-dom";
import ServiceDetails from "../components/ServiceDetails";
import Story from "../components/Story";
import ServicesContext from "../context/ServicesContext";

const Home = () => {
  const { services } = useContext(ServicesContext);

  return (
    <div className="">
      <div className="flex flex-col items-center pb-16 pt-16">
        <h1 className="title mb-8 text-5xl sm:text-7xl">WELCOME</h1>
        <p className="px-7 pb-2 text-center text-lg sm:text-xl">
          Welcome to our <b>mobile detailing service</b>, where we offer top
          <b> quality services at unbeatable prices</b>.<br />
          Call us anytime to get a free quote on a detailing.
        </p>
        <div className="mb-12">
          <a href="tel:+16137692098" className="flex items-center gap-1">
            <img
              alt="phone"
              src="https://ramsaysdetailing.ca:4000/images/phone.png"
              className="mt-[3px] max-h-6"
            />
            <strong className="font-sans text-2xl">613-769-2098</strong>
          </a>
        </div>
        <Link
          to="https://ramsaysdetailing.ca/services"
          className="rounded-full border px-10 py-2 text-lg transition-all duration-500 hover:bg-white hover:text-black"
        >
          Services
        </Link>
      </div>

      <div className="flex w-full justify-center gap-10 bg-primary-0 px-3 py-3">
        {services &&
          services.map((service) => (
            <Link
              to={`/service/${service.title.replace(/\s+/g, "")}`}
              key={service._id}
            >
              <ServiceDetails service={service} />
            </Link>
          ))}
      </div>

      <Story />

      <iframe
        className=" h-xl w-full border-0"
        src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCnAcsDknQV6JTPNTYo8wUTnPR-yhEacZc&q=Ramsay's+Detailing+7536+Dwyer+Hill+Road,+Burritts+Rapids,+ON,+Canada"
        allowFullScreen
        title="Business Location"
      ></iframe>
    </div>
  );
};

export default Home;
