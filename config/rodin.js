require('dotenv').config();
  
const RODIN_CONFIG = {
  API_URL: 'https://hyperhuman.deemos.com/api/v2',
  API_KEY: process.env.RODIN_API_KEY
};

module.exports = RODIN_CONFIG;