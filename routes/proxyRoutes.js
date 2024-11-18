const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/proxy-model', async (req, res) => {
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
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    res.set('Content-Type', response.headers['content-type']);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');

    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load model' });
  }
});

module.exports = router;