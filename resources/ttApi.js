"use strict";

const express = require('express');
const router = express.Router();
// Import the db connection from dbConnection.js
const { db } = require('./dbConnection');

// Get all products up for sale
router.get('/tt', (req, res) => {
    db.all('SELECT * FROM saleProducts sp INNER JOIN products p ON p.id = sp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get all products in the system
router.get('/tt/product', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product
router.get('/tt/product/:id', (req, res) => {
    db.all('SELECT * FROM products WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(404).send('Product not found');
        }
        res.json(rows);
    });
});

// Add product
router.post('/tt/add', (req, res) => {
    const newProduct = req.body;
    db.run(`INSERT INTO products 
        (name, store_nipc, condition, availability, description, category) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        newProduct.name, 
        newProduct.store_nipc,
        newProduct.condition,
        newProduct.availability,
        newProduct.description,
        newProduct.category], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        
        newProduct.id = this.lastID;
        res.status(201).json(newProduct); // Send back the newly added product
    });
});

// Remove a product
router.delete('/tt/remove/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Product not found');
        }
        res.status(200).send('Product successfully removed');
    });
});

// Set product up for sale
router.post('/tt/sale/add', (req, res) => {
    const newSaleProduct = req.body;
    // Check if product exists in the products table
    db.get('SELECT * FROM products WHERE id = ?', [newSaleProduct.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found');
        }
        // Insert the product into the saleProducts table
        db.run('INSERT INTO saleProducts (id, price) VALUES (?, ?)', 
            [newSaleProduct.id, newSaleProduct.price], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Product set for sale', product: row });
        });
    });
});

// Remove product from sale
router.put('/tt/sale/remove/:id', (req, res) => {
    // Check if the product exists in the saleProducts table
    db.get('SELECT * FROM saleProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on sale');
        }
        // Remove the product from the saleProducts table
        db.run('DELETE FROM saleProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(200).json({ message: 'Product removed from sale', productId });
        });
    });
});

// Get all products up for repair
router.get('/tt/repair', (req, res) => {
    db.all('SELECT * FROM repairProducts rp INNER JOIN products p ON p.id = rp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product up for repair
router.get('/tt/repair/:id', (req, res) => {
    db.all('SELECT * FROM repairProducts rp INNER JOIN products p ON p.id = rp.id WHERE rp.id = ?', 
        [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.json(rows);
    });
});

// Set product up for repair
router.post('/tt/repair/add', (req, res) => {
    const newRepairProduct = req.body;
    // Check if product exists in the products table
    db.get('SELECT * FROM products WHERE id = ?', [newRepairProduct.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found');
        }
        // Insert the product into the repairProducts table
        db.run('INSERT INTO repairProducts (id) VALUES (?)', [newRepairProduct.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Product set for repair', product: row });
        });
    });
});

// Remove product from repairs
router.put('/tt/repair/remove/:id', (req, res) => {
    // Check if the product exists in the repairProducts table
    db.get('SELECT * FROM repairProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on repair');
        }
        // Remove the product from the repairProducts table
        db.run('DELETE FROM repairProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(200).json({ message: 'Product removed from repair', productId });
        });
    });
});

// Get all products up for donation
router.get('/tt/donation', (req, res) => {
    db.all('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product up for donation
router.get('/tt/donation/:id', (req, res) => {
    db.all('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id WHERE dp.id = ?', 
        [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.json(rows);
    });
});

// Set product up for donation
router.post('/tt/donation/add', (req, res) => {
    const newDonationProduct = req.body;
    // Check if product exists in the products table
    db.get('SELECT * FROM products WHERE id = ?', [newDonationProduct.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found');
        }
        // Insert the product into the donationProducts table
        db.run('INSERT INTO donationProducts (id, charity) VALUES (?)', 
            [newDonationProduct.id, newDonationProduct.charity], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Product set for donation', product: row });
        });
    });
});

// Remove product from donation
router.put('/tt/donation/remove/:id', (req, res) => {
    // Check if the product exists in the donationProducts table
    db.get('SELECT * FROM donationProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on donation');
        }
        // Remove the product from the donationProducts table
        db.run('DELETE FROM donationProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(200).json({ message: 'Product removed from donation', productId });
        });
    });
});

// Get all clients
router.get('/ttuser/client', (req, res) => {
    db.all('SELECT * FROM clients', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a client
router.get('/ttuser/client/:id', (req, res) => {
    db.all('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(404).send('Client not found');
        }
        res.json(rows);
    });
});

// Add new client
router.post('/ttuser/client/add', (req, res) => {
    const newClient = req.body;

    /* Since some attributes are optional, extract keys and values from the newClient object, 
    filtering out any undefined values */
    const columns = Object.keys(newClient).filter(key => newClient[key] !== undefined);
    const values = columns.map(col => newClient[col]);

    const query = `INSERT INTO clients (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send('Client successfully added');
    });
});

// Edit client
router.put('/ttuser/client/edit', (req, res) => {
    const updatedClient = req.body;

    /* Since some attributes are optional, extract keys and values from the newClient object, 
    filtering out any undefined values, and do not allow changing the id */
    const columns = Object.keys(updatedClient).filter(key => updatedClient[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedClient[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedClient.id);

    const query = `UPDATE clients SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE nif = ?`;

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).send('Client not found');
        }

        res.send('Client successfully updated');
    });
});

// Remove client
router.delete('/ttuser/client/remove/:id', (req, res) => {
    db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).send('Client not found');
        }

        res.send('Client successfully removed');
    });
});

