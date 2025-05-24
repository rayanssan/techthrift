"use strict";

import { Router } from 'express';
const router = Router();
// Import the db connection from dbConnection.js
import { db, dbR } from './dbConnection.js';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { exposeApi } from '../techthrift.js';

/**
 * Middleware to verify the origin or referer of incoming requests.
 * Blocks requests without a valid `Origin` or `Referer` header by redirecting to a 404 page.
 *
 * This helps protect API routes from unauthorized access via direct requests (e.g., curl or browser URL bar).
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The callback to pass control to the next middleware.
 */
function verifyRequestOrigin(req, res, next) {
    if (exposeApi) {
        return next();
    }

    const origin = req.get('origin') || req.get('referer');
    // Check the request's origin
    if (!origin) {
        return res.status(403).sendFile(path.join(__dirname, '../html/404.html'), (err) => {
            if (err) {
                console.error('Error serving 404.html:', err);
                res.status(500).send('Internal Server Error');
            }
        });
    }
    next();
}

// Get all products up for sale
router.get('/tt', verifyRequestOrigin, (req, res) => {
    const { name, condition, category, brand, color, processor,
        storage, screen, os, year, maxPrice, store } = req.query;

    let query = `SELECT p.*, sp.*, pi.image_path AS image, c.name AS store
        FROM saleProducts sp
        INNER JOIN products p ON p.id = sp.id
        INNER JOIN entities e ON p.store_nipc = e.nipc
        INNER JOIN clients c ON e.id = c.id 
        LEFT JOIN productImages pi ON p.id = pi.product AND pi.image_order = 1 
        WHERE p.availability = 1 `;

    let params = [];

    if (name) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${name}%`);
    }
    if (condition) {
        query += ` AND p.product_condition = ?`;
        params.push(condition);
    }
    if (category) {
        query += ` AND p.category LIKE ?`;
        params.push(`%${category}%`);
    }
    if (brand) {
        query += ` AND p.brand LIKE ?`;
        params.push(`%${brand}%`);
    }
    if (color) {
        query += ` AND p.color LIKE ?`;
        params.push(`%${color}%`);
    }
    if (processor) {
        query += ` AND p.processor LIKE ?`;
        params.push(`%${processor}%`);
    }
    if (storage) {
        query += ` AND p.storage LIKE ?`;
        params.push(`%${storage}%`);
    }
    if (screen) {
        query += ` AND p.screen LIKE ?`;
        params.push(`%${screen}%`);
    }
    if (os) {
        query += ` AND p.os LIKE ?`;
        params.push(`%${os}%`);
    }
    if (year) {
        query += ` AND p.year = ?`;
        params.push(year);
    }
    if (maxPrice) {
        query += ` AND sp.price <= ?`;
        params.push(maxPrice);
    }
    if (store) {
        query += ' AND c.name LIKE ?';
        params.push(`%${store}%`);
    }

    db.query(query, params, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, params, (replicaErr, replicaRows) => {
                if (replicaErr) {
                    return res.status(500).json({ error: replicaErr.message });
                }
                res.json(replicaRows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get all products in the system
router.get('/tt/product', verifyRequestOrigin, (req, res) => {
    const { name, condition, category, brand, color, processor,
        storage, os, year, availability, store } = req.query;

    let query = `SELECT p.*, c.name AS store 
        FROM products p 
        INNER JOIN entities e ON p.store_nipc = e.nipc
        INNER JOIN clients c ON e.id = c.id WHERE 1=1`;
    let params = [];

    // Apply filters dynamically
    if (name) {
        query += ' AND p.name LIKE ?';
        params.push(`%${name}%`);
    }
    if (condition) {
        query += ' AND p.product_condition = ?';
        params.push(condition);
    }
    if (category) {
        query += ' AND p.category LIKE ?';
        params.push(`%${category}%`);
    }
    if (brand) {
        query += ' AND p.brand LIKE ?';
        params.push(`%${brand}%`);
    }
    if (color) {
        query += ' AND p.color LIKE ?';
        params.push(`%${color}%`);
    }
    if (processor) {
        query += ' AND p.processor LIKE ?';
        params.push(`%${processor}%`);
    }
    if (storage) {
        query += ' AND p.storage LIKE ?';
        params.push(`%${storage}%`);
    }
    if (os) {
        query += ' AND p.os LIKE ?';
        params.push(`%${os}%`);
    }
    if (year) {
        query += ' AND p.year = ?';
        params.push(year);
    }
    if (availability) {
        query += ' AND p.availability = ?';
        params.push((availability === 'true' || availability === "1") ? 1 : 0);
    }
    if (store) {
        query += ' AND c.name LIKE ?';
        params.push(`%${store}%`);
    }

    db.query(query, params, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, params, (replicaErr, replicaRows) => {
                if (replicaErr) {
                    return res.status(500).json({ error: replicaErr.message });
                }
                res.json(replicaRows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get details about a product
router.get('/tt/product/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;

    // Check if the product is in the saleProducts table
    let isSaleProduct = false;

    // Query to check if the product is in the saleProducts table
    let checkSaleQuery = 'SELECT 1 FROM saleProducts WHERE id = ? LIMIT 1';

    db.query(checkSaleQuery, [id], (err, result) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(checkSaleQuery, [id], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // If the product is found in the saleProducts table, set isSaleProduct to true
                isSaleProduct = result.length > 0;

                // Based on whether it's a sale product, modify the main query
                let query = `SELECT * FROM products, productImages LEFT JOIN productImages ON 
                    products.id = productImages.product WHERE id = ?`;
                let params = [id];

                if (isSaleProduct) {
                    query = `
                    SELECT products.*, saleProducts.*, productImages.*, clients.name AS store
                    FROM products
                    JOIN saleProducts ON products.id = saleProducts.id
                    LEFT JOIN productImages ON products.id = productImages.product
                    JOIN entities ON products.store_nipc = entities.nipc
                    JOIN clients ON entities.id = clients.id
                    WHERE products.id = ?;
                    `;
                }

                // Execute the final query
                dbR.query(query, params, (err, rows) => {
                    if (err || rows.length === 0) {
                        return res.status(404).send('Product not found');
                    }
                    // Create images object with keys as image_order and values as image_path
                    const product = rows[0];
                    const images = {};

                    rows.forEach(row => {
                        // Assign the image path to the key being the image_order
                        images[row.image_order] = row.image_path;
                    });

                    // Build the response object
                    const response = {
                        ...product, // product info
                        images: images // image info
                    };

                    res.json(response);
                });
            });
        } else {
            // If the product is found in the saleProducts table, set isSaleProduct to true
            isSaleProduct = result.length > 0;

            // Based on whether it's a sale product, modify the main query
            let query = `SELECT * FROM products LEFT JOIN productImages ON 
                    products.id = productImages.product WHERE products.id = ?`;
            let params = [id];

            if (isSaleProduct) {
                query = `
                SELECT products.*, saleProducts.*, productImages.*, clients.name AS store
                FROM products
                JOIN saleProducts ON products.id = saleProducts.id
                LEFT JOIN productImages ON products.id = productImages.product
                JOIN entities ON products.store_nipc = entities.nipc
                JOIN clients ON entities.id = clients.id
                WHERE products.id = ?;
                `;
            }

            // Execute the final query
            db.query(query, params, (err, rows) => {
                if (err || rows.length === 0) {
                    return res.status(404).send('Product not found');
                }
                // Create images object with keys as image_order and values as image_path
                const product = rows[0];
                const images = {};

                rows.forEach(row => {
                    // Assign the image path to the key being the image_order
                    images[row.image_order] = row.image_path;
                });

                // Build the response object
                const { image_path, product: productId, image_order, ...filteredProduct } = product;

                const response = {
                    ...filteredProduct,
                    images: images
                };

                res.json(response);
            });
        }
    });
});

// Add product
router.post('/tt/add', verifyRequestOrigin, (req, res) => {
    const newProduct = req.body;

    // Temporary default for store_nipc
    if (!newProduct.store_nipc) {
        newProduct.store_nipc = '112233445';
    }

    // Construct the fields
    const columns = [
        'name',
        'store_nipc',
        'product_condition',
        'availability',
        'description',
        'category',
        'brand',
        'model_code',
        'color',
        'weight',
        'dimensions',
        'processor',
        'screen',
        'ram_memory',
        'graphics_card',
        'storage',
        'keyboard',
        'os',
        'year'
    ];

    const values = columns.map(col => newProduct[col] !== undefined ? newProduct[col] : null);

    // Generate the query dynamically based on the columns and values
    const query = `
        INSERT INTO products 
        (${columns.join(', ')}) 
        VALUES (${columns.map(() => '?').join(', ')})
    `;

    db.execute(query, values, function (err, result) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        const insertedProduct = {
            id: result.insertId,
            ...newProduct
        };

        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
        });

        res.status(201).json(insertedProduct); // Send back the newly added product
    });
});

// Upload Images
router.post('/tt/upload', (req, res) => {
    const { product_id, images, orders } = req.body;

    if (!product_id || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'Missing product_id or images.' });
    }

    const insertValues = images.map((filename, i) => [
        product_id,
        filename,
        parseInt(orders[i]) || (i + 1)
    ]);

    const query = `
        INSERT INTO productImages (product, image_path, image_order)
        VALUES ${insertValues.map(() => '(?, ?, ?)').join(', ')}
    `;

    const flatValues = insertValues.flat();

    db.execute(query, flatValues, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        dbR.execute(query, flatValues, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
        });

        res.status(200).json({ message: 'Image metadata inserted successfully.' });
    });
});

// Remove Product
router.delete('/tt/remove/:id', (req, res) => {
    const productId = req.params.id;

    // First, delete images associated with the product
    db.execute('DELETE FROM productImages WHERE product = ?', [productId], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Failed to delete related images: ' + err.message });
        }

        // Then, delete the product itself
        db.execute('DELETE FROM products WHERE id = ?', [productId], function (err) {
            if (err) {
                return res.status(500).send({ error: 'Failed to delete product: ' + err.message });
            }

            // Also delete from replica
            dbR.execute('DELETE FROM productImages WHERE product = ?', [productId], () => { });
            dbR.execute('DELETE FROM products WHERE id = ?', [productId], () => { });

            res.status(200).send('Product and related images successfully removed');
        });
    });
});


// Set product up for sale
router.post('/tt/sale/add', verifyRequestOrigin, (req, res) => {
    const newSaleProduct = req.body;

    // Check if product exists in the products table
    db.query('SELECT * FROM products WHERE id = ?', [newSaleProduct.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found');
        }
        // Insert the product into the saleProducts table
        db.execute('INSERT INTO saleProducts (id, price) VALUES (?, ?)',
            [newSaleProduct.id, newSaleProduct.price], function (err) {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                // Update replica
                dbR.query('SELECT * FROM products WHERE id = ?', [newSaleProduct.id], (err, row) => {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                    if (!row) {
                        return res.status(404).send('Product not found');
                    }
                    // Insert the product into the saleProducts table
                    dbR.execute('INSERT INTO saleProducts (id, price) VALUES (?, ?)',
                        [newSaleProduct.id, newSaleProduct.price], function (err) {
                            if (err) {
                                return res.status(500).send({ error: err.message });
                            }
                        });
                });
                res.status(201).json({ message: 'Product set for sale', product: row });
            });
    });
});

// Remove product from sale
router.put('/tt/sale/remove/:id', verifyRequestOrigin, (req, res) => {
    // Check if the product exists in the saleProducts table
    db.query('SELECT * FROM saleProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on sale');
        }
        // Remove the product from the saleProducts table
        db.execute('DELETE FROM saleProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            // Update replica
            dbR.query('SELECT * FROM saleProducts WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                if (!row) {
                    return res.status(404).send('Product not found on sale');
                }
                // Remove the product from the saleProducts table
                dbR.execute('DELETE FROM saleProducts WHERE id = ?', [req.params.id], function (err) {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                });
            });
            res.status(200).json({ message: 'Product removed from sale', productId });
        });
    });
});

// Get all products up for repair
router.get('/tt/repair', verifyRequestOrigin,
    (req, res) => {
        const { name, category, condition, brand, color,
            processor, storage, os, year, store } = req.query;

        let query = `
        SELECT p.*, rp.*, c.name AS store 
        FROM repairProducts rp 
        INNER JOIN products p ON p.id = rp.id
        INNER JOIN entities e ON p.store_nipc = e.nipc
        INNER JOIN clients c ON e.id = c.id
        WHERE 1=1
    `;
        const params = [];

        if (name) {
            query += ' AND p.name LIKE ?';
            params.push(`%${name}%`);
        }
        if (category) {
            query += ' AND p.category LIKE ?';
            params.push(`%${category}%`);
        }
        if (condition) {
            query += ' AND p.product_condition = ?';
            params.push(condition);
        }
        if (brand) {
            query += ' AND p.brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (color) {
            query += ' AND p.color LIKE ?';
            params.push(`%${color}%`);
        }
        if (processor) {
            query += ' AND p.processor LIKE ?';
            params.push(`%${processor}%`);
        }
        if (storage) {
            query += ' AND p.storage LIKE ?';
            params.push(`%${storage}%`);
        }
        if (os) {
            query += ' AND p.os LIKE ?';
            params.push(`%${os}%`);
        }
        if (year) {
            query += ' AND p.year = ?';
            params.push(year);
        }
        if (store) {
            query += ' AND c.name LIKE ?';
            params.push(`%${store}%`);
        }

        // Execute the query
        db.query(query, params, (err, rows) => {
            if (err) {
                // Fallback to replica DB
                dbR.query(query, params, (err, rows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(rows);
                });
            } else {
                res.json(rows);
            }
        });
    });

// Get details about a product up for repair
router.get('/tt/repair/:id', verifyRequestOrigin,
    (req, res) => {
        db.query('SELECT * FROM repairProducts rp INNER JOIN products p ON p.id = rp.id WHERE rp.id = ?',
            [req.params.id], (err, rows) => {
                if (err) {
                    // Fallback to replica DB
                    dbR.query('SELECT * FROM repairProducts rp INNER JOIN products p ON p.id = rp.id WHERE rp.id = ?',
                        [req.params.id], (err, rows) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            if (rows.length === 0) {
                                return res.status(404).send('Product not found');
                            }
                            res.json(rows[0]);
                        });
                } else if (rows.length === 0) {
                    return res.status(404).send('Product not found');
                } else {
                    res.json(rows[0]);
                }
            });
    });

// Set product up for repair
router.post('/tt/repair/add', verifyRequestOrigin, (req, res) => {
    const newRepairProduct = req.body;
    // Check if product exists in the products table
    db.query('SELECT * FROM products WHERE id = ?', [newRepairProduct.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found');
        }
        // Insert the product into the repairProducts table
        db.execute('INSERT INTO repairProducts (id) VALUES (?)', [newRepairProduct.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            // Update replica
            dbR.query('SELECT * FROM products WHERE id = ?', [newRepairProduct.id], (err, row) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                if (!row) {
                    return res.status(404).send('Product not found');
                }
                // Insert the product into the repairProducts table
                dbR.execute('INSERT INTO repairProducts (id) VALUES (?)', [newRepairProduct.id], function (err) {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                });
            });
            res.status(201).json({ message: 'Product set for repair', product: row });
        });
    });
});

// Remove product from repairs
router.put('/tt/repair/remove/:id', verifyRequestOrigin, (req, res) => {
    // Check if the product exists in the repairProducts table
    db.query('SELECT * FROM repairProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on repair');
        }
        // Remove the product from the repairProducts table
        db.execute('DELETE FROM repairProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            // Update replica
            dbR.query('SELECT * FROM repairProducts WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                if (!row) {
                    return res.status(404).send('Product not found on repair');
                }
                // Remove the product from the repairProducts table
                dbR.execute('DELETE FROM repairProducts WHERE id = ?', [req.params.id], function (err) {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                });
            });
            res.status(200).json({ message: 'Product removed from repair', productId });
        });
    });
});

// Get all products up for donation
router.get('/tt/donation', verifyRequestOrigin,
    (req, res) => {
        const { name, category, condition, brand, color, processor,
            storage, os, year, store, charity } = req.query;

        // Base query
        let query = `
        SELECT p.*, dp.*, c1.name AS store, c2.name AS charity
        FROM donationProducts dp 
        INNER JOIN products p ON p.id = dp.id
        INNER JOIN entities e1 ON p.store_nipc = e1.nipc
        INNER JOIN entities e2 ON dp.charity_nipc = e2.nipc
        INNER JOIN clients c1 ON e1.id = c1.id 
        INNER JOIN clients c2 ON e2.id = c2.id
        WHERE 1=1
    `;

        // Prepare parameters for dynamic query
        const params = [];

        // Add conditions based on the provided query parameters
        if (name) {
            query += ' AND p.name LIKE ?';
            params.push(`%${name}%`);
        }
        if (category) {
            query += ' AND p.category LIKE ?';
            params.push(`%${category}%`);
        }
        if (condition) {
            query += ' AND p.product_condition = ?';
            params.push(condition);
        }
        if (brand) {
            query += ' AND p.brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (color) {
            query += ' AND p.color LIKE ?';
            params.push(`%${color}%`);
        }
        if (processor) {
            query += ' AND p.processor LIKE ?';
            params.push(`%${processor}%`);
        }
        if (storage) {
            query += ' AND p.storage LIKE ?';
            params.push(`%${storage}%`);
        }
        if (os) {
            query += ' AND p.os LIKE ?';
            params.push(`%${os}%`);
        }
        if (year) {
            query += ' AND p.year = ?';
            params.push(year);
        }
        if (store) {
            query += ' AND c1.name LIKE ?';
            params.push(`%${store}%`);
        }
        if (charity) {
            query += ' AND c2.name LIKE ?';
            params.push(`%${charity}%`);
        }

        // Execute the query
        db.query(query, params, (err, rows) => {
            if (err) {
                // Fallback to replica DB
                dbR.query(query, params, (err, rows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(rows);
                });
            } else {
                res.json(rows);
            }
        });
    });

// Get details about a product up for donation
router.get('/tt/donation/:id', verifyRequestOrigin,
    (req, res) => {
        db.query('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id WHERE dp.id = ?',
            [req.params.id], (err, rows) => {
                if (err) {
                    // Fallback to replica DB
                    dbR.query('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id WHERE dp.id = ?',
                        [req.params.id], (err, rows) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            if (rows.length === 0) {
                                return res.status(404).send('Product not found');
                            }
                            res.json(rows[0]);
                        });
                }
                else if (rows.length === 0) {
                    return res.status(404).send('Product not found');
                } else {
                    res.json(rows[0]);
                }
            });
    });

// Set product up for donation
router.post('/tt/donation/add', (req, res) => {
    const { id, donor, charity } = req.body;

    if (!id || !donor || !charity) {
        return res.status(400).send({ error: 'Missing id, donor or charity' });
    }

    // Check if product exists
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
        if (rows.length === 0) return res.status(404).send('Product not found');

        // Insert into donationProducts
        const insertQuery = `
            INSERT INTO donationProducts (id, charity_nipc, donor_nif)
            VALUES (?, ?, ?)
        `;
        const insertValues = [id, charity, donor];

        db.execute(insertQuery, insertValues, function (err) {
            if (err) return res.status(500).send({ error: err.message });

            // Update replica DB
            dbR.query('SELECT * FROM products WHERE id = ?', [id], (err, rows) => {
                if (err) return res.status(500).send({ error: err.message });

                dbR.execute(insertQuery, insertValues, function (err) {
                    if (err) return res.status(500).send({ error: err.message });
                });

                res.status(201).json({ message: 'Product set for donation' });
            });
        });
    });
});


// Remove product from donation
router.put('/tt/donation/remove/:id', verifyRequestOrigin, (req, res) => {
    // Check if the product exists in the donationProducts table
    db.query('SELECT * FROM donationProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row) {
            return res.status(404).send('Product not found on donation');
        }
        // Remove the product from the donationProducts table
        db.execute('DELETE FROM donationProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }

            // Update replica
            dbR.query('SELECT * FROM donationProducts WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                if (!row) {
                    return res.status(404).send('Product not found on donation');
                }
                // Remove the product from the donationProducts table
                dbR.execute('DELETE FROM donationProducts WHERE id = ?', [req.params.id], function (err) {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                });
            });

            res.status(200).json({ message: 'Product removed from donation', product: row });
        });
    });
});


// Get all categories
router.get('/tt/categories', verifyRequestOrigin,
    (req, res) => {
        db.query('SELECT * FROM categories', [], (err, rows) => {
            if (err) {
                // Fallback to replica DB
                dbR.query('SELECT * FROM categories', [], (err, rows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(rows);
                });
            } else {
                res.json(rows);
            }
        });
    });

// Get all clients in the system
router.get('/ttuser', verifyRequestOrigin, (req, res) => {
    const { user_type } = req.query;

    let whereClause = '';
    const params = [];

    if (user_type === 'store') {
        whereClause = 'WHERE e.entity_type = "store"';
    } else if (user_type === 'charity') {
        whereClause = 'WHERE e.entity_type = "charity"';
    } else if (user_type === 'employee') {
        whereClause = 'WHERE em.id IS NOT NULL';
    } else if (user_type === 'client') {
        whereClause = `
        WHERE e.entity_type IS NULL 
        AND em.id IS NULL
        `;
    }

    const query = `
    SELECT 
      c.*,
      CASE 
        WHEN e.entity_type = 'store' THEN 'store'
        WHEN e.entity_type = 'charity' THEN 'charity'
        WHEN em.id IS NOT NULL THEN 'employee'
        ELSE 'client'
      END AS user_type
    FROM clients c
    LEFT JOIN entities e ON e.id = c.id
    LEFT JOIN employees em ON em.id = c.id
    ${whereClause}
  `;

    db.query(query, params, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, params, (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(rows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get details about a client
router.get('/ttuser/client/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;

    // Check all possibilities (id, nif, nic, email, phone_number)
    const query = `
    SELECT 
      c.*,
      CASE 
        WHEN e.entity_type = 'store' THEN 'store'
        WHEN e.entity_type = 'charity' THEN 'charity'
        WHEN em.id IS NOT NULL THEN 'employee'
        ELSE 'client'
      END AS user_type
    FROM clients c
    LEFT JOIN entities e ON e.id = c.id
    LEFT JOIN employees em ON em.id = c.id
    WHERE (c.id = ? OR c.nif = ? OR c.nic = ? OR c.email = ? OR c.phone_number = ?)
    LIMIT 1`;

    // Use the `id` parameter for all possible search options
    db.query(query, [id, id, id, id, id], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [id, id, id, id, id], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (rows.length === 0) {
                    return res.status(204).send();
                }

                // Send the client details in the response
                res.json(rows[0]);
            });
        } else if (rows.length === 0) {
            return res.status(204).send();
        } else {
            // Send the client details in the response
            res.json(rows[0]);
        }
    });
});

// Add new client
router.post('/ttuser/add/client', verifyRequestOrigin, (req, res) => {
    const newClient = req.body;

    /* Since some attributes are optional, extract keys and values from the newClient object, 
    filtering out any undefined values */
    const columns = Object.keys(newClient).filter(key => newClient[key] !== undefined);
    const values = columns.map(col => newClient[col]);

    const query = `INSERT INTO clients (${columns.join(', ')
        }) VALUES (${columns.map(() => '?').join(', ')}) 
        ON DUPLICATE KEY UPDATE ${columns.map(col => `${col} = VALUES(${col})`).join(', ')}`;

    db.execute(query, values, function (err, result) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        // If no rows were inserted, the user already exists
        if (result.affectedRows === 0) {
            return res.status(200).send('User already exists');
        }

        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
        });

        res.status(201).json({
            message: 'Client successfully added or updated',
            id: result.insertId,
            clientData: newClient
        });
    });
});

// Edit client
router.put('/ttuser/edit/client', verifyRequestOrigin, (req, res) => {
    const updatedClient = req.body;
    const id = updatedClient.id;

    // Determine whether id is numeric or string
    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    // Since some attributes are optional, extract keys and values from the newClient object,
    // filtering out any undefined values, and do not allow changing the id
    const columns = Object.keys(updatedClient).filter(key =>
        updatedClient[key] !== undefined && key !== 'id'
    );
    const values = columns.map(col => updatedClient[col]);

    values.push(isNumeric(id) ? parseInt(id) : null,
        isNumeric(id) ? parseInt(id) : null,
        isNumeric(id) ? parseInt(id) : null,
        id,
        id);

    const query = `UPDATE clients SET ${columns.map(col => `${col} = ?`).join(', ')} 
    WHERE id = ? OR nif = ? OR nic = ? OR email = ? OR phone_number = ?`;

    db.execute(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).send('Client not found');
        }

        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).send('Client not found');
            }
        });

        res.send('Client successfully updated');
    });
});

// Remove client
router.delete('/ttuser/remove/client/:id', verifyRequestOrigin, (req, res) => {
    db.execute('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).send('Client not found');
        }

        // Update replica
        dbR.execute('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).send('Client not found');
            }
        });

        res.send('Client successfully removed');
    });
});

// Get all employees
router.get('/ttuser/employee', verifyRequestOrigin, (req, res) => {
    db.query('SELECT * FROM employees e INNER JOIN clients c WHERE c.id = e.id', [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query('SELECT * FROM employees e INNER JOIN clients c WHERE c.id = e.id', [], (err, rows) => {
                if (err) {
                    return res.status(404).send('No registered employees');
                }
                res.json(rows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get details about an employee
router.get('/ttuser/employee/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;

    // Check all possibilities (id, nif, nic, email, phone_number)
    let query = `
        SELECT * 
        FROM employees e
        INNER JOIN clients c ON c.id = e.id
        WHERE e.id = ? OR c.nif = ? OR c.nic = ? OR c.email = ? OR c.phone_number = ?
    `;

    // Use the `id` parameter for all possible search options
    db.query(query, [id, id, id, id, id], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [id, id, id, id, id], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (rows.length === 0) {
                    return res.status(204).send();
                }

                // Send the employee details in the response
                res.json(rows[0]);
            });
        } else if (rows.length === 0) {
            return res.status(204).send();
        } else {
            // Send the employee details in the response
            res.json(rows[0]);
        }
    });
});

//Add new employee
router.post('/ttuser/add/employee', verifyRequestOrigin, (req, res) => {
    const newEmployee = req.body;

    if (!newEmployee.id || !newEmployee.store || !newEmployee.internal_number) {
        return res.status(400).send({ error: "Missing required fields: id, store, internal_number" });
    }

    // Check if clients exists
    db.query('SELECT * FROM clients WHERE id = ?', [newEmployee.id], (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
        if (rows.length === 0) return res.status(404).send('Client not found');

        // Insert into employees table
        db.query(
            'INSERT INTO employees (id, store, internal_number) VALUES (?, ?, ?)',
            [newEmployee.id, newEmployee.store, newEmployee.internal_number],
            (err) => {
                if (err) return res.status(500).send({ error: err.message });

                // Update replica
                dbR.query('SELECT * FROM clients WHERE id = ?', [newEmployee.id], (err, row) => {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                    if (!row) {
                        return res.status(404).send('Client not found');
                    }
                    // Insert the user into the employees table
                    dbR.execute('INSERT INTO employees (id, store, internal_number) VALUES (?, ?, ?)',
                        [newEmployee.id, newEmployee.store, newEmployee.internal_number], function (err) {
                            if (err) {
                                return res.status(500).send({ error: err.message });
                            }
                        });
                });

                res.status(201).json({ message: 'Employee successfully added' });
            }
        );
    });
});

// Edit employee
router.put('/ttuser/edit/employee', verifyRequestOrigin, (req, res) => {
    const updatedEmployee = req.body;

    // Extract keys and values from the updatedEmployee object, filtering out undefined values
    const columns = Object.keys(updatedEmployee).filter(key =>
        updatedEmployee[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedEmployee[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedEmployee.id);

    const query = `UPDATE clients c
    JOIN employees e ON c.id = e.id
    SET ${columns.map(col => `${col} = ?`).join(', ')} 
    WHERE e.id = ? OR e.internal_number = ?`;

    db.execute(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Employee not found');
        }
        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).send('Employee not found');
            }
        });
        res.send('Employee successfully updated');
    });
});

// Get all stores
router.get('/ttuser/store', verifyRequestOrigin, (req, res) => {
    db.query(`SELECT * FROM entities e
        INNER JOIN clients c ON c.id = e.id AND e.entity_type = "store"
        LEFT JOIN entityHours eh ON eh.entity = e.id 
        `, [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(`SELECT * FROM entities e
                INNER JOIN clients c ON c.id = e.id AND e.entity_type = "store"
                LEFT JOIN entityHours eh ON eh.entity = e.id 
                `, [], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // Process the rows
                const result = rows.reduce((acc, row) => {
                    const existingStore = acc.find(store => store.name === row.name);

                    if (existingStore) {
                        // Push the opening hours to the existing store object
                        existingStore.opening_hours.push({
                            day: row.day,
                            hours: row.hours
                        });
                    } else {
                        // Push organized data into the accumulator
                        acc.push({
                            id: row.id,
                            nipc: row.nipc,
                            name: row.name,
                            email: row.email,
                            phone_number: row.phone_number,
                            address: row.address,
                            city: row.city,
                            country: row.country,
                            opening_hours: [{
                                day: row.day,
                                hours: row.hours
                            }]
                        });
                    }

                    return acc;
                }, []);

                res.json(result);
            });
        } else {
            // Process the rows
            const result = rows.reduce((acc, row) => {
                const existingStore = acc.find(store => store.name === row.name);

                if (existingStore) {
                    // Push the opening hours to the existing store object
                    existingStore.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                } else {
                    // Push organized data into the accumulator
                    acc.push({
                        id: row.id,
                        nipc: row.nipc,
                        name: row.name,
                        email: row.email,
                        phone_number: row.phone_number,
                        address: row.address,
                        city: row.city,
                        country: row.country,
                        opening_hours: [{
                            day: row.day,
                            hours: row.hours
                        }]
                    });
                }

                return acc;
            }, []);

            res.json(result);
        }
    });
});

// Get details about a store
router.get('/ttuser/store/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;

    // Check all possibilities (id, nipc, email, phone_number)
    let query = `
        SELECT e.*, c.*, eh.*
        FROM entities e 
        INNER JOIN clients c ON c.id = e.id 
        LEFT JOIN entityHours eh ON eh.entity = e.id 
        WHERE (e.id = ? OR e.nipc = ? OR c.email = ? OR c.phone_number = ?)
        AND e.entity_type = "store"
    `;

    db.query(query, [id, id, id, id], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [id, id, id, id], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (rows.length === 0) {
                    return res.status(204).send();
                }
                // Process the rows
                const result = rows.reduce((acc, row) => {
                    const existingStore = acc.find(store => store.name === row.name);

                    if (existingStore) {
                        // Push the opening hours to the existing store object
                        existingStore.opening_hours.push({
                            day: row.day,
                            hours: row.hours
                        });
                    } else {
                        // Push organized data into the accumulator
                        acc.push({
                            id: row.id,
                            nipc: row.nipc,
                            name: row.name,
                            email: row.email,
                            phone_number: row.phone_number,
                            address: row.address,
                            city: row.city,
                            country: row.country,
                            opening_hours: [{
                                day: row.day,
                                hours: row.hours
                            }]
                        });
                    }

                    return acc;
                }, []);

                res.json(result[0]);
            });
        } else if (rows.length === 0) {
            return res.status(204).send();
        } else {
            // Process the rows
            const result = rows.reduce((acc, row) => {
                const existingStore = acc.find(store => store.name === row.name);

                if (existingStore) {
                    // Push the opening hours to the existing store object
                    existingStore.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                } else {
                    // Push organized data into the accumulator
                    acc.push({
                        id: row.id,
                        nipc: row.nipc,
                        name: row.name,
                        email: row.email,
                        phone_number: row.phone_number,
                        address: row.address,
                        city: row.city,
                        country: row.country,
                        opening_hours: [{
                            day: row.day,
                            hours: row.hours
                        }]
                    });
                }

                return acc;
            }, []);

            res.json(result[0]);
        }
    });
});

// Add new store
router.post('/ttuser/add/store', verifyRequestOrigin, (req, res) => {
    const newStore = req.body;

    // Check if new store exists in the clients table
    db.query('SELECT * FROM clients WHERE id = ?', [newStore.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row || row.length === 0) {
            return res.status(404).send('Client not found');
        }

        // Insert the store into the entities table including address, city, country
        db.execute(
            'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "store", ?, ?, ?)',
            [newStore.id, newStore.nipc, newStore.address || null, newStore.city || null, newStore.country || null],
            function (err) {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }

                // Update replica
                dbR.query('SELECT * FROM clients WHERE id = ?', [newStore.id], (err, row) => {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                    if (!row || row.length === 0) {
                        return res.status(404).send('Client not found');
                    }

                    dbR.execute(
                        'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "store", ?, ?, ?)',
                        [newStore.id, newStore.nipc, newStore.address || null, newStore.city || null, newStore.country || null],
                        function (err) {
                            if (err) {
                                return res.status(500).send({ error: err.message });
                            }
                        }
                    );
                });

                res.status(201).json({ message: 'Store successfully added', product: row });
            }
        );
    });
});

// Edit store
router.put('/ttuser/edit/store', verifyRequestOrigin, (req, res) => {
    const updatedStore = req.body;

    // Extract keys and values from the updatedStore object, filtering out undefined values
    const columns = Object.keys(updatedStore).filter(key => updatedStore[key]
        !== undefined && key !== 'id');
    const values = columns.map(col => updatedStore[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedStore.id);

    const query = `UPDATE clients c JOIN entities e ON c.id = e.id
        SET ${columns.map(col => `${col} = ?`).join(', ')
        } WHERE e.id = ? AND e.entity_type = "store"`;

    db.execute(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Store not found');
        }
        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).send('Store not found');
            }
        });
        res.send('Store successfully updated');
    });
});

// Get all charities
router.get('/ttuser/charity', verifyRequestOrigin, (req, res) => {
    db.query(`SELECT * FROM entities e 
        INNER JOIN clients c ON c.id = e.id AND e.entity_type = "charity"
        LEFT JOIN entityHours eh ON eh.entity = e.id `, [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(`SELECT * FROM entities e 
                INNER JOIN clients c ON c.id = e.id AND e.entity_type = "charity"
                LEFT JOIN entityHours eh ON eh.entity = e.id `, [], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // Process the rows
                const result = rows.reduce((acc, row) => {
                    const existingCharity = acc.find(charity => charity.name === row.name);

                    if (existingCharity) {
                        // Push the opening hours to the existing charity object
                        existingCharity.opening_hours.push({
                            day: row.day,
                            hours: row.hours
                        });
                    } else {
                        // Push organized data into the accumulator
                        acc.push({
                            id: row.id,
                            nipc: row.nipc,
                            name: row.name,
                            email: row.email,
                            phone_number: row.phone_number,
                            address: row.address,
                            city: row.city,
                            country: row.country,
                            opening_hours: [{
                                day: row.day,
                                hours: row.hours
                            }]
                        });
                    }

                    return acc;
                }, []);

                res.json(result);
            });
        } else {
            // Process the rows
            const result = rows.reduce((acc, row) => {
                const existingCharity = acc.find(charity => charity.name === row.name);

                if (existingCharity) {
                    // Push the opening hours to the existing charity object
                    existingCharity.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                } else {
                    // Push organized data into the accumulator
                    acc.push({
                        id: row.id,
                        nipc: row.nipc,
                        name: row.name,
                        email: row.email,
                        phone_number: row.phone_number,
                        address: row.address,
                        city: row.city,
                        country: row.country,
                        opening_hours: [{
                            day: row.day,
                            hours: row.hours
                        }]
                    });
                }

                return acc;
            }, []);

            res.json(result);
        }
    });
});

// Get details about a charity
router.get('/ttuser/charity/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;

    // Check all possibilities (id, nipc, email, phone_number)
    let query = `
        SELECT e.*, c.*, eh.*
        FROM entities e 
        INNER JOIN clients c ON c.id = e.id 
        LEFT JOIN entityHours eh ON eh.entity = e.id 
        WHERE (e.id = ? OR e.nipc = ? OR c.email = ? OR c.phone_number = ?)
        AND e.entity_type = "charity"
    `;

    db.query(query, [id, id, id, id], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [id, id, id, id], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (rows.length === 0) {
                    return res.status(204).send();
                }
                // Process the rows
                const result = rows.reduce((acc, row) => {
                    // Check if the charity already exists in the accumulator
                    const existingCharity = acc.find(charity => charity.name === row.name);

                    if (existingCharity) {
                        // Push the opening hours to the existing charity object
                        existingCharity.opening_hours.push({
                            day: row.day,
                            hours: row.hours
                        });
                    } else {
                        // Push organized data into the accumulator
                        acc.push({
                            id: row.id,
                            nipc: row.nipc,
                            name: row.name,
                            email: row.email,
                            phone_number: row.phone_number,
                            address: row.address,
                            city: row.city,
                            country: row.country,
                            opening_hours: [{
                                day: row.day,
                                hours: row.hours
                            }]
                        });
                    }

                    return acc;
                }, []);

                res.json(result[0]);
            });
        } else if (rows.length === 0) {
            return res.status(204).send();
        } else {
            // Process the rows
            const result = rows.reduce((acc, row) => {
                // Check if the charity already exists in the accumulator
                const existingCharity = acc.find(charity => charity.name === row.name);

                if (existingCharity) {
                    // Push the opening hours to the existing charity object
                    existingCharity.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                } else {
                    // Push organized data into the accumulator
                    acc.push({
                        id: row.id,
                        nipc: row.nipc,
                        name: row.name,
                        email: row.email,
                        phone_number: row.phone_number,
                        address: row.address,
                        city: row.city,
                        country: row.country,
                        opening_hours: [{
                            day: row.day,
                            hours: row.hours
                        }]
                    });
                }

                return acc;
            }, []);

            res.json(result[0]);
        }
    });
});

// Add new charity
router.post('/ttuser/add/charity', verifyRequestOrigin, (req, res) => {
    const newCharity = req.body;

    // Check if charity exists in clients table
    db.query('SELECT * FROM clients WHERE id = ?', [newCharity.id], (err, row) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!row || row.length === 0) {
            return res.status(404).send('Client not found');
        }

        // Insert charity into entities table including address, city, country
        db.execute(
            'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "charity", ?, ?, ?)',
            [newCharity.id, newCharity.nipc, newCharity.address || null, newCharity.city || null, newCharity.country || null],
            function (err) {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }

                // Update replica
                dbR.query('SELECT * FROM clients WHERE id = ?', [newCharity.id], (err, row) => {
                    if (err) {
                        return res.status(500).send({ error: err.message });
                    }
                    if (!row || row.length === 0) {
                        return res.status(404).send('Client not found');
                    }

                    dbR.execute(
                        'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "charity", ?, ?, ?)',
                        [newCharity.id, newCharity.nipc, newCharity.address || null, newCharity.city || null, newCharity.country || null],
                        function (err) {
                            if (err) {
                                return res.status(500).send({ error: err.message });
                            }
                        }
                    );
                });

                res.status(201).json({ message: 'Charity successfully added', product: row });
            }
        );
    });
});

// Edit charity
router.put('/ttuser/edit/charity', verifyRequestOrigin, (req, res) => {
    const updatedCharity = req.body;

    // Extract keys and values from the updatedCharity object, filtering out undefined values
    const columns = Object.keys(updatedCharity).filter(key =>
        updatedCharity[key] !== undefined && key !== 'id');
    const values = columns.map(col => updatedCharity[col]);

    // Add the id at the end of the values array for the WHERE clause
    values.push(updatedCharity.id);

    const query = `UPDATE clients c JOIN entities e ON c.id = e.id
        SET ${columns.map(col => `${col} = ?`).join(', ')
        } WHERE e.id = ? AND e.entity_type = "charity"`;

    db.execute(query, values, function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('Charity not found');
        }
        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).send('Charity not found');
            }
        });
        res.send('Charity successfully updated');
    });
});

// Add new charity project
router.post('/ttuser/add/charityProject', (req, res) => {
    const { name, description, endDate, charity } = req.body;

    if (!name || !description || !charity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO charityProjects (name, description, endDate, charity)
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, description, endDate || null, charity];

    db.query(query, values, (err, result) => {
        if (err) {
            dbR.query(query, values, (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, insertedId: result.insertId });
            });
        } else {
            res.json({ success: true, insertedId: result.insertId });
        }
    });
});

// Delete charity projects in bulk
router.post('/ttuser/remove/charityProjects', verifyRequestOrigin, (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No project IDs provided' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM charityProjects WHERE id IN (${placeholders})`;

    db.query(query, ids, (err, result) => {
        if (err) {
            dbR.query(query, ids, (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ success: true, deleted: result.affectedRows });
            });
        } else {
            res.json({ success: true, deleted: result.affectedRows });
        }
    });
});

