"use strict";

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as dbConnection, dbReady } from './resources/dbConnection.js';
import { router as ttApi } from './resources/ttApi.js';
//import { db, dbR } from './resources/dbConnection.js';
import { db } from './resources/dbConnection.js';
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
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>TechThrift - Usage Reports</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="../styles/stylesheet.css">
    </head>
    <body>
    <header class="p-3 border-bottom bg-white">
        <div class="d-flex justify-content-between container">
            <div class="row align-items-center gap-3">
                <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
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
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>TechThrift - Usage Reports</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../styles/stylesheet.css">
        </head>
        <body>
        <header class="p-3 border-bottom bg-white">
            <div class="d-flex justify-content-between container">
                <div class="row align-items-center gap-3">
                    <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
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

            // dbR.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (replicaErr, replicaRows) => {
            //     if (replicaErr) {
            //         console.error('Both primary and replica DB queries failed', replicaErr);
            //         return res.status(500).send('Internal Server Error');
            //     }

            //     if (replicaRows.length > 0) {
            //         return res.redirect('/report');
            //     } else {
            //         return renderErrorForm(res);
            //     }
            // });

        } else {
            if (primaryRows.length > 0) {
                return res.redirect('/report');
            } else {
                return renderErrorForm(res);
            }
        }
    });
});

