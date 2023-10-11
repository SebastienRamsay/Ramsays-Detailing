import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="flex flex-col items-center bg-primary-0 pb-10 pt-10 font-semibold italic text-white">
      <h4 className="pb-5 font-title text-2xl font-bold">RAMSAY'S DETAILING</h4>
      <p className="">sebastien.ramsay@gmail.com</p>
      <p>613-769-2098</p>
      <p>7536 Dwyer Hill Road, Burritts Rapids</p>

      <div className="flex items-center gap-4 pt-3">
        <a
          href="https://www.instagram.com/ramsays_detailing/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://ramsaysdetailing.ca:4000/images/instagram.png"
            alt="instagram"
            className="max-h-6"
          />
        </a>
        <a
          href="https://www.facebook.com/ramsaydetailing"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://ramsaysdetailing.ca:4000/images/facebook.png"
            alt="facebook"
            className="max-h-10"
          />
        </a>
        <a href="tel:+16137692098">
          <img
            src="https://ramsaysdetailing.ca:4000/images/phone.png"
            alt="phone"
            className="max-h-6"
          />
        </a>
      </div>
      <div className="flex flex-row-reverse gap-3">
        <Link to="https://ramsaysdetailing.ca/terms">
          <p className="text-blue-800 underline">terms of service</p>
        </Link>
        <Link to="https://ramsaysdetailing.ca/privacypolicy">
          <p className="text-blue-800 underline">privacy policy</p>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