// Get all employees
router.get('/ttuser/employee', (req, res) => {
    db.all('SELECT * FROM employees e INNER JOIN clients c WHERE c.id = e.id', [], (err, rows) => {
        if (err) {
            return res.status(404).send('Employee not found');
        }
        res.json(rows);
    });
});

// Get details about an employee
router.get('/ttuser/employee/:id', (req, res) => {
    db.all('SELECT * FROM employees e INNER JOIN clients c ON c.id = e.id WHERE e.id = ?;', 
        [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!rows) {
            return res.status(404).send('Employee not found');
        }
        res.json(rows);
    });
});

// Add new employee
router.post('/ttuser/employee/add', (req, res) => {
    const newEmployee = req.body;
    // Check if new employee exists in the clients table
    db.get('SELECT * FROM clients WHERE id = ?', [newEmployee.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Client not found');
        }
        // Insert the user into the employees table
        db.run('INSERT INTO employees (id) VALUES (?)', 
            [newEmployee.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Employee successfully added', product: row });
        });
    });
});

// Edit employee
router.put('/ttuser/employee/edit', (req, res) => {
    const updatedEmployee = req.body;

    // Extract keys and values from the updatedEmployee object, filtering out undefined values
    const columns = Object.keys(updatedEmployee).filter(key => updatedEmployee[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedEmployee[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedEmployee.id);

    const query = `UPDATE employees SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send('Employee successfully updated');
    });
});

// Remove employee
router.delete('/ttuser/employee/remove/:id', (req, res) => {
    db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send('Employee successfully removed');
    });
});

// Get all stores
router.get('/ttuser/store', (req, res) => {
    db.all('SELECT * FROM stores s INNER JOIN clients c WHERE c.id = s.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a store
router.get('/ttuser/store/:id', (req, res) => {
    db.all('SELECT * FROM stores s INNER JOIN clients c ON c.id = s.id WHERE s.id = ?', 
        [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!rows) {
            return res.status(404).send('Store not found');
        }
        res.json(rows);
    });
});

// Add new store
router.post('/ttuser/store/add', (req, res) => {
    const newStore = req.body;
    // Check if new store exists in the clients table
    db.get('SELECT * FROM clients WHERE id = ?', [newStore.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Client not found');
        }
        // Insert the store into the stores table
        db.run('INSERT INTO stores (id, nipc) VALUES (?, ?)', 
            [newStore.id, newStore.nipc], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Store successfully added', product: row });
        });
    });
});

// Edit store
router.put('/ttuser/store/edit', (req, res) => {
    const updatedStore = req.body;

    // Extract keys and values from the updatedStore object, filtering out undefined values
    const columns = Object.keys(updatedStore).filter(key => updatedStore[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedStore[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedStore.id);

    const query = `UPDATE stores SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Store not found');
        }
        res.send('Store successfully updated');
    });
});

// Remove store
router.delete('/ttuser/store/remove/:id', (req, res) => {
    db.run('DELETE FROM stores WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Store not found');
        }
        res.send('Store successfully removed');
    });
});

// Get all charities
router.get('/ttuser/charity', (req, res) => {
    db.all('SELECT * FROM charities ch INNER JOIN clients c WHERE c.id = ch.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a charity
router.get('/ttuser/charity/:id', (req, res) => {
    db.all('SELECT * FROM charities ch INNER JOIN clients c ON c.id = ch.id WHERE ch.id = ?', 
        [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!rows) {
            return res.status(404).send('Charity not found');
        }
        res.json(rows);
    });
});

// Add new charity
router.post('/ttuser/charity/add', (req, res) => {
    const newCharity = req.body;
    // Check if new charity exists in the clients table
    db.get('SELECT * FROM clients WHERE id = ?', [newCharity.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Client not found');
        }
        // Insert the charity into the charities table
        db.run('INSERT INTO charities (id, nipc) VALUES (?, ?)', 
            [newCharity.id, newCharity.nipc], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            res.status(201).json({ message: 'Charity successfully added', product: row });
        });
    });
});

// Edit charity
router.put('/ttuser/charity/edit', (req, res) => {
    const updatedCharity = req.body;

    // Extract keys and values from the updatedCharity object, filtering out undefined values
    const columns = Object.keys(updatedCharity).filter(key => updatedCharity[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedCharity[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedCharity.id);

    const query = `UPDATE charities SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Charity not found');
        }
        res.send('Charity successfully updated');
    });
});

// Remove charity
router.delete('/ttuser/charity/remove/:id', (req, res) => {
    db.run('DELETE FROM charities WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Charity not found');
        }
        res.send('Charity successfully removed');
    });
});

// Set user interest in product
router.post('/ttuser/interest', (req, res) => {
    const { interestedUser, watchedProduct } = req.body;

    db.run('INSERT INTO interests (interestedUser, watchedProduct) VALUES (?, ?)', 
        [interestedUser, watchedProduct], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send('Interest successfully added');
    });
});

// Get user interests in products
router.get('/ttuser/notifications/:id', (req, res) => {

    const query = `
        SELECT p.* 
        FROM interests i
        JOIN products p ON i.watchedProduct = p.id
        WHERE i.interestedUser = ?`;

    db.all(query, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).send('No product interests set for this client');
        }
        res.json(rows);
    });
});

// Get reports
router.get('/ttuser/reports', (req, res) => {
    db.all('SELECT * FROM reports', [], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a report
router.get('/ttuser/reports/:id', (req, res) => {
    db.all('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!rows) {
            return res.status(404).send('Report not found');
        }
        res.json(rows);
    });
});

// Add reports
router.post('/ttuser/reports/add', (req, res) => {
    const { report } = req.body;
    db.run('INSERT INTO reports (report) VALUES (?)', [report], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send('Report successfully added');
    });
});

// Export the API routes
module.exports = router;