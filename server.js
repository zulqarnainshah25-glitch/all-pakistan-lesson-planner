const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env file
require('dotenv').config({
    path: path.resolve(__dirname, '.env')
});

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// EJS Template Engine Setup
// ==========================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());

// CSS aur Images ke liye public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// EJS PAGES
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
// Gemini API Key Setup
// ==========================================

// Fallback ke sath key setup kar rahe hain
// Is line ko replace karein (trim add kar diya hai)
const apiKey = process.env.GEMINI_API_KEY;
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

if (!apiKey) {
    console.error(
        'ERROR: API Key nahi mili!'
    );
}

// ==========================================
// Test Route
// ==========================================

app.get('/api/test', (req, res) => {
    res.json({
        message: 'Lesson Plan API is working perfectly!'
    });
});

// ==========================================
// Generate Lesson Plan
// ==========================================

app.post('/api/generate-plan', async (req, res) => {

    try {

        // ------------------------------------------
        // 1. Frontend se original prompt
        // ------------------------------------------

        let { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {

            return res.status(400).json({
                success: false,
                message: 'Prompt is required.'
            });

        }

        // ------------------------------------------
        // 2. Advanced Rules
        // ------------------------------------------

        const advancedRules = `

CRITICAL INSTRUCTIONS FOR CONTENT GENERATION:

1. CLASS LEVEL:
Strictly adapt the vocabulary, complexity, and teaching methodology to the specific Class level mentioned.

2. EXERCISES & ASSESSMENT:
Make the exercise sections highly detailed, professional, and directly relevant to the topic.

3. Q&A (MANDATORY):
You MUST provide exactly 5 highly relevant Questions with their complete, detailed Answers.

CRITICAL:
Format this as a SINGLE plain text string with numbered questions and answers.

Example:
"Q1: ... A1: ...
Q2: ... A2: ...
Q3: ... A3: ...
Q4: ... A4: ...
Q5: ... A5: ..."

DO NOT return an array or nested objects.

4. OBJECTIVE TYPE:
Include True/False, Fill in the blanks, or MCQs in the "otherExercises" field.

Format as a single string.

5. WORD MEANINGS:
Provide important word meanings and definitions in the "wordMeanings" and "vocabulary" fields.

6. MATH SPECIAL RULE:
If the Subject is "Mathematics", "Math", or involves mathematical concepts:

- MUST include at least 2 complete, step-by-step solved problems.
- Put these in the "oldExercise" or "procedure" field.
- Also include key mathematical definitions.

7. JSON FORMAT:
Return ONLY a valid JSON object.

EVERY key's value must be a single formatted String.

DO NOT return nested arrays.

DO NOT return nested objects.

DO NOT add markdown before or after the JSON.

`;

        // Original prompt + advanced rules
        prompt = prompt + advancedRules;

        // ------------------------------------------
        // 3. API Key Check & Fetch URL
        // ------------------------------------------

        if (!apiKey) {
            throw new Error('API Key set nahi hai.');
        }

        console.log('Gemini ko request bheji ja rahi hai...');

        // Yahan gemini-3.5-flash-lite update kar diya gaya hai
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

        // ------------------------------------------
        // 4. API Request
        // ------------------------------------------

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

        // ------------------------------------------
        // 5. Error & Response Handling
        // ------------------------------------------

        if (!response.ok) {
            console.error("API Response Error:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Gemini API se invalid response aaya.");
        }

        const responseText = data.candidates[0].content.parts[0].text;

        console.log('AI Response successfully aa gaya!');

        // ------------------------------------------
        // 6. Send Response to Frontend
        // ------------------------------------------

        res.json({
            success: true,
            data: responseText
        });

    } catch (error) {

        console.error('AI Error Details:', error);

        res.status(500).json({
            success: false,
            message: 'AI response generate karne mein masla aaya: ' + error.message
        });

    }

});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});