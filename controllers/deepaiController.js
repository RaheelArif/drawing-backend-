const { generate3DCartoon } = require('../services/deepaiService');

async function textTo3DCartoon(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text prompt is required'
      });
    }

    const result = await generate3DCartoon(text);
    
    res.json({
      success: true,
      imageUrl: result.output_url,
      details: result
    });

  } catch (error) {
    console.error('Text to 3D Cartoon Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate 3D cartoon'
    });
  }
}

module.exports = { textTo3DCartoon };