"use strict";

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as dbConnection, dbReady } from './resources/dbConnection.js';
import { db, dbR } from './resources/dbConnection.js';
import { router as ttApi } from './resources/ttApi.js';
import https from 'https';
import fs from 'fs';
import pkg from 'pdfkit';
import 'pdfkit-table';
const PDFDocument = pkg;
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

// Reports Authentication
app.get('/reports', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head>
                <script>
                    alert("login");
                    setTimeout(() => {
                        window.location.href = "/report";
                    }, 5000); // 5 seconds
                </script>
            </head>
            <body>
                <h1>Redirecting to report in 5 seconds...</h1>
            </body>
        </html>
    `);
});

// Reports
app.get('/report', async (req, res) => {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers to tell the browser it's a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');

    // Pipe the PDF into the response
    doc.pipe(res);

    doc
      .fillColor('#000080')
      .font('Helvetica-Bold')
      .fontSize(30)
      .text('TechThrift', { align: 'center' }

    );

    doc
      .moveDown(0.5)
      .fillColor('black')
      .font('Helvetica')
      .fontSize(20)
      .text('Usage Reports', { align: 'center' }

    );


    const drawSectionHeader = (title) => {
        doc
        .fontSize(18)
        .fillColor('#000080')
        .text(title)
        .moveDown(0.5);
    };

    // Helper to display key metrics
    const drawMetric = (label, value) => {
        doc
        .fontSize(14)
        .fillColor('black')
        .text(`${label}: `, { continued: true })
        .fillColor('#333')
        .text(`${value}`, { continued: false })
        .moveDown(0.5);
    };

    

    db.query('SELECT COUNT(*) AS unsoldItems FROM products p WHERE p.availability = TRUE', [], (err, rows) => {
      
        drawSectionHeader('Inventory Summary');
        drawMetric('Unsold Items', rows[0].unsoldItems);
    });
    


    db.query('SELECT COUNT(*) AS charityCount FROM charityProjects c WHERE c.endDate IS NOT NULL', [], (err, rows) => {
      
        drawSectionHeader('Charity Projects');
        drawMetric('Number of Charity Projects', rows[0].charityCount);

        
    });
   
   

    db.query('SELECT COUNT(*) AS interestCount FROM interests i', [], (err, rows) => {
        
        drawSectionHeader('User Interests');
        drawMetric('Total number of Interests', rows[0].interestCount);

    });


    db.query('SELECT COUNT(*) AS wishlistCount FROM wishlist w', [], (err, rows) => {
      
        drawMetric('Total Wishlisted items', rows[0].wishlistCount);
    });


    db.query('SELECT COUNT(*) AS clientCount FROM clients c WHERE c.dob IS NOT NULL ' +
        'AND c.id NOT IN (SELECT e.id FROM employees e)', [], (err, rows) => {
      
        drawSectionHeader('People Summary');
        drawMetric('Number of registered Clients', rows[0].clientCount);

    });
    
    db.query('SELECT COUNT(*) AS employeeCount FROM employees e', [], (err, rows) => {
      
        drawMetric('Number of Employees', rows[0].employeeCount);

    });

    
    db.query('SELECT st.id, st.name, COUNT(s.transaction_id) AS total_sales FROM clients st ' +
        'LEFT JOIN sales s ON s.store = st.nipc GROUP BY st.nipc, st.name ORDER BY st.name;', [], (err, rows) => {

        drawSectionHeader('Sales by Store');

        rows.forEach(row => {
            drawMetric(row.name, `${row.total_sales} sales`);
        });

        
    });


    db.query('SELECT s.id, s.name, COUNT(r.transaction_id) AS total_repairs FROM clients s ' +
        'LEFT JOIN repairs r ON r.store = s.nipc GROUP BY s.nipc, s.name ORDER BY s.name;', [], async (err, rows) => {

         drawSectionHeader('Repairs by Store');

        rows.forEach(row => {
            drawMetric(row.name, `${row.total_repairs} repairs`);
        });

        // Finalize the PDF and end the stream
        doc.end();
  
    });
});