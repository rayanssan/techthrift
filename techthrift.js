"use strict";

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as dbConnection, dbReady } from './resources/dbConnection.js';
import { router as ttApi } from './resources/ttApi.js';
import { db, dbR } from './resources/dbConnection.js';
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
const app = express();
const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Help
app.get('/help', (req, res) => {
    const pagePath = path.join(__dirname, 'html/help.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving help.html:', err);
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

// Profile
app.get('/profile', (req, res) => {
    const pagePath = path.join(__dirname, 'html/profile.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving profile.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Profile
app.get('/adminProfile', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminProfile.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminProfile.html:', err);
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

// Admin Dontations
app.get('/adminDonations', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminDonations.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminDonations.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Charities
app.get('/adminCharities', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminCharities.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminCharities.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Admin Orders
app.get('/adminOrders', (req, res) => {
    const pagePath = path.join(__dirname, 'html/adminOrders.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving adminOrders.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Authentication
app.get('/authentication', (req, res) => {
    const auth0Domain = "dev-1qdq127lj6aekksz.us.auth0.com";
    const clientID = "iZ7i3x872x2Lwwg9I3jwg50JgePjaB3a";
    const protocol = req.protocol;
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}/`;

    const loginUrl = `https://${auth0Domain}/authorize?response_type=token&client_id=${clientID}&redirect_uri=${redirectUri}&scope=openid profile email&connection=Username-Password-Authentication&prompt=login`;

    res.redirect(loginUrl);
});

// Registration
app.get('/registration', (req, res) => {
    const pagePath = path.join(__dirname, 'html/registration.html');
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error('Error serving registration.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Reports
app.get('/reports', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Enter Password</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="../styles/stylesheet.css">
    </head>
    <body>
    <header class="p-3 border-bottom bg-white">
        <div class="d-flex justify-content-between container">
            <div class="row align-items-center gap-3">
                <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                    <a onclick="location.replace(document.referrer)" class="btn pt-1 btn-link text-decoration-none p-0">
                        <i class="fa fa-angle-left fs-3"></i>
                    </a>
                    <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                        style="border-right: 1px solid lightgray;">
                        <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                    </a>
                    <h4 class="mb-1 ps-1">Usage Reports</h4>
                </div>
            </div>
        </div>
    </header>
      <div class="container mt-5" style="max-width: 400px;">
        <h3 class="mb-4">Enter Token</h3>
        <form method="POST" action="/reports">
          <div class="mb-3">
            <label for="password" class="form-label">Token</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" autofocus required />
          </div>
          <button type="submit" class="btn btn-primary w-100">Submit</button>
        </form>
      </div>
    </body>
    <!-- Scripts -->
    <script src="../scripts/auth.js"></script>
    <!-- Scripts -->
    </html>
  `);
});
app.post('/reports', async (req, res) => {
    const { password } = req.body;

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const renderErrorForm = (res) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Enter Password</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="../styles/stylesheet.css">
        </head>
        <body>
        <header class="p-3 border-bottom bg-white">
        <div class="d-flex justify-content-between container">
            <div class="row align-items-center gap-3">
                <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                    <a onclick="location.replace(document.referrer)" class="btn pt-1 btn-link text-decoration-none p-0">
                        <i class="fa fa-angle-left fs-3"></i>
                    </a>
                    <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                        style="border-right: 1px solid lightgray;">
                        <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                    </a>
                    <h4 class="mb-1 ps-1">Usage Reports</h4>
                </div>
            </div>
        </div>
    </header>
        <div class="container mt-5" style="max-width: 400px;">
            <h3 class="mb-4">Enter Token</h3>
            <div class="alert alert-danger" role="alert">
            Incorrect token, try again.
            </div>
            <form method="POST" action="/reports">
            <div class="mb-3">
                <label for="password" class="form-label">Token</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" autofocus required />
            </div>
            <button type="submit" class="btn btn-primary w-100">Submit</button>
            </form>
        </div>
        </body>
        </html>
        <script src="../scripts/auth.js"></script>
    `);
    }
    db.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (primaryErr, primaryRows) => {
        if (primaryErr) {
            console.warn('Primary DB query failed, trying replica...', primaryErr);

            dbR.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (replicaErr, replicaRows) => {
                if (replicaErr) {
                    console.error('Both primary and replica DB queries failed', replicaErr);
                    return res.status(500).send('Internal Server Error');
                }

                if (replicaRows.length > 0) {
                    return res.redirect('/report');
                } else {
                    return renderErrorForm(res);
                }
            });

        } else {
            if (primaryRows.length > 0) {
                return res.redirect('/report');
            } else {
                return renderErrorForm(res);
            }
        }
    });
});