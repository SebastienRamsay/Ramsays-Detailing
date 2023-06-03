const imageDirectory = 'http://localhost:4000/images/';

const ServiceDetails = ({ service }) => {
    const imagePath = imageDirectory + service.localImageName
    return (
      <div className="service-details">
        <img src={imagePath} alt=""></img>
        <h4>{service.title}</h4>
      </div>
    );
}

export default ServiceDetails;
