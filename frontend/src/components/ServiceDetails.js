import { useState } from "react";
const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

const ServiceDetails = ({ service }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imagePath = imageDirectory + service.localImageName;
  return (
    <div className="title m-5 mx-auto max-w-md flex-col overflow-hidden rounded bg-primary-0 text-ramsayGray-0 transition-all duration-500 hover:bg-white hover:text-black">
      <div
        className={`${
          imageLoaded ? "hidden" : "block"
        } h-[15rem] w-[30rem] bg-primary-0`}
      />
      <img
        src={imagePath}
        alt="Service"
        className={`${imageLoaded ? "block" : "hidden"}`}
        onLoad={() => setImageLoaded(true)}
      />
      <h4 className="flex justify-center p-1 sm:text-[24px]">
        {service.title}
      </h4>
    </div>
  );
};

export default ServiceDetails;
