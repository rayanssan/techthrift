"use strict";

const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000;
const dbConnection = require('./resources/dbConnection.js');
const ttApi = require('./resources/ttApi.js'); // Import ttApi.js
app.use(dbConnection.router);
app.use(ttApi);
app.use(express.static(__dirname));

// Homepage, entry point
app.get(['/homepage', '/'], (req, res) => {
    const pagePath = path.join(__dirname, 'html/homepage.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving homepage.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Product for sale
app.get('/product', (req, res) => {
    const pagePath = path.join(__dirname, 'html/product.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving product.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Category
app.get('/category', (req, res) => {
    const pagePath = path.join(__dirname, 'html/category.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving category.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Search
app.get('/search', (req, res) => {
    const pagePath = path.join(__dirname, 'html/search.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving search.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Cart
app.get('/cart', (req, res) => {
    const pagePath = path.join(__dirname, 'html/cart.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving cart.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Stores Map
app.get('/storesMap', (req, res) => {
    const pagePath = path.join(__dirname, 'html/storesMap.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving storesMap.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Authentication
app.get('/authentication', (req, res) => {
    const pagePath = path.join(__dirname, 'html/authentication.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving authentication.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Dashboard
app.get('/adminDashboard', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminDashboard.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminDashboard.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Products
app.get('/adminProducts', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminProducts.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminProducts.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Users
app.get('/adminUsers', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminUsers.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminadminUsers.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Orders
app.get('/adminOrders', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminOrders.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminadminOrders.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Nominatim OpenStreetMap API
app.get("/geocode", async (req, res) => {
    const query = req.query.q;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error contacting Nominatim API" });
    }
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});