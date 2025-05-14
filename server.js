// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';
const WEB_KEY = 'c27070ea51ac4bbb375a5ecf9917ac6bf26f5437';

app.get('/api/carriers', async (req, res) => {
    try {
        const { dot, legalName, rows, page } = req.query;
        let url = FMCSA_BASE;
        let params = { webKey: WEB_KEY };

        if (legalName) {
            // Direct search by company name
            url += `/name/${legalName}`;
        } else if (dot) {
            // For DOT, fallback: do a paginated search and filter results (no direct usdot endpoint)
            url += `?webKey=${WEB_KEY}&rows=10&page=1&dotNumber=${dot}`;
            params = {}; // already included in URL
        } else {
            // Default: paginated list
            url += `?webKey=${WEB_KEY}&rows=${rows || 10}&page=${page || 1}`;
            params = {}; // already included in URL
        }

        const response = await axios.get(url, { params });
        res.json(response.data);
    } catch (err) {
        if (err.response) {
            console.error('FMCSA proxy error:', err.response.data);
            res.status(err.response.status || 500).json(err.response.data);
        } else {
            console.error('FMCSA proxy error:', err.message);
            res.status(500).json({ error: 'Proxy error', detail: err.message });
        }
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
