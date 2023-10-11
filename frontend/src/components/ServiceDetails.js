const imageDirectory = "https://ramsaysdetailing.ca:4000/images/";

const ServiceDetails = ({ service }) => {
  const imagePath = imageDirectory + service.localImageName;
  return (
    <div className="title m-5 mx-auto max-w-md flex-col overflow-hidden rounded text-ramsayGray-0 transition-all duration-500 hover:bg-white hover:text-black">
      <img src={imagePath} alt="" />
      <h4 className="flex justify-center p-1 sm:text-[24px]">
        {service.title}
      </h4>
    </div>
  );
};

export default ServiceDetails;
