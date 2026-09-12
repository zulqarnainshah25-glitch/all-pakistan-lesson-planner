const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Yeh folder aapke HTML/CSS ko load karega

// Ek Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Mubarak ho! Aapka Lesson Plan API server theek se chal raha hai!" });
});

// Server ko start karna
app.listen(PORT, () => {
    console.log(`Server chal raha hai is link par: http://localhost:${PORT}`);
});