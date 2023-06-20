const imageDirectory = 'http://localhost:4000/images/';

const ServiceDetails = ({ service }) => {
    const imagePath = imageDirectory + service.localImageName
    return (
        <div class="card">
          <img src={imagePath} alt=""/>
          <h4 class="font-bold text-lg flex justify-center">{service.title}</h4>
        </div>
    );
}

export default ServiceDetails;
