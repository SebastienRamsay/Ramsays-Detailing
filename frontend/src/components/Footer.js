const Footer = () => {


    return (
        <div className="bg-primary-0 text-white italic font-semibold flex flex-col items-center pt-10 pb-10">
            <h4 className="font-title font-bold text-2xl pb-5">RAMSAY'S DETAILING</h4>
            <p className="">sebastien.ramsay@gmail.com</p>
            <p>613-769-2098</p>
            <p>7536 Dwyer Hill Road, Burritts Rapids</p>
            <div className="pt-3 flex gap-4 items-center">
                <a href="https://www.instagram.com/ramsays_detailing/" target="_blank" rel="noreferrer">
                    <img src="http://45.74.32.213:4000/images/instagram.png" alt="instagram" className="max-h-6" />
                </a>
                <a href="https://www.facebook.com/ramsaydetailing" target="_blank" rel="noreferrer">
                    <img src="http://45.74.32.213:4000/images/facebook.png" alt="facebook" className="max-h-10" />
                </a>
                <a href="tel:+16137692098">
                    <img src="http://45.74.32.213:4000/images/phone.png" alt="phone" className="max-h-6" />
                </a>
            </div>



            
        </div>
    )
}

export default Footer