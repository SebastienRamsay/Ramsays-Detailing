
const imageDirectory = 'https://ramsays-detailing.onrender.com/images/';

const ServiceDetails = ({ service }) => {
    const imagePath = imageDirectory + service.localImageName
    return (
        <div class="bg-primary-0 rounded overflow-hidden shadow-md m-5 flex-col max-w-md mx-auto">
          <img src={imagePath} alt=""/>
          <h4 class="font-bold text-lg flex justify-center">{service.title}</h4>
        </div>
    );
}

export default ServiceDetails;
