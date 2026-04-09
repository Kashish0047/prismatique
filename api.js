const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes including file://
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'false');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// API endpoint to fetch leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        const options = {
            hostname: 'api.ruxbet.com',
            path: '/users/me/leaderboards?code=prismatique',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer pk_jre0hoOfQfim59OW5DL1n4LrpQBvIzJx',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('API Response:', jsonData);
                    
                    // Send the data back to frontend
                    res.json({
                        success: true,
                        data: jsonData
                    });
                } catch (parseError) {
                    console.error('Error parsing API response:', parseError);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to parse API response'
                    });
                }
            });
        });

        apiReq.on('error', (error) => {
            console.error('API request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch data from API'
            });
        });

        apiReq.end();

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Leaderboard API available at: http://localhost:${PORT}/api/leaderboard`);
});
