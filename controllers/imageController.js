const FormData = require('form-data');
const axios = require('axios');
const taskStore = require('../services/taskStore');
const { checkRodinStatus, downloadRodinResults } = require('../services/rodinService');
const { API_URL, API_KEY } = require('../config/rodin');

async function processImage(req, res) {
  try {
    const { imageData } = req.body;
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('images', imageBuffer, {
      filename: 'canvas-drawing.png',
      contentType: 'image/png'
    });
    formData.append('tier', 'Sketch');

    const rodinResponse = await axios.post(`${API_URL}/rodin`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const taskUuid = rodinResponse.data.uuid;
    const subscriptionKey = rodinResponse.data.jobs.subscription_key;

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
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing image'
    });
  }
}

async function checkStatus(req, res) {
  try {
    const { subscriptionKey } = req.body;
    
    if (!taskStore.has(subscriptionKey)) {
      return res.status(404).json({
        status: 'failed',
        error: 'Task not found'
      });
    }

    const taskInfo = taskStore.get(subscriptionKey);
    const statusResponse = await checkRodinStatus(subscriptionKey);
    const jobs = statusResponse.jobs;

    if (jobs.every(job => job.status === 'Done')) {
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
    
    if (jobs.some(job => job.status === 'Failed')) {
      taskInfo.status = 'failed';
      taskStore.set(subscriptionKey, taskInfo);
      return res.json({
        status: 'failed',
        error: 'Conversion failed'
      });
    }

    return res.json({ status: 'processing' });

  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error: error.message || 'Error checking status'
    });
  }
}

module.exports = {
  processImage,
  checkStatus
};
