// utils/imageGenerator.js
const axios = require("axios");
const FormData = require("form-data");

const CARTOON_STYLE = `
    
    one centered object,
    isolated composition,
    clean gradient background,
    premium quality materials,
    smooth glossy surfaces,
    studio quality lighting,
    8k resolution,
    ultra high detail,
    perfect composition,
    polished finish,
    single view,
   no text,
    no watermarks,
    no logos,
    no signatures,
    clean render,
    pure image only
`
  .replace(/\s+/g, " ")
  .trim();

async function generate3DRender(prompt, options = {}) {
  try {
    const formData = new FormData();

    // Enhanced prompt emphasizing single object
    const enhancedPrompt = `
            single centered 3D  ${prompt},
            one isolated object,
            ${CARTOON_STYLE}
        `
      .replace(/\s+/g, " ")
      .trim();

    formData.append("text", enhancedPrompt);
    formData.append("width", options.width || 1024);
    formData.append("height", options.height || 1024);
    formData.append("grid_size", 1); // Explicitly request single image

    console.log("Enhanced prompt:", enhancedPrompt);

    const response = await axios.post(
      "https://api.deepai.org/api/3d-cartoon-generator",
      formData,
      {
        headers: {
          "api-key": process.env.DEEPAI_API_KEY,
          ...formData.getHeaders(),
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Generation Error for ${prompt}:`, error);
    throw new Error(`Failed to generate cartoon: ${error.message}`);
  }
}

module.exports = {
  generate3DRender,
};
