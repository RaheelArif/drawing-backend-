// utils/imageGenerator.js
const axios = require('axios');
const FormData = require('form-data');

const CARTOON_STYLE = `
  cute 3D cartoon style,
  Pixar style animation,
  kawaii character design,
  smooth glossy surfaces,
  vibrant colors,
  cheerful expression,
  friendly appearance,
  soft gradient lighting,
  clean background,
  isometric view,
  high quality render,
  blender 3D,
  cinema4d style,
  pastel color palette,
  playful design,
  toy-like appearance,
  rounded edges
`.replace(/\s+/g, ' ').trim();

const NEGATIVE_PROMPT = `
  realistic, photographic, serious, detailed textures, rough surfaces, 
  dark shadows, gritty, mechanical, technical, blueprint, 
  low quality, blurry, noise
`.replace(/\s+/g, ' ').trim();

async function generate3DRender(prompt, options = {}) {
    try {
        const {
            width = 1024,
            height = 1024,
        } = options;

        const formData = new FormData();
        
        // Enhance prompt with specific styling details
        let enhancedPrompt = `Adorable 3D cartoon ${prompt}, made in Pixar style`;
        
     

        // Add general style guidelines
        enhancedPrompt += `, ${CARTOON_STYLE}`;

        formData.append('text', enhancedPrompt);
        formData.append('negative_prompt', NEGATIVE_PROMPT);
        formData.append('width', width);
        formData.append('height', height);
        formData.append('grid_size', 1);
        formData.append('steps', 50); // More generation steps for better quality
        
        // Try different endpoints based on content type
        const endpoint = 'https://api.deepai.org/api/cute-creature-generator';
        
        const response = await axios.post(
            endpoint,
            formData,
            {
                headers: {
                    'api-key': process.env.DEEPAI_API_KEY,
                    ...formData.getHeaders(),
                },
                timeout: 120000, // Longer timeout for better quality
            }
        );

        return response.data;
    } catch (error) {
        // If first attempt fails, try fallback endpoint
        try {
            const formData = new FormData();
            formData.append('text', `Cute cartoon ${prompt}, ${CARTOON_STYLE}`);
            formData.append('width', options.width || 1024);
            formData.append('height', options.height || 1024);

            const response = await axios.post(
                'https://api.deepai.org/api/text2img',
                formData,
                {
                    headers: {
                        'api-key': process.env.DEEPAI_API_KEY,
                        ...formData.getHeaders(),
                    },
                    timeout: 60000,
                }
            );
            return response.data;
        } catch (fallbackError) {
            console.error('All Generation Attempts Failed:', fallbackError);
            throw new Error('Failed to generate image after multiple attempts');
        }
    }
}

// Controller function to handle multiple attempts if needed
async function generateWithRetry(prompt, maxAttempts = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await generate3DRender(prompt);
            if (result.output_url) {
                return result;
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;
        }
    }
    
    throw lastError || new Error('Failed to generate satisfactory image');
}

module.exports = {
    generate3DRender,
    generateWithRetry
};