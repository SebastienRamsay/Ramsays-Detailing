const imageDirectory = './images/';

const ServiceDetails = ({ service }) => {
    const imagePath = imageDirectory + service.localImageName
    return (
      <div className="service-details">
        <img src={imagePath} alt=""></img>
        <h4>{service.title}</h4>
        <p><strong>Price: </strong>{service.price}</p>
      </div>
    );
}

export default ServiceDetails;
