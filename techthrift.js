"use strict";

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const dbConnection = require('./resources/dbConnection.js');
const ttApi = require('./resources/ttApi'); // Import ttApi.js
app.use(dbConnection.router);
app.use(ttApi);
app.use(express.static(__dirname));

// Homepage, entry point
app.get('/homepage' && '/', (req, res) => {
    const homepagePath = path.join(__dirname, 'html/homepage.html');
    res.sendFile(homepagePath, (err) => {
        if (err) {
            console.error('Error serving homepage.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Authentication
app.get('/authentication', (req, res) => {
    const homepagePath = path.join(__dirname, 'html/authentication.html');
    res.sendFile(homepagePath, (err) => {
        if (err) {
            console.error('Error serving homepage.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});