// Get charity projects
router.get('/ttuser/charityProjects', (req, res) => {
  const { charity_id } = req.query;
  if (!charity_id) {
    return res.status(400).json({ error: 'charity_id required' });
  }

  const query = `
    SELECT id, name, description, endDate
    FROM charityProjects
    WHERE charity = ?
    ORDER BY endDate ASC
  `;

  db.query(query, [charity_id], (err, rows) => {
    if (err) {
      dbR.query(query, [charity_id], (err, rows) => {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          return res.status(500).json({ error: err.message });
        }
        res.setHeader('Content-Type', 'application/json');
        res.json(rows || []);
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json(rows || []);
    }
  });
});

// Get all product interests
router.get('/ttuser/interests', verifyRequestOrigin, (req, res) => {
    const query = `SELECT * FROM interests`;

    db.query(query, (err, rows) => {
        if (err) {
            dbR.query(query, (err, rows) => {
                if (err) return res.status(500).send({ error: err.message });
                return res.status(200).json(rows || []);
            });
        } else {
            return res.status(200).json(rows || []);
        }
    });
});

// Add product alert
router.post('/ttuser/interest', verifyRequestOrigin, (req, res) => {
    const newInterest = req.body;

    // Filter out undefined or null values
    const columns = Object.keys(newInterest).filter(key => newInterest[key] !== undefined);
    const values = columns.map(col => {
        if (col === 'year') {
            return parseInt(newInterest[col], 10) || null;
        }
        return newInterest[col];
    });


    const query = `INSERT INTO interests (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;

    db.execute(query, values, function (err) {
        if (err) return res.status(500).send({ error: err.message });

        // Update replica
        dbR.execute(query, values, function (err) {
            if (err) return res.status(500).send({ error: err.message });
        });

        res.status(201).send('Product alert successfully added');
    });
});

// Get product alert
router.get('/ttuser/interest/:email', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT i.*
        FROM interests i
        JOIN clients c ON i.interested_user = c.email
        WHERE i.interested_user = ?`;

    db.query(query, [req.params.email], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [req.params.email], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                return res.status(200).json(rows || []);
            });
        } else {
            return res.status(200).json(rows || []);
        }
    });
});

