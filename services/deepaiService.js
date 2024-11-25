const axios = require('axios');
const FormData = require('form-data');
const { API_KEY } = require('../config/deepai');

const DEFAULT_STYLE = '   seamless background,';

async function generate3DCartoon(text) {
    try {
        const formData = new FormData();
        const enhancedPrompt = `${text}${DEFAULT_STYLE}`;
        
        formData.append('text', enhancedPrompt);
        formData.append('width', '1024');
        formData.append('height', '768'); // 4:3 ratio for better product view
    
        const response = await axios.post(
          'https://api.deepai.org/api/3d-character-generator', // This endpoint tends to give cleaner 3D renders
          formData,
          {
            headers: {
              'api-key': API_KEY,
              ...formData.getHeaders()
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('DeepAI Error:', error.response?.data || error);
        throw error;
      }
}

module.exports = { generate3DCartoon };