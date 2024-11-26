// controllers/deepaiController.js
const { generateWithRetry } = require('../utils/imageGenerator');

const textTo3DCartoon = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text prompt is required'
            });
        }

        const result = await generateWithRetry(text);

        if (!result.output_url) {
            throw new Error('Failed to generate image URL');
        }

        return res.json({
            success: true,
            imageUrl: result.output_url
        });

    } catch (error) {
        console.error('Image Generation Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate image'
        });
    }
};

module.exports = {
    textTo3DCartoon
};