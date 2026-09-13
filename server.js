const express = require('express');
const cors = require('cors');
const path = require('path'); // Path module ko top par kar diya hai
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
// CSS aur Images ke liye public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// NAYA ROUTE: EJS Home Page Ke Liye
// ==========================================
app.get('/', (req, res) => {
    res.render('index'); 
});
app.get('/lesson-planner', (req, res) => {
    res.render('lesson-planner'); 
});
app.get('/salary-calculator', (req, res) => {
    res.render('salary-calculator'); 
});
app.get('/about', (req, res) => {
    res.render('about'); 
});

app.get('/contact', (req, res) => {
    res.render('contact'); 
});

app.get('/terms', (req, res) => {
    res.render('terms'); 
});

app.get('/disclaimer', (req, res) => {
    res.render('disclaimer'); 
});

app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy'); 
});
// ==========================================

// Gemini AI Setup (Key .env se le raha hai)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Lesson Plan API is working perfectly!" });
});

app.post('/api/generate-plan', async (req, res) => {
    try {
        // 1. Frontend se aane wala original prompt
        let { prompt } = req.body;
        
        // 2. Aapki zabardast logic aur Math rules (isay original prompt ke sath jor diya hai)
        const advancedRules = `
        
        CRITICAL INSTRUCTIONS FOR CONTENT GENERATION:
        1. CLASS LEVEL: Strictly adapt the vocabulary, complexity, and teaching methodology to the specific Class level mentioned.
        2. EXERCISES & ASSESSMENT: Make the exercise sections highly detailed, professional, and directly relevant to the topic.
        3. Q&A (MANDATORY): You MUST provide exactly 5 highly relevant Questions with their complete, detailed Answers. **CRITICAL: Format this as a SINGLE plain text string with numbered questions and answers (e.g., "Q1: ... A1: ..."). DO NOT return an array or nested objects.**
        4. OBJECTIVE TYPE: Include True/False, Fill in the blanks, or MCQs in the "otherExercises" field. Format as a single string.
        5. WORD MEANINGS: Provide important word meanings and definitions in the "wordMeanings" and "vocabulary" fields.
        6. MATH SPECIAL RULE: If the Subject is "Mathematics", "Math", or involves mathematical concepts, you MUST include at least 2 complete, step-by-step solved problems in the "oldExercise" or "procedure" field. Also, include key mathematical definitions.
        7. JSON FORMAT: Return ONLY a valid JSON object where EVERY key's value is a single formatted String (NO nested arrays or objects).
        `;
        
        // Prompt ko update kar diya
        prompt = prompt + advancedRules;

        // 3. Yahan wahi key lagayi hai jo Apps Script mein 100% chal rahi thi!
        const apiKey = process.env.GOOGLE_API_KEY

        // Exact wahi URL jo Apps Script mein use kiya hai
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

        console.log("Working Apps Script Key + Advanced Math Prompt ke sath request ja rahi hai...");

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "API request failed");
        }

        const responseText = data.candidates[0].content.parts[0].text;
        console.log("AI Response successfully aa gaya!");

        res.json({ success: true, data: responseText });
    } catch (error) {
        console.error("AI Error Details:", error);
        res.status(500).json({ success: false, message: "AI response generate karne mein masla aaya: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});