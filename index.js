const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5002;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rodin API configuration
const RODIN_API_URL = 'https://hyperhuman.deemos.com/api/v2';
const RODIN_API_KEY = process.env.RODIN_API_KEY;

// Store task information
const taskStore = new Map();
app.get('/proxy-model', async (req, res) => {
  try {
    const modelUrl = req.query.url;
    
    if (!modelUrl) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    const response = await axios({
      method: 'get',
      url: modelUrl,
      responseType: 'stream',
      headers: {
        // Add any necessary headers from the original request
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    // Forward the content type
    res.set('Content-Type', response.headers['content-type']);
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');

    // Pipe the model data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying model:', error);
    res.status(500).json({ error: 'Failed to load model' });
  }
});
// Helper function to check task status
async function checkRodinStatus(subscriptionKey) {
  try {
    const response = await axios.post(
      `${RODIN_API_URL}/status`,
      { subscription_key: subscriptionKey },
      {
        headers: {
          'Authorization': `Bearer ${RODIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking Rodin status:', error);
    throw error;
  }
}

// Helper function to download results
async function downloadRodinResults(taskUuid) {
  try {
    const response = await axios.post(
      `${RODIN_API_URL}/download`,
      { task_uuid: taskUuid },
      {
        headers: {
          'Authorization': `Bearer ${RODIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error downloading results:', error);
    throw error;
  }
}

// Process image endpoint
app.post('/process-image', async (req, res) => {
  try {
    const { imageData } = req.body;
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create form data for Rodin API
    const formData = new FormData();
    formData.append('images', imageBuffer, {
      filename: 'canvas-drawing.png',
      contentType: 'image/png'
    });
    formData.append('tier', 'Sketch'); // Using Sketch tier for faster processing

    // Submit to Rodin API
    const rodinResponse = await axios.post(`${RODIN_API_URL}/rodin`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${RODIN_API_KEY}`
      }
    });

    const taskUuid = rodinResponse.data.uuid;
    const subscriptionKey = rodinResponse.data.jobs.subscription_key;

    // Store task information
    taskStore.set(subscriptionKey, {
      taskUuid,
      status: 'processing',
      files: null
    });

    res.json({
      success: true,
      subscriptionKey,
      message: 'Conversion started'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing image'
    });
  }
});

// Check status endpoint
app.post('/check-status', async (req, res) => {
  try {
    const { subscriptionKey } = req.body;
    
    if (!taskStore.has(subscriptionKey)) {
      return res.status(404).json({
        status: 'failed',
        error: 'Task not found'
      });
    }

    const taskInfo = taskStore.get(subscriptionKey);
    
    // Check status with Rodin API
    const statusResponse = await checkRodinStatus(subscriptionKey);
    const jobs = statusResponse.jobs;

    // Check if all jobs are complete
    if (jobs.every(job => job.status === 'Done')) {
      // If we haven't downloaded the files yet
      if (!taskInfo.files) {
        const downloadResponse = await downloadRodinResults(taskInfo.taskUuid);
        taskInfo.files = downloadResponse.list;
        taskInfo.status = 'completed';
        taskStore.set(subscriptionKey, taskInfo);
      }

      return res.json({
        status: 'completed',
        files: taskInfo.files
      });
    }
    
    // Check if any job failed
    if (jobs.some(job => job.status === 'Failed')) {
      taskInfo.status = 'failed';
      taskStore.set(subscriptionKey, taskInfo);
      return res.json({
        status: 'failed',
        error: 'Conversion failed'
      });
    }

    // Still processing
    return res.json({
      status: 'processing'
    });

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      status: 'failed',
      error: error.message || 'Error checking status'
    });
  }
});

app.post('/generate-2d-image', async (req, res) => {
  try {
    const { prompt, width, height } = req.body;

    const response = await axios.post(
      'https://api.rodin.ai/v1/image/generate',
      {
        prompt,
        width,
        height,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RODIN_API_KEY}`,
        },
      }
    );

    const generatedImageUrl = response.data.imageUrl;

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
    });
  } catch (error) {
    console.error('Error generating 2D image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error generating 2D image',
    });
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});