const axios = require('axios');
const { API_URL, API_KEY } = require('../config/rodin');

async function checkRodinStatus(subscriptionKey) {
  const response = await axios.post(
    `${API_URL}/status`,
    { subscription_key: subscriptionKey },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

async function downloadRodinResults(taskUuid) {
  const response = await axios.post(
    `${API_URL}/download`,
    { task_uuid: taskUuid },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

module.exports = {
  checkRodinStatus,
  downloadRodinResults
};