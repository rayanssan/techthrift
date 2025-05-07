"use strict";

import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { router as dbConnection, dbReady } from './resources/dbConnection.js';
import { router as ttApi } from './resources/ttApi.js';
import https from 'https';
import fs from 'fs';
const app = express();
const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));
app.use(express.json());
export const exposeApi = process.argv.includes('-exposeApi');

const serverPem = fs.readFileSync(path.join(__dirname, 'haproxy.pem'), 'utf8');
const credentials = { key: serverPem, cert: serverPem };

dbReady.then((isConnected) => {
    if (isConnected) {
        app.use(dbConnection);
        app.use(ttApi);

        // Handle non-existent routes
        app.use((req, res) => {
            const errorPagePath = path.join(__dirname, 'html/404.html');
            res.status(404).sendFile(errorPagePath, (err) => {
                if (err) {
                    console.error('Error serving 404.html:', err);
                    res.status(500).send('Internal Server Error');
                }
            });
        });

        if (process.argv.includes("-https")) {
            https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
                console.log(`Server is running on https://0.0.0.0:${PORT}`);
            });
        } else {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server is running on http://0.0.0.0:${PORT}`);
            });
        }
    } else {
        exec('node resources/dbCreate.js', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error creating database: ${stderr}`);
                return;
            }
            console.log(stdout);
            console.log('Connected to the TechThrift database.');
            // Restart the techthrift.js script after dbCreate.js is executed
            if (process.argv.includes("-https")) {
                console.log(`Server is running on https://0.0.0.0:${PORT}`);
                exec('node techthrift.js -https', () => {
                    process.exit(0); // Exit the current process after restarting    
                });
            } else {
                console.log(`Server is running on http://0.0.0.0:${PORT}`);
                exec('node techthrift.js', () => {
                    process.exit(0); // Exit the current process after restarting    
                });
            }
        })
    }
});

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

// Wishlist
app.get('/wishlist', (req, res) => {
    const pagePath = path.join(__dirname, 'html/wishlist.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving wishlist.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Stores
app.get('/stores', (req, res) => {
    const pagePath = path.join(__dirname, 'html/storesList.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving storesList.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Store
app.get('/store', (req, res) => {
    const pagePath = path.join(__dirname, 'html/store.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving store.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Partners
app.get('/partners', (req, res) => {
    const pagePath = path.join(__dirname, 'html/partners.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving partners.html:', err);
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
        console.log(err);
        res.status(500).send(err.message);
    }
});