const axios = require("axios");

// Global cache object to store coordinates for addresses
const addressCache = {};

// Define the Google Maps Geocoding API endpoint
const geocodingEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";

async function getCoordinatesFromAddress(address) {
  // Check if the coordinates are already in the cache
  if (addressCache[address]) {
    console.log(
      `Using cached coordinates for ${address}: ${JSON.stringify(
        addressCache[address]
      )}`
    );
    return addressCache[address];
  }

  try {
    // Make a request to the Geocoding API
    const response = await axios.get(geocodingEndpoint, {
      params: {
        address: address,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    // Extract the latitude and longitude from the API response
    const location = response.data.results[0].geometry.location;
    const coordinates = {
      latitude: location.lat,
      longitude: location.lng,
    };

    // Cache the coordinates for future use
    addressCache[address] = coordinates;
    return coordinates;
  } catch (error) {
    console.error(
      `Error fetching coordinates for ${address} from Google Maps API:`,
      error.message
    );
    throw error;
  }
}

module.exports = { getCoordinatesFromAddress };
