"use strict";

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const dbConnection = require('./resources/dbConnection.js');
const ttApi = require('./resources/ttApi.js'); // Import ttApi.js
app.use(dbConnection.router);
app.use(ttApi);
app.use(express.static(__dirname));

// Homepage, entry point
app.get(['/homepage', '/'], (req, res) => {
    const homepagePath = path.join(__dirname, 'html/homepage.html');
    res.sendFile(homepagePath, (err) => {
        if (err) {
            console.error('Error serving homepage.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Product for sale
app.get('/product', (req, res) => {
    const homepagePath = path.join(__dirname, 'html/product.html');
    res.sendFile(homepagePath, (err) => {
        if (err) {
            console.error('Error serving homepage.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Category
app.get('/category', (req, res) => {
    const homepagePath = path.join(__dirname, 'html/category.html');
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

// Admin Dashboard
app.get('/adminDashboard', (req, res) => {
    const adminDashboardPath = path.join(__dirname, 'html/adminDashboard.html');
    res.sendFile(adminDashboardPath, (err) => {
        if (err) {
            console.error('Error serving adminDashboard.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Products
app.get('/adminProducts', (req, res) => {
    const adminProductsPath = path.join(__dirname, 'html/adminProducts.html');
    res.sendFile(adminProductsPath, (err) => {
        if (err) {
            console.error('Error serving adminProducts.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Users
app.get('/adminUsers', (req, res) => {
    const adminUsersPath = path.join(__dirname, 'html/adminUsers.html');
    res.sendFile(adminUsersPath, (err) => {
        if (err) {
            console.error('Error serving adminadminUsers.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});