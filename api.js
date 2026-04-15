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
        // Mock leaderboard data since we removed Ruxbet
        const mockData = {
            success: true,
            data: [
                { rank: 1, username: "PlayerOne", wager: 15000, bonus: 500 },
                { rank: 2, username: "HighRoller", wager: 12500, bonus: 350 },
                { rank: 3, username: "LuckyStar", wager: 10000, bonus: 250 },
                { rank: 4, username: "CryptoKing", wager: 8500, bonus: 200 },
                { rank: 5, username: "BetMaster", wager: 7000, bonus: 150 },
                { rank: 6, username: "Jackpot777", wager: 5500, bonus: 100 },
                { rank: 7, username: "SpinWin", wager: 4000, bonus: 75 },
                { rank: 8, username: "LuckyCharm", wager: 3000, bonus: 50 },
                { rank: 9, username: "BetPro", wager: 2000, bonus: 25 },
                { rank: 10, username: "NewPlayer", wager: 1000, bonus: 10 }
            ]
        };
        
        res.json(mockData);
        return;

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
