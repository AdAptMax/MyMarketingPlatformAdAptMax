const axios = require('axios');

// ----- PART 1: AI Avatar Integration (Synthesia) -----
const SYNTHESIA_API_KEY = 'YOUR_SYNTHESIA_API_KEY';  // Replace with your Synthesia API key

// Function to create AI Avatar video
const createAIAvatarVideo = async (message) => {
    try {
        const response = await axios.post('https://api.synthesia.io/videos', {
            data: {
                template: 'your_template_id',  // Use an appropriate template ID
                video_script: {
                    text: message,  // The message you want the avatar to speak
                    language: 'en'   // You can change the language as required
                },
                avatar: 'avatar_id',  // Choose which avatar to use
                output_format: 'mp4'  // Choose video format (e.g., mp4)
            },
        }, {
            headers: {
                'Authorization': `Bearer ${SYNTHESIA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('AI Avatar Video Created:', response.data);
    } catch (error) {
        console.error('Error creating video with AI avatar:', error);
    }
};

// Call the function to create the video
createAIAvatarVideo("Welcome to AdAptMax! Let's help you scale your business!");

// ----- PART 2: AI Voiceover Integration (ElevenLabs) -----
const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY';  // Replace with your ElevenLabs API key

// Function to create AI voiceover
const createVoiceover = async (message) => {
    try {
        const response = await axios.post('https://api.elevenlabs.io/v1/text-to-speech', {
            voice: 'en_us_male',  // You can change this to a different voice if needed
            text: message,  // The script you want the AI to read out loud
            speed: 1.0,  // You can adjust the speed
            pitch: 1.0,  // You can adjust the pitch
        }, {
            headers: {
                'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Voiceover Created:', response.data);
    } catch (error) {
        console.error('Error creating voiceover:', error);
    }
};

// Call the function to create the voiceover
createVoiceover("This is your AI-powered marketing assistant speaking!");
