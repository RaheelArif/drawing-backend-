const FormData = require("form-data");
const axios = require("axios");
const taskStore = require("../services/taskStore");
const {
  checkRodinStatus,
  downloadRodinResults,
} = require("../services/rodinService");
const { API_URL, API_KEY } = require("../config/rodin");

async function processImage(req, res) {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: "No image data provided",
      });
    }

    let imageBuffer;
    if (imageData.startsWith("http")) {
      const imageResponse = await axios.get(imageData, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(imageResponse.data);
    } else {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    }

    // Create FormData with enhanced configuration
    const formData = new FormData();
    formData.append("images", imageBuffer, {
      filename: "canvas-drawing.png",
      contentType: "image/png",
    });

    // Enhanced configuration for better color and style support
    const config = {
      tier: "Sketch",
      colorize: true,  // Enable color preservation
      format: "glb",
      preserve_colors: true,  // Additional color preservation
      style: {
        type: "standard",
        parameters: {
          texture_size: 2048,  // Higher resolution textures
          quality: "high",
          detail_preservation: true
        }
      },
      // Style variations config
      variations: [
        {
          name: "preview",
          type: "standard"
        },
        {
          name: "geometry",
          type: "basic",
          parameters: {
            show_wireframe: false
          }
        },
        {
          name: "wireframe",
          type: "basic",
          parameters: {
            show_wireframe: true
          }
        },
        {
          name: "pbr",
          type: "pbr",
          parameters: {
            metalness: 0.5,
            roughness: 0.5,
            normal_strength: 1.0
          }
        },
        {
          name: "shaded",
          type: "standard",
          parameters: {
            shading: "smooth"
          }
        },
        {
          name: "toon",
          type: "toon",
          parameters: {
            steps: 4,
            edge_thickness: 1.0
          }
        },
        {
          name: "tracer",
          type: "pbr",
          parameters: {
            metalness: 1.0,
            roughness: 0.0,
            clearcoat: 1.0,
            transmission: 0.5
          }
        }
      ],
      // Material presets
      materials: {
        metallic: {
          type: "pbr",
          metalness: 1.0,
          roughness: 0.1
        },
        holographic: {
          type: "pbr",
          metalness: 1.0,
          roughness: 0.0,
          iridescence: 1.0
        },
        copper: {
          type: "pbr",
          metalness: 1.0,
          roughness: 0.3,
          color: "#B87333"
        },
        matte: {
          type: "standard",
          roughness: 1.0,
          metalness: 0.0
        }
      }
    };

    // Append all configuration
    formData.append("config", JSON.stringify(config));

    // Make request to Rodin API
    const rodinResponse = await axios.post(`${API_URL}/rodin`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${API_KEY}`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const taskUuid = rodinResponse.data.uuid;
    const subscriptionKey = rodinResponse.data.jobs.subscription_key;

    // Store enhanced task information
    taskStore.set(subscriptionKey, {
      taskUuid,
      status: "processing",
      files: null,
      config: config  // Store config for reference
    });

    res.json({
      success: true,
      subscriptionKey,
      message: "Conversion started",
      config: config  // Send config back to frontend
    });
  } catch (error) {
    console.error("Process Image Error Details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    res.status(500).json({
      success: false,
      error: error.message || "Error processing image",
    });
  }
}

async function checkStatus(req, res) {
  try {
    const { subscriptionKey } = req.body;

    if (!taskStore.has(subscriptionKey)) {
      return res.status(404).json({
        status: "failed",
        error: "Task not found",
      });
    }

    const taskInfo = taskStore.get(subscriptionKey);
    const statusResponse = await checkRodinStatus(subscriptionKey);
    const jobs = statusResponse.jobs;

    if (jobs.every((job) => job.status === "Done")) {
      if (!taskInfo.files) {
        const downloadResponse = await downloadRodinResults(taskInfo.taskUuid);
        taskInfo.files = downloadResponse.list;
        taskInfo.status = "completed";
        
        // Add style and material information
        taskInfo.styles = taskInfo.config.variations;
        taskInfo.materials = taskInfo.config.materials;
        
        taskStore.set(subscriptionKey, taskInfo);
      }
      
      return res.json({
        status: "completed",
        files: taskInfo.files,
        styles: taskInfo.config.variations,
        materials: taskInfo.config.materials
      });
    }

    if (jobs.some((job) => job.status === "Failed")) {
      taskInfo.status = "failed";
      taskStore.set(subscriptionKey, taskInfo);
      return res.json({
        status: "failed",
        error: "Conversion failed",
      });
    }

    return res.json({ status: "processing" });
  } catch (error) {
    console.error("Check Status Error:", error);
    res.status(500).json({
      status: "failed",
      error: error.message || "Error checking status",
    });
  }
}
async function proxyModel(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: "No URL provided",
      });
    }

    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
      headers: {
        Accept: "model/gltf-binary",
      },
    });

    // Set appropriate headers
    res.set({
      "Content-Type": "model/gltf-binary",
      "Content-Disposition": 'attachment; filename="model.glb"',
      "Access-Control-Allow-Origin": "*",
    });

    res.send(response.data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({
      error: "Failed to load model",
    });
  }
}
module.exports = {
  processImage,
  checkStatus,
  proxyModel,
};
