import { Link } from "react-router-dom";
import Story from "../components/Story";
import InfoGlobe from "../components/InfoGlobe";

const About = () => {
  return (
    <div className="">
      <div className="flex flex-col items-center pb-10 pt-10 text-center">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl ">
          <b>About Ramsay's Detailing</b>
        </h1>
        <p className="text-center">
          At Ramsay's Detailing we are dedicated to ensure our customers
          satisfaction.
          <br />
          Your vehicle is important to us, we want to ensure both you and your
          vehicle are happy.
          <br />
          Call us anytime to get a free quote on a detailing.
        </p>
        <div className="mb-8">
          <a href="tel:+16137692098" className="flex items-center">
            <strong className="font-sans text-2xl">613-769-2098</strong>
            <img alt="phone" src="/images/phone.png" className="ml-3 max-h-6" />
          </a>
        </div>
        <Link
          to="https://ramsaysdetailing.ca/services"
          className="rounded-full border px-10 py-2 text-lg hover:border-2 hover:font-bold"
        >
          Services
        </Link>
      </div>

      <Story />

      <InfoGlobe />

      {/* <iframe
        className=" h-xl w-full border-0"
        src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCnAcsDknQV6JTPNTYo8wUTnPR-yhEacZc&q=Ramsay's+Detailing+7536+Dwyer+Hill+Road,+Burritts+Rapids,+ON,+Canada"
        allowFullScreen
        title="Business Location"
      ></iframe> */}
    </div>
  );
};

export default About;
