// utils/imageGenerator.js
const axios = require("axios");
const FormData = require("form-data");

// DeepAI available endpoints for different types of generation
const DEEPAI_ENDPOINTS = {
  TEXT_TO_IMAGE: "https://api.deepai.org/api/text2img",
  CUTE_CREATURE: "https://api.deepai.org/api/cute-creature-generator",
  FANTASY_WORLD: "https://api.deepai.org/api/fantasy-world-generator",
  OBJECTS_3D: "https://api.deepai.org/api/3d-objects-generator",
  ANIME: "https://api.deepai.org/api/anime-portrait-generator",
  STABLE_DIFFUSION: "https://api.deepai.org/api/stable-diffusion",
};

// Comprehensive content categories
const CONTENT_CATEGORIES = {
  // Furniture and Home Items
  furniture: {
    keywords: [
      "chair",
      "table",
      "desk",
      "sofa",
      "bed",
      "cabinet",
      "shelf",
      "lamp",
      "furniture",
    ],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D furniture design,
            modern furniture,
            interior design style,
            product visualization,
            clean background,
            studio lighting,
            professional render,
            high quality materials
        `,
  },

  // Home Accessories
  homeAccessories: {
    keywords: [
      "vase",
      "clock",
      "mirror",
      "rug",
      "curtain",
      "pillow",
      "decoration",
    ],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D home accessory,
            interior decoration,
            product photography,
            detailed materials,
            clean background,
            studio lighting,
            professional render,
       
        `,
  },

  // Electronics
  electronics: {
    keywords: [
      "phone",
      "laptop",
      "computer",
      "tablet",
      "tv",
      "gadget",
      "device",
    ],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D electronic device,
            premium quality, 
            clean background,
            studio lighting,
            professional render,
        `,
  },

  // Vehicles
  vehicles: {
    keywords: [
      "car",
      "truck",
      "motorcycle",
      "bike",
      "vehicle",
      "bus",
      "van",
      "boat",
    ],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D vehicle design,
            
            showroom quality,
            professional visualization,
            premium quality, 
            clean background,
            studio lighting,
            professional render,
        `,
  },

  // Cute Animals
  cuteAnimals: {
    keywords: [
      "cute lion",
      "baby animal",
      "puppy",
      "kitten",
      "cub",
      "baby elephant",
    ],
    endpoint: DEEPAI_ENDPOINTS.CUTE_CREATURE,
    style: `
            cute cartoon animal,
            Pixar style,
            adorable character,
            friendly expression,
            soft features
        `,
  },

  // Realistic Animals
  realisticAnimals: {
    keywords: [
      "lion",
      "tiger",
      "wolf",
      "elephant",
      "giraffe",
      "bear",
      "realistic animal",
    ],
    endpoint: DEEPAI_ENDPOINTS.STABLE_DIFFUSION,
    style: `
            realistic 3D animal,
            natural features,
            detailed fur,
            anatomically correct,
            cinematic lighting
        `,
  },

  // Cartoon Characters
  cartoonCharacters: {
    keywords: [
      "cartoon character",
      "animated figure",
      "mascot",
      "cute character",
    ],
    endpoint: DEEPAI_ENDPOINTS.CUTE_CREATURE,
    style: `
            3D cartoon character,
            Pixar style animation,
            appealing design,
            expressive features,
            charming personality
        `,
  },

  // Fantasy Characters
  fantasyCharacters: {
    keywords: ["wizard", "dragon", "fairy", "monster", "creature", "mythical"],
    endpoint: DEEPAI_ENDPOINTS.FANTASY_WORLD,
    style: `
            fantasy character design,
            magical creature,
            mythical being,
            detailed features,
            atmospheric lighting
        `,
  },

  // Buildings and Architecture
  architecture: {
    keywords: [
      "building",
      "house",
      "architecture",
      "structure",
      "tower",
      "castle",
    ],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D architectural design,
            modern structure,
            professional visualization,
            detailed geometry,
            realistic materials
        `,
  },

  // Food and Drinks
  foodAndDrinks: {
    keywords: ["food", "drink", "meal", "beverage", "dish", "cuisine"],
    endpoint: DEEPAI_ENDPOINTS.OBJECTS_3D,
    style: `
            3D food visualization,
            appetizing presentation,
            culinary photography,
            fresh appearance,
            studio lighting
        `,
  },
};

// Function to detect the most appropriate category
function detectCategory(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  for (const [category, data] of Object.entries(CONTENT_CATEGORIES)) {
    if (data.keywords.some((keyword) => lowerPrompt.includes(keyword))) {
      return category;
    }
  }

  return "furniture"; // Default category
}

async function generate3DRender(prompt, options = {}) {
  try {
    const category = detectCategory(prompt);
    const categoryData = CONTENT_CATEGORIES[category];

    const formData = new FormData();
    const enhancedPrompt = `${prompt}, ${categoryData.style}`
      .replace(/\s+/g, " ")
      .trim();

    formData.append("text", enhancedPrompt);
    formData.append("width", options.width || 1024);
    formData.append("height", options.height || 1024);

    console.log(
      `Generating ${category} using endpoint: ${categoryData.endpoint}`
    );
    console.log("Enhanced prompt:", enhancedPrompt);

    const response = await axios.post(categoryData.endpoint, formData, {
      headers: {
        "api-key": process.env.DEEPAI_API_KEY,
        ...formData.getHeaders(),
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    console.error(`Generation Error for ${prompt}:`, error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

module.exports = {
  generate3DRender,
  CONTENT_CATEGORIES,
  DEEPAI_ENDPOINTS,
};
