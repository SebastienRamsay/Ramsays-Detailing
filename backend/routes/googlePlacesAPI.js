const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/places/autocomplete', async (req, res) => {
  const { input } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error occurred while fetching autocomplete data:', error);
    res.status(500).json({ error: 'An error occurred while fetching autocomplete data' });
  }
});


router.get('/confirm-address', async (req, res) => {
    const { address } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.status === 'OK') {
        console.log('Address is valid');
        const formattedAddress = data.results[0].formatted_address;
        console.log('Formatted Address:', formattedAddress);
        res.json({ valid: true, formattedAddress });
      } else {
        console.log('Address is invalid or not found');
        res.json({ valid: false });
      }
    } catch (error) {
      console.log('Error occurred while geocoding:', error);
      res.status(500).json({ error: 'An error occurred while geocoding' });
    }
  });

module.exports = router;
