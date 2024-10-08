const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const apiToken = process.env.API_TOKEN;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Function to call Hugging Face API
async function query(data) {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            data,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`, // Your token from .env
                    "Content-Type": "application/json",
                },
                responseType: 'arraybuffer' // Specify that we expect an array buffer response
            }
        );
        
        return response.data; // This is the binary data (audio)
    } catch (error) {
        console.error("Error making API request:", error.message);
        throw error;
    }
}

// POST route to handle the music generation request
app.post("/api", async (req, res) => {
    const { inputs } = req.body; // Expecting 'inputs' in the request body
    try {
        const musicResponse = await query({ inputs });
        res.setHeader('Content-Type', 'audio/mpeg'); // Set the content type for audio
        res.send(musicResponse); // Send the audio binary data back to the frontend
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to generate music' });
    }
});

// Start the server
app.listen(80, () => {
    console.log('Server is running on port 80');
});
