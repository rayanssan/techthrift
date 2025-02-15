const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

const DB_PATH = './database.db';
const SQL_INIT_FILE = path.join(__dirname, 'ttDatabase.sql');

// Check if database exists, if not, create it from ttDatabase.sql
if (!fs.existsSync(DB_PATH)) {
    const initSql = fs.readFileSync(SQL_INIT_FILE, 'utf8');
    const tempDb = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error creating database', err);
        } else {
            console.log('Database created successfully');
        }
    });
    tempDb.exec(initSql, (err) => {
        if (err) {
            console.error('Error initializing database', err);
        } else {
            console.log('Database initialized from ttDatabase.sql');

            // Insert initial data
            tempDb.exec(`
                INSERT INTO clients (name, email, phone_number, gender, password, dob, address) VALUES
                ('Janes Store', 'janesmith@example.com', 987654321, 'Female', 'securepass', '1995-05-05', '456 Elm St'),
                ('Michaels Charity', 'michaelj@example.com', 111222333, 'Male', 'mikepass', '1988-12-12', '789 Oak St');

                INSERT INTO clients (name, email, phone_number, gender, password, dob, address, nif, nic) VALUES
                ('John Doe', 'johndoe@example.com', 123456789, 'Male', 'password123', '1990-01-01', '123 Main St', 123456789, 123456789),
                ('Emily Davis', 'emilyd@example.com', 444555666, 'Female', 'emilysecure', '1992-07-07', '321 Pine St', 220349535, 220349535),
                ('Robert Brown', 'robertb@example.com', 777888999, 'Male', 'robertpass', '1985-03-03', '654 Maple St', 987654321, 987654321);
                
                INSERT INTO employees (id) VALUES
                (3);
                
                INSERT INTO stores (id, nipc) VALUES
                (1, 112233445);
                
                INSERT INTO charities (id, nipc) VALUES
                (2, 556677889);
                
                INSERT INTO products (name, store_nipc, condition, availability, description, category) VALUES
                ('Dell Laptop', 112233445, 'New', 1, 'High-end gaming laptop', 'Laptops'),
                ('iPhone 16 Pro', 112233445, 'Used', 1, 'Latest model smartphone', 'Smartphones'),
                ('Apple Watch Series 10', 112233445, 'Used', 1, 'Latest model Apple Watch', 'Smartwatches');
                
                INSERT INTO saleProducts (id, price) VALUES
                (1, 1500),
                (3, 350);
                
                INSERT INTO repairProducts (id, problems) VALUES
                (2, "Broken screen");
                
                INSERT INTO donationProducts (id, charity) VALUES
                (2, 556677889);
                
                INSERT INTO interests (interestedUser, watchedProduct) VALUES
                (3, 1);
                
                INSERT INTO reports (report) VALUES
                ('15/02/2025 - 3 new user; 3 new products; 1 new interest');
            `, (err) => {
                if (err) {
                    console.error('Error inserting initial data', err);
                } else {
                    console.log('Initial data inserted successfully');
                }
            });
        }
    });
    tempDb.close();
}

// Connect to SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database', err);
    }
});

// Default route
app.get('/', (req, res) => {
    db.all('SELECT * FROM saleProducts sp INNER JOIN products p ON p.id = sp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.send(`<h1>Hello World</h1><p>Products for Sale:</p>${JSON.stringify(rows)}`);
    });
});

// Get all products up for sale
app.get('/tt', (req, res) => {
    db.all('SELECT * FROM saleProducts sp INNER JOIN products p ON p.id = sp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get all products in the system
app.get('/tt/product', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product
app.get('/tt/product/:id', (req, res) => {
    db.all('SELECT * FROM products WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(404).send('Product not found');
        }
        res.json(rows);
    });
});

// Add product
app.post('/tt/add', (req, res) => {
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
app.delete('/tt/remove/:id', (req, res) => {
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
app.post('/tt/sale/add', (req, res) => {
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
app.put('/tt/sale/remove/:id', (req, res) => {
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
app.get('/tt/repair', (req, res) => {
    db.all('SELECT * FROM repairProducts rp INNER JOIN products p ON p.id = rp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product up for repair
app.get('/tt/repair/:id', (req, res) => {
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
app.post('/tt/repair/add', (req, res) => {
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
app.put('/tt/repair/remove/:id', (req, res) => {
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
app.get('/tt/donation', (req, res) => {
    db.all('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a product up for donation
app.get('/tt/donation/:id', (req, res) => {
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
app.post('/tt/donation/add', (req, res) => {
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
app.put('/tt/donation/remove/:id', (req, res) => {
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
app.get('/ttuser/client', (req, res) => {
    db.all('SELECT * FROM clients', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a client
app.get('/ttuser/client/:id', (req, res) => {
    db.all('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(404).send('Client not found');
        }
        res.json(rows);
    });
});

// Add new client
app.post('/ttuser/client/add', (req, res) => {
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
app.put('/ttuser/client/edit', (req, res) => {
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
app.delete('/ttuser/client/remove/:id', (req, res) => {
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
app.get('/ttuser/employee', (req, res) => {
    db.all('SELECT * FROM employees e INNER JOIN clients c WHERE c.id = e.id', [], (err, rows) => {
        if (err) {
            return res.status(404).send('Employee not found');
        }
        res.json(rows);
    });
});

// Get details about an employee
app.get('/ttuser/employee/:id', (req, res) => {
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
app.post('/ttuser/employee/add', (req, res) => {
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
app.put('/ttuser/employee/edit', (req, res) => {
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
app.delete('/ttuser/employee/remove/:id', (req, res) => {
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
app.get('/ttuser/store', (req, res) => {
    db.all('SELECT * FROM stores s INNER JOIN clients c WHERE c.id = s.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a store
app.get('/ttuser/store/:id', (req, res) => {
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
app.post('/ttuser/store/add', (req, res) => {
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
app.put('/ttuser/store/edit', (req, res) => {
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
app.delete('/ttuser/store/remove/:id', (req, res) => {
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
app.get('/ttuser/charity', (req, res) => {
    db.all('SELECT * FROM charities ch INNER JOIN clients c WHERE c.id = ch.id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a charity
app.get('/ttuser/charity/:id', (req, res) => {
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
app.post('/ttuser/charity/add', (req, res) => {
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
app.put('/ttuser/charity/edit', (req, res) => {
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
app.delete('/ttuser/charity/remove/:id', (req, res) => {
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
app.post('/ttuser/interest', (req, res) => {
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
app.get('/ttuser/notifications/:id', (req, res) => {

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
app.get('/ttuser/reports', (req, res) => {
    db.all('SELECT * FROM reports', [], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.json(rows);
    });
});

// Get details about a report
app.get('/ttuser/reports/:id', (req, res) => {
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
app.post('/ttuser/reports/add', (req, res) => {
    const { report } = req.body;
    db.run('INSERT INTO reports (report) VALUES (?)', [report], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(201).send('Report successfully added');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});