// Manage order
app.get('/manageOrder', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>TechThrift - Manage Order</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="../styles/stylesheet.css">
        </head>
        <body>
        <header class="p-3 border-bottom bg-white">
            <div class="d-flex justify-content-between container">
                <div class="row align-items-center gap-3">
                    <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                        <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                            style="border-right: 1px solid lightgray;">
                            <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                        </a>
                        <h4 class="mb-1 ps-1">Manage Order</h4>
                    </div>
                </div>
            </div>
        </header>
        <div class="container mt-5" style="max-width: 400px;">
            <h3 class="mb-4">Enter Information</h3>
            <form method="POST" action="/manageOrder">
                <div class="mb-3">
                    <label for="transaction_id" class="form-label">Transaction ID</label>
                    <input type="number" class="form-control" id="transaction_id" name="transaction_id" placeholder="Enter transaction ID" autofocus required>
                </div>

                <div class="mb-3">
                    <label for="transaction_type" class="form-label">Transaction Type</label>
                    <select class="form-select mb-3" id="transaction_type" name="transaction_type" onchange="showStatusOptions()" required>
                        <option value="" disabled>Select transaction type</option>
                        <option value="sale">Sale</option>
                        <option value="repair">Repair</option>
                    </select>
                </div>

                <div class="mb-3" id="status-select-container">
                    <!-- Status select will be injected here -->
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Token</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" required />
                </div>

                <button type="submit" class="btn btn-primary w-100">Submit</button>
            </form>
        </div>
        <!-- Scripts -->
        <script src="../scripts/auth.js"></script>
        <script>
            function showStatusOptions() {
            const type = document.getElementById('transaction_type').value;
            const container = document.getElementById('status-select-container');

            let optionsHtml = "";

            if (type === 'sale') {
                optionsHtml = \`
                <label for="newStatus" class="form-label">Sale Status</label>
                <select class="form-select" id="newStatus" name="newStatus" required>
                    <option value="" disabled selected>Select status</option>
                    <option value="To be shipped">To be shipped</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                \`;
            } else if (type === 'repair') {
                optionsHtml = \`
                <label for="newStatus" class="form-label">Repair Status</label>
                <select class="form-select" id="newStatus" name="newStatus" required>
                    <option value="" disabled selected>Select status</option>
                    <option value="In repairs">In repairs</option>
                    <option value="Repaired; Awaiting Collection">Repaired; Awaiting Collection</option>
                    <option value="Repaired; Collected">Repaired; Collected</option>
                </select>
                \`;
            }

            container.innerHTML = optionsHtml;
            }
        </script>
        <!-- Scripts -->
        </body>
        </html>
  `);
});
app.post('/manageOrder', async (req, res) => {
    const { transaction_id, transaction_type, newStatus, password } = req.body;

    if (!transaction_id || !transaction_type || !password) {
        return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const renderErrorForm = () => {
        return res.send(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>TechThrift - Manage Order</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../styles/stylesheet.css">
            </head>
            <body>
                <header class="p-3 border-bottom bg-white">
                    <div class="d-flex justify-content-between container">
                        <div class="row align-items-center gap-3">
                            <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                                <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                                    style="border-right: 1px solid lightgray;">
                                    <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                                </a>
                                <h4 class="mb-1 ps-1">Manage Order</h4>
                            </div>
                        </div>
                    </div>
                </header>
            <div class="container mt-5" style="max-width: 400px;">
                <h3 class="mb-4">Enter Information</h3>
                <div class="alert alert-danger" role="alert">Incorrect token or transaction ID doesn't exist, try again.</div>
                <form method="POST" action="/manageOrder">
                    <div class="mb-3">
                        <label for="transaction_id" class="form-label">Transaction ID</label>
                        <input type="number" class="form-control" id="transaction_id" name="transaction_id" placeholder="Enter transaction ID" autofocus required>
                    </div>

                    <div class="mb-3">
                        <label for="transaction_type" class="form-label">Transaction Type</label>
                        <select class="form-select mb-3" id="transaction_type" name="transaction_type" onchange="showStatusOptions()" required>
                            <option value="" disabled>Select transaction type</option>
                            <option value="sale">Sale</option>
                            <option value="repair">Repair</option>
                        </select>
                    </div>

                    <div class="mb-3" id="status-select-container">
                        <!-- Status select will be injected here -->
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">Token</label>
                        <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" required />
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Submit</button>
                </form>
            </div>

            <!-- Scripts -->
            <script src="../scripts/auth.js"></script>
            <script>
                function showStatusOptions() {
                const type = document.getElementById('transaction_type').value;
                const container = document.getElementById('status-select-container');

                let optionsHtml = "";

                if (type === 'sale') {
                    optionsHtml = \`
                    <label for="newStatus" class="form-label">Sale Status</label>
                    <select class="form-select" id="newStatus" name="newStatus" required>
                        <option value="" disabled selected>Select status</option>
                        <option value="To be shipped">To be shipped</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    \`;
                } else if (type === 'repair') {
                    optionsHtml = \`
                    <label for="newStatus" class="form-label">Repair Status</label>
                    <select class="form-select" id="newStatus" name="newStatus" required>
                        <option value="" disabled selected>Select status</option>
                        <option value="In repairs">In repairs</option>
                        <option value="Repaired; Awaiting Collection">Repaired; Awaiting Collection</option>
                        <option value="Repaired; Collected">Repaired; Collected</option>
                    </select>
                    \`;
                }

                container.innerHTML = optionsHtml;
                }
            </script>
            <!-- Scripts -->
            </body>
            </html>
        `);
    };

    const validateToken = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (err, rows) => {
                if (err) {
                    // dbR.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (replicaErr, replicaRows) => {
                    //     if (replicaErr) return reject(replicaErr);
                    //     resolve(replicaRows.length > 0);
                    // });
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    };

    const validateProduct = () => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${transaction_type}s WHERE transaction_id = ?`, [transaction_id], (err, rows) => {
                if (err) {
                    // dbR.query(`SELECT * FROM ${transaction_type}s WHERE transaction_id = ?`, [transaction_id], (replicaErr, replicaRows) => {
                    //     if (replicaErr) return reject(replicaErr);
                    //     resolve(replicaRows.length > 0);
                    // });
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    };

    try {
        const isValid = (await validateToken()) && (await validateProduct());
        if (!isValid) return renderErrorForm();

        let routePath = '';
        if (transaction_type === 'sale') {
            routePath = `/tttransaction/sales/updateStatus/${transaction_id}`;
        } else if (transaction_type === 'repair') {
            routePath = `/tttransaction/repairs/updateStatus/${transaction_id}`;
        } else {
            return res.status(400).send('Invalid transaction type.');
        }

        const response = await fetch(`${req.protocol}://${req.get('host')}/tttransaction/${transaction_type === 'sale' ? 'sales' : 'repairs'}/updateStatus/${transaction_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': `${req.protocol}://${req.get('host')}`
            },
            body: JSON.stringify({ newStatus })
        });

        if (!response.ok) {
            console.error('Status update failed:', await response.text());
            return res.status(500).send('Failed to update status.');
        }

        return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>TechThrift - Manage Order</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../styles/stylesheet.css">
        </head>
        <body>
            <header class="p-3 border-bottom bg-white">
                <div class="d-flex justify-content-between container">
                    <div class="row align-items-center gap-3">
                        <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                            <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                                style="border-right: 1px solid lightgray;">
                                <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                            </a>
                            <h4 class="mb-1 ps-1">Manage Order</h4>
                        </div>
                    </div>
                </div>
            </header>
            <div class="container mt-5">
                <div class="alert alert-success">
                    Transaction of ID <strong>${transaction_id}</strong> was successfully updated.
                </div>
                <a href="/manageOrder" class="btn btn-primary">Go back</a>
            </div>
        </body>
        <!-- Scripts -->
        <script src="../scripts/auth.js"></script>
        <!-- Scripts -->
        </html>`);
    } catch (err) {
        console.error('Error during transaction status update:', err);
        return res.status(500).send('Internal Server Error');
    }
});

// Manage shipping costs
app.get('/manageShipping', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>TechThrift - Manage Shipping</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="../styles/stylesheet.css">
    </head>
    <body>
    <header class="p-3 border-bottom bg-white">
        <div class="d-flex justify-content-between container">
            <div class="row align-items-center gap-3">
                <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                    <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                        style="border-right: 1px solid lightgray;">
                        <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                    </a>
                    <h4 class="mb-1 ps-1">Manage Shipping</h4>
                </div>
            </div>
        </div>
    </header>
      <div class="container mt-5" style="max-width: 400px;">
        <h3 class="mb-4">Enter Information</h3>
        <form method="POST" action="/manageShipping">
          <div class="mb-3">
            <label for="shipping_cost" class="form-label">Shipping Cost</label>
            <input 
            type="number" 
            step="0.01" 
            min="0" 
            class="mb-2 form-control" 
            id="shipping_cost" 
            name="shipping_cost" 
            placeholder="Enter shipping cost" 
            required>
            <label for="password" class="form-label">Token</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" autofocus required>
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
app.post('/manageShipping', async (req, res) => {
    const { password, shipping_cost } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const renderErrorForm = (message = 'Incorrect token, try again.') => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>TechThrift - Manage Shipping</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../styles/stylesheet.css">
        </head>
        <body>
        <header class="p-3 border-bottom bg-white">
            <div class="d-flex justify-content-between container">
                <div class="row align-items-center gap-3">
                    <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                        <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                            style="border-right: 1px solid lightgray;">
                            <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                        </a>
                        <h4 class="mb-1 ps-1">Manage Shipping</h4>
                    </div>
                </div>
            </div>
        </header>
        <div class="container mt-5" style="max-width: 400px;">
            <h3 class="mb-4">Enter Information</h3>
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
            <form method="POST" action="/manageShipping">
                <div class="mb-3">
                    <label for="shipping_cost" class="form-label">Shipping Cost</label>
                    <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    class="mb-2 form-control" 
                    id="shipping_cost" 
                    name="shipping_cost" 
                    placeholder="Enter shipping cost" 
                    required>
                    <label for="password" class="form-label">Token</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Enter token" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Submit</button>
            </form>
        </div>
        <script src="../scripts/auth.js"></script>
        </body>
        </html>
        `);
    };

    const checkTokenAndUpdate = (rows) => {
        if (rows.length > 0) {
            // Valid token: update shipping cost
            fetch(`${req.protocol}://${req.get('host')}/tttransaction/shipping/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': `${req.protocol}://${req.get('host')}`
                },
                body: JSON.stringify({ newCost: parseFloat(shipping_cost) })
            })
                .then(response => {
                    if (response.ok) {
                        return res.send(`
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <title>TechThrift - Manage Shipping</title>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                                <link rel="stylesheet" href="../styles/stylesheet.css">
                            </head>
                            <body>
                            <header class="p-3 border-bottom bg-white">
                                <div class="d-flex justify-content-between container">
                                    <div class="row align-items-center gap-3">
                                        <div class="col-lg-5 col-md-12 col-12 d-flex w-auto align-items-center">
                                            <a id="header-brand" href="/homepage" class="ms-1 pe-3 me-3"
                                                style="border-right: 1px solid lightgray;">
                                                <img alt="TechThrift's logo" src="../media/images/logo_hor.png">
                                            </a>
                                            <h4 class="mb-1 ps-1">Manage Shipping</h4>
                                        </div>
                                    </div>
                                </div>
                            </header>
                            <div class="container mt-5">
                                <div class="alert alert-success">
                                    Shipping cost updated successfully!
                                </div>
                                <a href="/manageShipping" class="btn btn-primary">Go back</a>
                            </div>
                            <script src="../scripts/auth.js"></script>
                            </body>
                            </html>
                        `);
                    } else {
                        return renderErrorForm('Failed to update shipping cost.');
                    }
                })
                .catch(err => {
                    console.error('Error updating shipping cost:', err);
                    return renderErrorForm('An unexpected error occurred.');
                });
        } else {
            return renderErrorForm();
        }
    };

    db.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (err, rows) => {
        if (err) {
            console.warn('Primary DB failed. Trying replica...', err);
            // dbR.query('SELECT id FROM tokens WHERE token = ?', [hashedPassword], (errR, rowsR) => {
            //     if (errR) {
            //         console.error('Replica DB also failed:', errR);
            //         return res.status(500).send('Internal Server Error');
            //     }
            //     checkTokenAndUpdate(rowsR);
            // });
        } else {
            checkTokenAndUpdate(rows);
        }
    });
});