// Remove product alert
router.delete('/ttuser/remove/interest/:id', verifyRequestOrigin, (req, res) => {
    const query = `DELETE FROM interests WHERE id = ?`;

    db.execute(query, [req.params.id], function (err) {
        if (err) return res.status(500).send({ error: err.message });

        // Update replica
        dbR.execute(query, [req.params.id], function (err) {
            if (err) return res.status(500).send({ error: err.message });
        });

        res.status(200).send('Product alert successfully removed');
    });
});

// Add product alert notification
router.get('/ttuser/interest/addNotification/:interestId', verifyRequestOrigin, async (req, res) => {
    const interestId = req.params.interestId;

    const interestQuery = `UPDATE interests SET unread_notifications = COALESCE(unread_notifications, 0) + 1 WHERE id = ?`;

    try {
        // Execute update on both db and dbR, but also check affectedRows
        const results = await Promise.all([
            new Promise((resolve, reject) => {
                db.execute(interestQuery, [interestId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbR.execute(interestQuery, [interestId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            })
        ]);

        // Check if either update affected zero rows (meaning interestId not found)
        if (results.some(r => r.affectedRows === 0)) {
            return res.status(404).send({ error: `Interest with id ${interestId} not found` });
        }

        res.send('Notification count updated successfully');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Clear product alert notifications
router.put('/ttuser/interest/clearNotifications/:id', verifyRequestOrigin, (req, res) => {
    const query = `UPDATE interests SET unread_notifications = 0 WHERE id = ?`;

    db.execute(query, [req.params.id], function (err) {
        if (err) return res.status(500).send({ error: err.message });

        // Update replica
        dbR.execute(query, [req.params.id], function (err) {
            if (err) return res.status(500).send({ error: err.message });
        });

        res.send('Notifications cleared successfully');
    });
});

// Add product to wishlist
router.post('/ttuser/wishlist', verifyRequestOrigin, (req, res) => {
    const query = `INSERT IGNORE INTO wishlist(wishlisted_product, interested_user) VALUES (?, ?)`;

    db.execute(query, [req.body.wishlisted_product, req.body.interested_user], function (err, result) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // Update replica
        dbR.execute(query, [req.body.wishlisted_product, req.body.interested_user], function (err) {
            if (err) {
                return res.status(500).send({ error: err.message });
            }
        });

        res.status(201).send('Product successfully added to wishlist');
    });
});

// Get wishlist products
router.get('/ttuser/wishlist/:email', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT w.*, pi.image_path AS product_image, p.name AS product_name,
        p.availability AS product_availability, 
        p.category, 
        p.brand, 
        p.store_nipc, 
        p.id AS product_id, sp.price
        FROM wishlist w
        JOIN clients c ON w.interested_user = c.email
        LEFT JOIN saleProducts sp ON w.wishlisted_product = sp.id
        LEFT JOIN products p ON sp.id = p.id
        LEFT JOIN productImages pi ON p.id = pi.product AND pi.image_order = 1
        WHERE w.interested_user = ?`;

    db.query(query, [req.params.email], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [req.params.email], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                return res.status(200).json(rows || []);
            });
        } else {
            return res.status(200).json(rows || []);
        }
    });
});

// Remove product from wishlist
router.delete('/ttuser/remove/wishlist/:id', verifyRequestOrigin, (req, res) => {
    const query = `DELETE FROM wishlist WHERE id = ?`;

    db.execute(query, [req.params.id], function (err) {
        if (err) return res.status(500).send({ error: err.message });

        // Update replica
        dbR.execute(query, [req.params.id], function (err) {
            if (err) return res.status(500).send({ error: err.message });
        });

        return res.status(200).send("Product successfully removed from the user's wishlist");
    });
});

// Get product wishlist count
router.get('/ttuser/wishlist/count/:product_id', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT COUNT(*) AS count 
        FROM wishlist 
        WHERE wishlisted_product = ?
    `;

    db.query(query, [parseInt(req.params.product_id)], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [parseInt(req.params.product_id)], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                return res.status(200).json(rows[0] || { count: 0 });
            });
        } else {
            return res.status(200).json(rows[0] || { count: 0 });
        }
    });
});

// Get sale transactions
router.get('/tttransaction/sales', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT 
            t.*, 
            s.is_online, 
            s.order_number,
            s.employee,
            s.store,
            s.shipping_address,
            s.shipping_postal_code,
            s.shipping_city,
            s.shipping_country,
            s.sale_status,
            s.network,
            p.id AS product_id,
            p.name AS product_name,
            pi.image_path AS product_image
        FROM transactions t 
        INNER JOIN sales s ON s.transaction_id = t.id
        INNER JOIN soldProducts sp ON s.transaction_id = sp.sale_id
        INNER JOIN products p ON sp.product_id = p.id
        INNER JOIN productImages pi ON sp.product_id = pi.product AND pi.image_order = 1
    `;
    const groupSales = (rows) => {
        const salesMap = new Map();

        rows.forEach(row => {
            if (!salesMap.has(row.id)) {
                salesMap.set(row.id, {
                    id: row.id,
                    client: row.client,
                    transaction_value: row.transaction_value,
                    date_inserted: row.date_inserted,
                    is_online: row.is_online,
                    order_number: row.order_number,
                    overseeing_employee: row.employee,
                    store_of_sale: row.store,
                    shipping_address: row.shipping_address,
                    shipping_postal_code: row.shipping_postal_code,
                    shipping_city: row.shipping_city,
                    shipping_country: row.shipping_country,
                    network: row.network,
                    sale_status: row.sale_status,
                    sold_products: []
                });
            }

            const sale = salesMap.get(row.id);

            sale.sold_products.push({
                id: row.product_id,
                name: row.product_name,
                product_image: row.product_image
            });
        });

        return Array.from(salesMap.values());
    }
    db.query(query, [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                const result = groupSales(rows);
                res.json(result);
            });
        } else {
            const result = groupSales(rows);
            res.json(result);
        }
    });
});

// Get sale transactions from a client
router.get('/tttransaction/sales/:email', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT 
            t.*,
            s.is_online, 
            s.order_number,
            s.employee,
            s.store,
            s.shipping_address,
            s.shipping_postal_code,
            s.shipping_city,
            s.shipping_country,
            s.network,
            s.sale_status,
            p.id AS product_id,
            p.name AS product_name,
            pi.image_path AS product_image
        FROM transactions t 
        INNER JOIN sales s ON s.transaction_id = t.id
        INNER JOIN soldProducts sp ON s.transaction_id = sp.sale_id
        INNER JOIN products p ON sp.product_id = p.id
        INNER JOIN productImages pi ON sp.product_id = pi.product AND pi.image_order = 1
        WHERE t.client = ? 
    `;
    const groupSales = (rows) => {
        const salesMap = new Map();

        rows.forEach(row => {
            if (!salesMap.has(row.id)) {
                salesMap.set(row.id, {
                    id: row.id,
                    client: row.client,
                    transaction_value: row.transaction_value,
                    date_inserted: row.date_inserted,
                    is_online: row.is_online,
                    order_number: row.order_number,
                    overseeing_employee: row.employee,
                    store_of_sale: row.store,
                    shipping_address: row.shipping_address,
                    shipping_postal_code: row.shipping_postal_code,
                    shipping_city: row.shipping_city,
                    shipping_country: row.shipping_country,
                    sale_status: row.sale_status,
                    network: row.network,
                    sold_products: []
                });
            }

            const sale = salesMap.get(row.id);

            sale.sold_products.push({
                id: row.product_id,
                name: row.product_name,
                product_image: row.product_image
            });
        });

        return Array.from(salesMap.values());
    }
    db.query(query, [req.params.email], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                const result = groupSales(rows);
                res.json(result);
            });
        } else {
            const result = groupSales(rows);
            res.json(result);
        }
    });
});


