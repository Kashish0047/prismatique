const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static(__dirname));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
