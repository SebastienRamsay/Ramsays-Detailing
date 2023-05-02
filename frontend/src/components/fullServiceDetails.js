import CustomDayPicker from "../components/CustomDayPicker"

const imageDirectory = '../images/';

const FullServiceDetails = ({ service }) => {
    const imagePath = imageDirectory + service.localImageName
    if (imagePath){
        return (
      <div className="service-details">
        <img src={imagePath} alt="" />
        <h4 >{service.title}</h4>
        <p>
            <strong>Price: </strong>
            {service.price}
        </p>
        
        {service.questions && service.questions.map(question => (
          <div className="question">
            <h4>{question.question}</h4>
            <select>
              {question.answers && question.answers.map(answer => (
                <option value={answer}>${answer}</option>
              ))}
            </select>
          </div>
        ))}
        <CustomDayPicker/>
      </div>
    );
    }
    
}

export default FullServiceDetails;