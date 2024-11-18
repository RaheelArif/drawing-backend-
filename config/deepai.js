require('dotenv').config();

const DEEPAI_CONFIG = {
  API_URL: 'https://api.deepai.org/api',
  API_KEY: process.env.DEEPAI_API_KEY
};

module.exports = DEEPAI_CONFIG;
