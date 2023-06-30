const Dotenv = require('dotenv-webpack');

module.exports = {
  // Other webpack configuration options
  plugins: [
    new Dotenv()
  ]
};