// Add sale transaction
router.post('/tttransaction/sales/add', verifyRequestOrigin, (req, res) => {
    let { client, transaction_value, is_online, order_number,
        employee, store, network, shipping_address, shipping_postal_code,
        shipping_city, shipping_country, products } = req.body;

    if (!client || !transaction_value ||
        typeof is_online !== 'boolean' || !Array.isArray(products)) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const transactionQuery = `
        INSERT INTO transactions (client, transaction_value)
        VALUES (?, ?)
    `;

    const saleQuery = `
        INSERT INTO sales (transaction_id, is_online, order_number, employee, store, 
        shipping_address, shipping_postal_code, shipping_city, shipping_country, network)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const soldProductsQuery = `
        INSERT INTO soldProducts (product_id, sale_id)
        VALUES ?
    `;

    const productsQuery = `
        UPDATE products SET availability = 0 WHERE id = ?
    `;

    // Insert transaction
    db.query(transactionQuery, [client, transaction_value], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: err.message });
        }

        const transactionId = result.insertId;
        if (order_number == "APPLE-PAY-") {
            order_number += transactionId;
        }

        db.query(saleQuery,
            [transactionId, is_online, order_number, employee, store, shipping_address,
                shipping_postal_code, shipping_city, shipping_country, network || null], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send({ error: err.message });
                    }

                    // Insert sold products
                    if (products.length === 0) {
                        return res.status(400).send({ error: 'No products provided' });
                    }

                    const soldProductsData = products.map(productId => [productId, transactionId]);

                    db.query(soldProductsQuery, [soldProductsData], (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send({ error: err.message });
                        }

                        // Update availability of sold products
                        products.forEach(productId => {
                            db.query(productsQuery, [productId], (err) => {
                                if (err) console.error('Product update error:', err.message);
                            });
                        });

                        // Update replica
                        dbR.query(transactionQuery, [client, transaction_value], (err, result) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send({ error: err.message });
                            }

                            const transactionId = result.insertId;

                            // Insert into sales
                            dbR.query(saleQuery,
                                [transactionId, is_online, order_number, employee, store, shipping_address,
                                    shipping_postal_code, shipping_city, shipping_country, network || null], (err) => {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).send({ error: err.message });
                                        }

                                        // Insert sold products
                                        if (products.length === 0) {
                                            return res.status(400).send({ error: 'No products provided' });
                                        }

                                        const soldProductsData = products.map(productId => [productId, transactionId]);

                                        dbR.query(soldProductsQuery, [soldProductsData], (err) => {
                                            if (err) {
                                                console.error(err);
                                                return res.status(500).send({ error: err.message });
                                            }

                                            // Update availability of sold products
                                            products.forEach(productId => {
                                                dbR.query(productsQuery, [productId], (err) => {
                                                    if (err) console.error('Product update error:', err.message);
                                                });
                                            });
                                        });
                                    });
                        });

                        res.status(201).send({ message: 'Transaction, sale, and products added successfully', transactionId });
                    });
                });
    });
});

// Check availability of products
router.post('/tttransaction/product-availability', verifyRequestOrigin, (req, res) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "No products provided" });
    }

    const placeholders = productIds.map(() => '?').join(',');
    const query = `SELECT id FROM products WHERE id IN (${placeholders}) AND availability = 0`;

    db.query(query, productIds, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const unavailable = rows.map(row => row.id);
        res.json({
            allAvailable: unavailable.length === 0,
            unavailable
        });
    });
});


// Get repair transactions
router.get('/tttransaction/repairs', verifyRequestOrigin, (req, res) => {
    const query = `SELECT * FROM transactions t 
    INNER JOIN repairs r ON r.transaction_id = t.id`
    db.query(query, [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                res.json(rows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get repair transactions from a client
router.get('/tttransaction/repairs/:email', verifyRequestOrigin, (req, res) => {
    const query = `SELECT * FROM transactions t 
    INNER JOIN repairs r ON r.transaction_id = t.id
    WHERE t.client = ? `
    db.query(query, [req.params.email], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [req.params.email], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                res.json(rows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get donation transactions
router.get('/tttransaction/donations', verifyRequestOrigin, (req, res) => {
    const query = `SELECT * FROM transactions t 
    INNER JOIN donations ON d.transaction_id = t.id`
    db.query(query, [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query(query, [], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                res.json(rows);
            });
        } else {
            res.json(rows);
        }
    });
});

// Get shipping costs
router.get('/tttransaction/shipping', verifyRequestOrigin, (req, res) => {
    db.query('SELECT current_shipping_cost FROM shipping WHERE id=1', [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            dbR.query('SELECT current_shipping_cost FROM shipping WHERE id=1', [], (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }
                res.json(rows[0]);
            });
        } else {
            res.json(rows[0]);
        }
    });
});

// Nominatim OpenStreetMap API
router.get("/geocode", verifyRequestOrigin, async (req, res) => {
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

// Export the API routes
export { router };
