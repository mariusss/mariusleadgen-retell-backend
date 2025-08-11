const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Your Retell.ai credentials
const RETELL_API_KEY = 'key_671e8962e087d48c95e375e6278f';
const RETELL_AGENT_ID = 'agent_cba0fc552244cab6de8f98a2ae';

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        retell_configured: true
    });
});

// Create web call
app.post('/api/create-web-call', async (req, res) => {
    try {
        const response = await fetch('https://api.retellai.com/v2/create-web-call', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RETELL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                agent_id: RETELL_AGENT_ID,
                metadata: {
                    source: 'railway-deployment',
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Retell API Error: ${response.status}`);
        }

        res.json({
            success: true,
            web_call_url: data.web_call_url,
            call_id: data.call_id
        });

    } catch (error) {
        console.error('Web call error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create phone call
app.post('/api/create-phone-call', async (req, res) => {
    const { customer_number } = req.body;
    
    try {
        const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RETELL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                agent_id: RETELL_AGENT_ID,
                customer_number: customer_number,
                metadata: {
                    source: 'railway-phone',
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Phone API Error: ${response.status}`);
        }

        res.json({
            success: true,
            call_id: data.call_id
        });

    } catch (error) {
        console.error('Phone call error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
