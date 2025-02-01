const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World');
});

let products = [
    { example0: "example0", id: 0, forSale: true },
    { example1: "example1", id: 1, forSale: false },
    { example2: "example2", id: 2, forSale: true }
];
let repairProducts = [];
let donationProducts = [];
let users = [];
let employees = [];
let stores = [];
let charities = [];
let interests = [];
let reports = [];

// Get all products up for sale
app.get('/tt', (req, res) => {
    const productsForSale = products.filter(p => p.forSale === true);
    res.json(productsForSale);
});

// Get all products in the system
app.get('/tt/all', (req, res) => {
    res.json(products);
});

// Add product
app.post('/tt/add', (req, res) => {
    const newProduct = req.body;
    newProduct.id = products.length + 1;
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Get details about a product
app.get('/tt/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    product ? res.json(product) : res.status(404).send('Product not found');
});

// Remove a product
app.delete('/tt/remove/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        res.status(200).send('Product successfully removed');
    } else {
        res.status(404).send('Product not found');
    }
});

// Set product up for sale
app.post('/tt/sale/add/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        product.forSale = true; // Set up for sale
        res.status(200).json({ message: 'Product set for sale', product });
    } else {
        res.status(404).send('Product not found');
    }
});

// Remove product from sale
app.put('/tt/sale/remove/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        product.forSale = false; // Set up not for sale
        res.status(200).json({ message: 'Product removed from sale', product });
    } else {
        res.status(404).send('Product not found');
    }
});

// Get all products up for repair
app.get('/tt/repair', (req, res) => {
    res.json(repairProducts);
});

// Get details about a product up for repair
app.get('/tt/repair/:id', (req, res) => {
    const product = repairProducts.find(p => p.id == req.params.id);
    product ? res.json(product) : res.status(404).send('Product not found');
});

// Set product up for repair
app.post('/tt/repair/add', (req, res) => {
    const newProduct = req.body;
    newProduct.id = repairProducts.length + 1;
    repairProducts.push(newProduct);
    res.status(201).json(newProduct);
});

// Remove product from repairs
app.put('/tt/repair/remove/:id', (req, res) => {
    const productIndex = repairProducts.findIndex(p => p.id == req.params.id);
    if (productIndex !== -1) {
        const removedProduct = repairProducts.splice(productIndex, 1)[0]; 
        res.status(200).json({ message: 'Product removed from repairs', removedProduct });
    } else {
        res.status(404).send('Product not found');
    }
});

// Get all products up for donation
app.get('/tt/donation', (req, res) => {
    res.json(donationProducts);
});

// Get details about a product up for donation
app.get('/tt/donation/:id', (req, res) => {
    const product = donationProducts.find(p => p.id == req.params.id);
    product ? res.json(product) : res.status(404).send('Product not found');
});

// Set product up for donation
app.post('/tt/donation/add', (req, res) => {
    const newProduct = req.body;
    newProduct.id = donationProducts.length + 1;
    donationProducts.push(newProduct);
    res.status(201).json(newProduct);
});

// Remove product from donation
app.put('/tt/donation/remove/:id', (req, res) => {
    const productIndex = donationProducts.findIndex(p => p.id == req.params.id);
    if (productIndex !== -1) {
        const removedProduct = donationProducts.splice(productIndex, 1)[0]; 
        res.status(200).json({ message: 'Product removed from donation', removedProduct });
    } else {
        res.status(404).send('Product not found');
    }
});

// Add new client
app.post('/ttuser/client/add', (req, res) => {
    const newUser = req.body;
    users.push(newUser);
    res.status(201).send('Client successfully added');
});

// Edit client
app.put('/ttuser/client/edit', (req, res) => {
    const userIndex = users.findIndex(u => u.nif === req.body.nif);
    if (userIndex === -1) return res.status(404).send('Client not found');
    users[userIndex] = req.body;
    res.send('Client successfully updated');
});

// Remove client
app.delete('/ttuser/client/remove', (req, res) => {
    users = users.filter(u => u.nif !== parseInt(req.query.nif));
    res.send('Client successfully removed');
});

// Add new employee
app.post('/ttuser/employee/add', (req, res) => {
    const newEmployee = req.body;
    employees.push(newEmployee);
    res.status(201).send('Employee successfully added');
});

// Edit employee
app.put('/ttuser/employee/edit', (req, res) => {
    const employeeIndex = employees.findIndex(e => e.nif === req.body.nif);
    if (employeeIndex === -1) return res.status(404).send('Employee not found');
    employees[employeeIndex] = req.body;
    res.send('Employee successfully updated');
});

// Remove employee
app.delete('/ttuser/employee/remove', (req, res) => {
    employees = employees.filter(e => e.nif !== parseInt(req.query.nif));
    res.send('Employee successfully removed');
});

// Add new store
app.post('/ttuser/store/add', (req, res) => {
    const newStore = req.body;
    stores.push(newStore);
    res.status(201).send('Store successfully added');
});

// Edit store
app.put('/ttuser/store/edit', (req, res) => {
    const storeIndex = stores.findIndex(s => s.nif === req.body.nif);
    if (storeIndex === -1) return res.status(404).send('Store not found');
    stores[storeIndex] = req.body;
    res.send('Store successfully updated');
});

// Remove store
app.delete('/ttuser/store/remove', (req, res) => {
    stores = stores.filter(s => s.nif !== parseInt(req.query.nipc));
    res.send('Store successfully removed');
});

// Add new charity
app.post('/ttuser/charity/add', (req, res) => {
    const newCharity = req.body;
    charities.push(newCharity);
    res.status(201).send('Charity successfully added');
});

// Edit charity
app.put('/ttuser/charity/edit', (req, res) => {
    const charityIndex = charities.findIndex(c => c.nipc === req.body.nipc);
    if (charityIndex === -1) return res.status(404).send('Charity not found');
    charities[charityIndex] = req.body;
    res.send('Charity successfully updated');
});

// Remove charity
app.delete('/ttuser/charity/remove', (req, res) => {
    charities = charities.filter(c => c.nipc !== parseInt(req.query.nipc));
    res.send('Charity successfully removed');
});

// Set user interest in product
app.post('/ttuser/interest', (req, res) => {
    const newInterest = req.body;
    interests.push(newInterest);
    res.status(201).send('Interest successfully added');
});

// Get user interests in products
app.get('/ttuser/notifications', (req, res) => {
    const userInterests = interests.find(p => p.id == req.params.nif);
    userInterests ? res.json(userInterests) : res.status(404).send('No product interests set');
});

// Get reports
app.get('/ttuser/reports', (req, res) => {
    res.json(reports);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});