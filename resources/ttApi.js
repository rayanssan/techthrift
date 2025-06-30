    "use strict";

import { Router } from 'express';
const router = Router();
// Import the db connection from dbConnection.js
import { db, dbR } from './dbConnection.js';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import multer from 'multer';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { exposeApi } from '../techthrift.js';
import pkg from 'pdfkit';
const PDFDocument = pkg;
// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../media/images/products'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

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
                    return res.status(500).json({ error: err.message });
                } else {
                    res.json(replicaRows);
                }
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
            // dbR.query(query, params, (replicaErr, replicaRows) => {
            //     if (replicaErr) {
            //         return res.status(500).json({ error: err.message });
            //     }
            //     res.json(replicaRows);
            // });
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
            // dbR.query(checkSaleQuery, [id], (err, result) => {
            //     if (err) {
            //         return res.status(500).json({ error: err.message });
            //     }
            //     // If the product is found in the saleProducts table, set isSaleProduct to true
            //     isSaleProduct = result.length > 0;

            //     // Based on whether it's a sale product, modify the main query
            //     let query = `SELECT * FROM products, productImages LEFT JOIN productImages ON 
            //         products.id = productImages.product WHERE id = ?`;
            //     let params = [id];

            //     if (isSaleProduct) {
            //         query = `
            //         SELECT products.*, saleProducts.*, productImages.*, clients.name AS store
            //         FROM products
            //         JOIN saleProducts ON products.id = saleProducts.id
            //         LEFT JOIN productImages ON products.id = productImages.product
            //         JOIN entities ON products.store_nipc = entities.nipc
            //         JOIN clients ON entities.id = clients.id
            //         WHERE products.id = ?;
            //         `;
            //     }

            //     // Execute the final query
            //     dbR.query(query, params, (err, rows) => {
            //         if (err || rows.length === 0) {
            //             return res.status(404).send('Product not found');
            //         } else {
            //             // Create images object with keys as image_order and values as image_path
            //             const product = rows[0];
            //             const images = {};

            //             rows.forEach(row => {
            //                 // Assign the image path to the key being the image_order
            //                 images[row.image_order] = row.image_path;
            //             });

            //             // Build the response object
            //             const response = {
            //                 ...product, // product info
            //                 images: images // image info
            //             };

            //             res.json(response);
            //         }
            //     });
            // });
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
                } else {
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
                }
            });
        }
    });
});

// Add product
router.post('/tt/add', verifyRequestOrigin, (req, res) => {
    const newProduct = req.body;


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

    db.execute(query, values, function (err) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

         res.status(201).json({
         id: result.insertId,
         ...newProduct
        }); // Send back the newly added product
        // Update replica
        // dbR.execute(query, values, function (err, result) {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     res.status(201).json({
        //         id: result.insertId,
        //         ...newProduct
        //     }); // Send back the newly added product
        });
    });
});

// Upload Images
router.post('/tt/upload', verifyRequestOrigin, upload.array('images'), (req, res) => {
    const product_id = req.body.product_id;
    let orders = req.body.orders;

    // Parse order array if needed
    try {
        if (typeof orders === 'string') orders = JSON.parse(orders);
    } catch (e) {
        orders = [];
    }

    if (!product_id || !req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Missing images.' });
    }

    const insertValues = req.files.map((file, i) => [
        product_id,
        file.filename,
        parseInt(orders[i]) || i + 1
    ]);

    const query = `
        INSERT INTO productImages (product, image_path, image_order)
        VALUES ${insertValues.map(() => '(?, ?, ?)').join(', ')}
    `;

    const flatValues = insertValues.flat();

    db.execute(query, flatValues, (err) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.status(200).json({ message: 'Images uploaded and metadata saved.' });
        // dbR.execute(query, flatValues, (err) => {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     res.status(200).json({ message: 'Images uploaded and metadata saved.' });
        // });
    });
});

// Remove Product
router.delete('/tt/remove/:id', verifyRequestOrigin, (req, res) => {
    const productId = req.params.id;

    // First, delete images associated with the product
    db.execute('DELETE FROM productImages WHERE product = ?', [productId], function (err) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        // Then, delete the product itself
        db.execute('DELETE FROM products WHERE id = ?', [productId], function (err) {
            if (err) {
                console.error('DB operation failed:', err.message);
            }
            res.status(200).send('Product and related images successfully removed');
            // Also delete from replica
            // dbR.execute('DELETE FROM productImages WHERE product = ?', [productId], () => {
            //     if (err) {
            //         console.error('DB operation failed:', err.message);
            //     }
            // });
            // dbR.execute('DELETE FROM products WHERE id = ?', [productId], () => {
            //     if (err) {
            //         console.error('DB operation failed:', err.message);
            //     }
            //     res.status(200).send('Product and related images successfully removed');
            // });
        });
    });
});

// Set product up for sale
router.post('/tt/sale/add', verifyRequestOrigin, (req, res) => {
    const newSaleProduct = req.body;

    // Check if product exists in the products table
    db.query('SELECT * FROM products WHERE id = ?', [newSaleProduct.id], (err, row) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        // Insert the product into the saleProducts table
        db.execute('INSERT INTO saleProducts (id, price) VALUES (?, ?)',
            [newSaleProduct.id, newSaleProduct.price], function (err) {
                if (err) {
                    console.error('DB operation failed:', err.message);
                }
                db.execute('UPDATE products SET availability = 1 WHERE id = ?', [newSaleProduct.id], (err) => {
                    if (err) {
                        console.error('DB operation failed:', err.message);
                    }
                    res.status(201).json({ message: 'Product set for sale', product: row });
                    // Update replica
                    // dbR.query('SELECT * FROM products WHERE id = ?', [newSaleProduct.id], (err, row) => {
                    //     if (err) {
                    //         console.error('DB operation failed:', err.message);
                    //     }
                    //     // Insert the product into the saleProducts table
                    //     dbR.execute('INSERT INTO saleProducts (id, price) VALUES (?, ?)',
                    //         [newSaleProduct.id, newSaleProduct.price], function (err) {
                    //             if (err) {
                    //                 console.error('DB operation failed:', err.message);
                    //             }
                    //             dbR.execute('UPDATE products SET availability = 1 WHERE id = ?', [newSaleProduct.id], (err) => {
                    //                 if (err) {
                    //                     console.error('DB operation failed:', err.message);
                    //                 }

                    //                 res.status(201).json({ message: 'Product set for sale', product: row });
                    //             });
                    //         });
                    // });
                });
            });
    });
});

// Remove product from sale
router.put('/tt/sale/remove/:id', verifyRequestOrigin, (req, res) => {
    // Check if the product exists in the saleProducts table
    db.query('SELECT * FROM saleProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        // Remove the product from the saleProducts table
        db.execute('DELETE FROM saleProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                console.error('DB operation failed:', err.message);
            }
            res.status(200).json({ message: 'Product removed from sale', productId });
            // Update replica
            // dbR.query('SELECT * FROM saleProducts WHERE id = ?', [req.params.id], (err, row) => {
            //     if (err) {
            //         console.error('DB operation failed:', err.message);
            //     }
            //     // Remove the product from the saleProducts table
            //     dbR.execute('DELETE FROM saleProducts WHERE id = ?', [req.params.id], function (err) {
            //         if (err) {
            //             console.error('DB operation failed:', err.message);
            //         } else {
            //             res.status(200).json({ message: 'Product removed from sale', productId });
            //         }
            //     });
            });
        });
    });
});

// Get all repair parts in the system
router.get('/tt/repairParts', verifyRequestOrigin, (req, res) => {
    const query = 'SELECT * FROM repairParts';

    db.query(query, (err, results) => {
        if (err) {
            // Fallback to replica
            // dbR.query(query, (errR, resultsR) => {
            //     if (errR) {
            //         return res.status(500).json({ error: errR.message });
            //     } else {
            //         return res.json(resultsR);
            //     }
            // });
        } else {
            return res.json(results);
        }
    });
});

// Add repair part
router.post('/tt/repairPart/add', verifyRequestOrigin, (req, res) => {
    const { name, price, store } = req.body;

    if (!name || price == null || store == null) {
        return res.status(400).json({ error: 'Name, price, and store are required' });
    }

    const query = 'INSERT INTO repairParts (name, price, store) VALUES (?, ?, ?)';
    const values = [name, price, store];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        return res.status(201).json({ message: 'Repair part added successfully', id: result.insertId });
        // Update replica
        // dbR.query(query, values, (errR, result) => {
        //     if (errR) {
        //         console.error('DB operation failed:', errR.message);
        //     }
        //     return res.status(201).json({ message: 'Repair part added successfully', id: result.insertId });
        // });
    });
});

// Delete repair part
router.put('/tt/repairParts/remove/:id', verifyRequestOrigin, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM repairParts WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Repair part not found' });
        }
        return res.json({ message: 'Repair part deleted successfully' });
        // Update replica
        // dbR.query(query, [id], (errR) => {
        //     if (errR) {
        //         console.error('DB operation failed:', errR.message);
        //     }
        //     return res.json({ message: 'Repair part deleted successfully' });
        // });
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
                // dbR.query(query, params, (err, rows) => {
                //     if (err) {
                //         return res.status(500).json({ error: err.message });
                //     }
                //     res.json(rows);
                // });
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
                    // dbR.query('SELECT * FROM donationProducts dp INNER JOIN products p ON p.id = dp.id WHERE dp.id = ?',
                    //     [req.params.id], (err, rows) => {
                    //         if (err) {
                    //             return res.status(500).json({ error: err.message });
                    //         } else if (rows.length === 0) {
                    //             return res.status(404).send('Product not found');
                    //         } else {
                    //             res.json(rows[0]);
                    //         }
                    //     });
                } else if (rows.length === 0) {
                    return res.status(404).send('Product not found');
                } else {
                    res.json(rows[0]);
                }
            });
    });

// Set product up for donation
router.post('/tt/donation/add', verifyRequestOrigin, (req, res) => {
    const { id, donor, charity } = req.body;

    if (!id || !charity) {
        return res.status(400).send({ error: 'No product given' });
    }

    // Check if product exists
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        // Insert into donationProducts
        const insertQuery = `
            INSERT INTO donationProducts (id, charity_nipc, donor_nif)
            VALUES (?, ?, ?)
            `;
        const insertValues = [id, charity, donor];

        db.execute(insertQuery, insertValues, function (err) {
            if (err) console.error('DB operation failed:', err.message);
            res.status(201).json({ message: 'Product set for donation' });
            // Update replica DB
            // dbR.query('SELECT * FROM products WHERE id = ?', [id], (err, rows) => {
            //     if (err) console.error('DB operation failed:', err.message);

            //     dbR.execute(insertQuery, insertValues, function (err) {
            //         if (err) console.error('DB operation failed:', err.message);
            //         res.status(201).json({ message: 'Product set for donation' });
            //     });
            });
        });
    });
});

// Remove product from donation
router.put('/tt/donation/remove/:id', verifyRequestOrigin, (req, res) => {
    // Check if the product exists in the donationProducts table
    db.query('SELECT * FROM donationProducts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        // Remove the product from the donationProducts table
        db.execute('DELETE FROM donationProducts WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                console.error('DB operation failed:', err.message);
            }
            res.status(200).json({ message: 'Product removed from donation', product: row });
            // Update replica
            // dbR.query('SELECT * FROM donationProducts WHERE id = ?', [req.params.id], (err, row) => {
            //     if (err) {
            //         console.error('DB operation failed:', err.message);
            //     }
            //     // Remove the product from the donationProducts table
            //     dbR.execute('DELETE FROM donationProducts WHERE id = ?', [req.params.id], function (err) {
            //         if (err) {
            //             console.error('DB operation failed:', err.message);
            //         }
            //         res.status(200).json({ message: 'Product removed from donation', product: row });
            //     });
            });
        });

    });
});

// Get all categories
router.get('/tt/categories', verifyRequestOrigin,
    (req, res) => {
        db.query('SELECT * FROM categories', [], (err, rows) => {
            if (err) {
                // // Fallback to replica DB
                // dbR.query('SELECT * FROM categories', [], (err, rows) => {
                //     if (err) {
                //         return res.status(500).json({ error: err.message });
                //     }
                //     res.json(rows);
                // });
            } else {
                res.json(rows);
            }
        });
    });

// Get all clients in the system
router.get('/ttuser', verifyRequestOrigin, (req, res) => {
    const { user_type, id, nif, nic, email, phone_number } = req.query;

    let conditions = [];
    const params = [];

    // User type filter
    if (user_type === 'store') {
        conditions.push('e.entity_type = "store"');
    } else if (user_type === 'charity') {
        conditions.push('e.entity_type = "charity"');
    } else if (user_type === 'employee') {
        conditions.push('em.id IS NOT NULL');
    } else if (user_type === 'client') {
        conditions.push('e.entity_type IS NULL');
        conditions.push('em.id IS NULL');
    }

    // Optional filters
    if (id) {
        conditions.push('c.id = ?');
        params.push(id);
    }

    if (nif) {
        conditions.push('c.nif = ?');
        params.push(nif);
    }

    if (nic) {
        conditions.push('c.nic = ?');
        params.push(nic);
    }

    if (email) {
        conditions.push('c.email = ?');
        params.push(email);
    }

    if (phone_number) {
        conditions.push('c.phone_number = ?');
        params.push(phone_number);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

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

    // Query
    db.query(query, params, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            // dbR.query(query, params, (err, rows) => {
            //     if (err) {
            //         return res.status(500).json({ error: err.message });
            //     }
            //     if (rows.length === 0) {
            //         return res.status(204).send();
            //     }
            //     res.json(rows.length === 1 ? rows[0] : rows);
            // });
        } else {
            if (rows.length === 0) {
                return res.status(204).send();
            }
            res.json(rows.length === 1 ? rows[0] : rows);
        }
    });
});

// Add new client
router.post('/ttuser/add/client', verifyRequestOrigin, (req, res) => {
    const newClient = req.body;

    const firstName = newClient.first_name?.trim() || '';
    const lastName = newClient.last_name?.trim() || '';
    const fullName = (firstName + ' ' + lastName).trim();

    const storeName = newClient.store_name?.trim() || '';
    const charityName = newClient.charity_name?.trim() || '';

    newClient.name = fullName || storeName || charityName || '';

    delete newClient.first_name;
    delete newClient.last_name;
    delete newClient.store_name;
    delete newClient.charity_name;

    /* Since some attributes are optional, extract keys and values from the newClient object, 
    filtering out any undefined values */
    const columns = Object.keys(newClient).filter(key => newClient[key] !== undefined);
    const values = columns.map(col => newClient[col]);

    const query = `INSERT INTO clients (${columns.join(', ')})
               VALUES (${columns.map(() => '?').join(', ')})`;

    db.execute(query, values, function (err) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.status(201).json({
             message: 'Client successfully added or updated',
             id: result.insertId,
             clientData: newClient
        });
        // Update replica
        // dbR.execute(query, values, function (err, result) {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     res.status(201).json({
        //         message: 'Client successfully added or updated',
        //         id: result.insertId,
        //         clientData: newClient
        //     });
        // });
    });
});

// Edit client
router.put('/ttuser/edit/client', verifyRequestOrigin, (req, res) => {
    const updatedClient = req.body;

    // Extract identifiers
    const { id, email, phone_number, nif, nic } = updatedClient;

    // Require at least one identifier
    if (!id && !email && !phone_number && !nif && !nic) {
        return res.status(400).send({ error: 'Must provide id, email, phone_number, nif, or nic as identifier' });
    }

    // Filter fields to update (exclude identifiers and id/email which are immutable)
    const columns = Object.keys(updatedClient).filter(key =>
        updatedClient[key] !== undefined &&
        key !== 'id' &&
        key !== 'email'
    );

    if (columns.length === 0) {
        return res.status(400).send({ error: 'No fields to update' });
    }

    // Validate name is not empty if included
    if (columns.includes('name') && (!updatedClient.name || updatedClient.name.trim() === '')) {
        return res.status(400).send({ error: 'Name cannot be empty' });
    }

    const values = columns.map(col => updatedClient[col]);

    // Build WHERE clause dynamically based on identifiers provided
    const whereClauses = [];
    const whereValues = [];

    if (id !== undefined) {
        whereClauses.push('id = ?');
        whereValues.push(id);
    }
    if (email !== undefined) {
        whereClauses.push('email = ?');
        whereValues.push(email);
    }
    if (phone_number !== undefined) {
        whereClauses.push('phone_number = ?');
        whereValues.push(phone_number);
    }
    if (nif !== undefined) {
        whereClauses.push('nif = ?');
        whereValues.push(nif);
    }
    if (nic !== undefined) {
        whereClauses.push('nic = ?');
        whereValues.push(nic);
    }

    const whereSql = whereClauses.join(' OR ');
    values.push(...whereValues);

    const query = `UPDATE clients SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE ${whereSql}`;

    db.execute(query, values, function (err) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.send('Client successfully updated');
        // Update replica
        // dbR.execute(query, values, function (err) {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }
        //     res.send('Client successfully updated');
        // });
    });
});

// Remove client
router.delete('/ttuser/remove/client/:id', verifyRequestOrigin, (req, res) => {
    db.execute('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.send('Client successfully removed');
        // Update replica
        // dbR.execute('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }
        //     res.send('Client successfully removed');
        // });
    });
});

// Get all employees
router.get('/ttuser/employee', verifyRequestOrigin, (req, res) => {
    const { id, email, phone_number } = req.query;

    let sql = 'SELECT * FROM employees e INNER JOIN clients c ON c.id = e.id';
    const conditions = [];
    const values = [];

    if (id) {
        conditions.push('e.id = ?');
        values.push(id);
    }

    if (email) {
        conditions.push('c.email = ?');
        values.push(email);
    }

    if (phone_number) {
        conditions.push('c.phone_number = ?');
        values.push(phone_number);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Query
    db.query(sql, values, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            // dbR.query(sql, values, (err, rows) => {
            //     if (err) {
            //         return res.status(500).json({ error: err.message });
            //     }
            //     if (rows.length === 0) {
            //         return res.status(204).send();
            //     }
            //     res.json(rows.length === 1 ? rows[0] : rows);
            // });
        } else {
            if (rows.length === 0) {
                return res.status(204).send();
            }
            res.json(rows.length === 1 ? rows[0] : rows);
        }
    });
});

// Add new employee
router.post('/ttuser/add/employee', verifyRequestOrigin, (req, res) => {
    const newEmployee = req.body;

    if (!newEmployee.id || !newEmployee.store || !newEmployee.internal_number) {
        return res.status(400).send({ error: "Missing required fields: id, store, internal_number" });
    }

    // Check if clients exists
    db.query('SELECT * FROM clients WHERE id = ?', [newEmployee.id], (err, rows) => {
        if (err) console.error('DB operation failed:', err.message);

        // Insert into employees table
        db.query(
            'INSERT INTO employees (id, store, internal_number) VALUES (?, ?, ?)',
            [newEmployee.id, newEmployee.store, newEmployee.internal_number],
            (err) => {
                if (err) console.error('DB operation failed:', err.message);
                res.status(201).json({ message: 'Employee successfully added' });
                // Update replica
                // dbR.query('SELECT * FROM clients WHERE id = ?', [newEmployee.id], (err, row) => {
                //     if (err) {
                //         console.error('DB operation failed:', err.message);
                //     }
                //     // Insert the user into the employees table
                //     dbR.execute('INSERT INTO employees (id, store, internal_number) VALUES (?, ?, ?)',
                //         [newEmployee.id, newEmployee.store, newEmployee.internal_number], function (err) {
                //             if (err) {
                //                 console.error('DB operation failed:', err.message);
                //             }
                //             res.status(201).json({ message: 'Employee successfully added' });
                //         });
                // });
            }
        );
    });
});

// Edit employee
router.put('/ttuser/edit/employee', verifyRequestOrigin, async (req, res) => {
    try {
        const updated = req.body;

        // Must provide at least one identifier to find the employee
        const identifiers = ['id', 'email', 'phone_number'];
        const providedIdentifiers = identifiers.filter(id => updated[id] !== undefined);

        if (providedIdentifiers.length === 0) {
            return res.status(400).json({ error: 'Must provide at least one identifier: id, phone_number or email' });
        }

        // Fields that belong to clients and employees tables
        const clientCols = ['name', 'email', 'phone_number', 'nif', 'nic', 'gender', 'dob'];
        const employeeCols = ['store', 'internal_number'];

        // Prepare SET clauses and values
        const setClauses = [];
        const values = [];

        const identifierSet = new Set(identifiers);
        for (const key in updated) {
            if (identifierSet.has(key)) continue;
            if (clientCols.includes(key)) {
                setClauses.push(`c.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            } else if (employeeCols.includes(key)) {
                setClauses.push(`e.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided' });
        }

        // Prepare WHERE clauses for identifiers
        // For email, prefix with 'c', for others with 'e'
        const whereClauses = [];
        for (const id of providedIdentifiers) {
            const prefix = id === 'email' ? 'c' : 'e';
            whereClauses.push(`${prefix}.${id} = ?`);
            values.push(updated[id]);
        }

        const query = `
        UPDATE clients c
        JOIN employees e ON c.id = e.id
        SET ${setClauses.join(', ')}
        WHERE ${whereClauses.join(' OR ')}
        `;

        // Execute on primary DB
        await new Promise((resolve, reject) => {
            db.execute(query, values, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Execute on replica DB
        // await new Promise((resolve, reject) => {
        //     dbR.execute(query, values, (err) => {
        //         if (err) return reject(err);
        //         resolve();
        //     });
        // });

        res.json({ message: 'Employee successfully updated' });

    } catch (error) {
        console.error('DB operation failed:', error.message);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Get all stores
router.get('/ttuser/store', verifyRequestOrigin, (req, res) => {
    const { id, nipc, email, phone_number } = req.query;

    let sql = `
        SELECT * FROM entities e
        INNER JOIN clients c ON c.id = e.id
        LEFT JOIN entityHours eh ON eh.entity = e.id
        WHERE e.entity_type = "store"
    `;

    const conditions = [];
    const values = [];

    if (id) {
        conditions.push('e.id = ?');
        values.push(id);
    }

    if (nipc) {
        conditions.push('e.nipc = ?');
        values.push(nipc);
    }

    if (email) {
        conditions.push('c.email = ?');
        values.push(email);
    }

    if (phone_number) {
        conditions.push('c.phone_number = ?');
        values.push(phone_number);
    }

    if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
    }

    const handleResult = (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!rows || rows.length === 0) {
            return res.status(204).send(); // No Content
        }

        const result = rows.reduce((acc, row) => {
            const existingStore = acc.find(store => store.name === row.name);

            if (existingStore) {
                if (row.day && row.hours) {
                    existingStore.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                }
            } else {
                acc.push({
                    id: row.id,
                    nipc: row.nipc,
                    name: row.name,
                    email: row.email,
                    phone_number: row.phone_number,
                    address: row.address,
                    city: row.city,
                    country: row.country,
                    opening_hours: row.day && row.hours ? [{
                        day: row.day,
                        hours: row.hours
                    }] : []
                });
            }

            return acc;
        }, []);

        res.json(result.length === 1 ? result[0] : result);
    };

    // Query
    db.query(sql, values, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            //dbR.query(sql, values, handleResult);
        } else {
            handleResult(null, rows);
        }
    });
});

// Add new store
router.post('/ttuser/add/store', verifyRequestOrigin, (req, res) => {
    const newStore = req.body;

    // Check if new store exists in the clients table
    db.query('SELECT * FROM clients WHERE id = ?', [newStore.id], (err, row) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        // Insert the store into the entities table including address, city, country
        db.execute(
            'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "store", ?, ?, ?)',
            [newStore.id, newStore.nipc, newStore.address || null, newStore.city || null, newStore.country || null],
            function (err) {
                if (err) {
                    console.error('DB operation failed:', err.message);
                }

                // If store hours are provided, insert into entityHours table
                if (newStore.opening_hours) {
                    const hoursEntries = Object.entries(newStore.opening_hours);

                    hoursEntries.forEach(([day, hours]) => {
                        db.execute(
                            'INSERT INTO entityHours (entity, day, hours) VALUES (?, ?, ?)',
                            [newStore.id, day, hours],
                            (err) => {
                                if (err) {
                                    console.error(`Failed to insert hours for ${day}:`, err.message);
                                }
                            }
                        );
                    });
                }
                res.status(201).json({ message: 'Store successfully added', product: row });
                // Update replica
                // dbR.query('SELECT * FROM clients WHERE id = ?', [newStore.id], (err, row) => {
                //     if (err) {
                //         console.error('DB operation failed:', err.message);
                //     }

                //     dbR.execute(
                //         'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "store", ?, ?, ?)',
                //         [newStore.id, newStore.nipc, newStore.address || null, newStore.city || null, newStore.country || null],
                //         function (err) {
                //             if (err) {
                //                 console.error('DB operation failed:', err.message);
                //             }

                //             // If store hours are provided, insert into entityHours table
                //             if (newStore.opening_hours) {
                //                 const hoursEntries = Object.entries(newStore.opening_hours);

                //                 hoursEntries.forEach(([day, hours]) => {
                //                     dbR.execute(
                //                         'INSERT INTO entityHours (entity, day, hours) VALUES (?, ?, ?)',
                //                         [newStore.id, day, hours],
                //                         (err) => {
                //                             if (err) {
                //                                 console.error(`Failed to insert hours for ${day}:`, err.message);
                //                             }
                //                         }
                //                     );
                //                 });
                //             }
                //             res.status(201).json({ message: 'Store successfully added', product: row });
                //         }
                //     );
                // });

            }
        );
    });
});

// Edit store
router.put('/ttuser/edit/store', verifyRequestOrigin, async (req, res) => {
    try {
        const updated = req.body;

        // Must provide at least one identifier to find the store
        const identifiers = ['id', 'nipc', 'email', 'phone_number'];
        const providedIdentifiers = identifiers.filter(id => updated[id] !== undefined);

        if (providedIdentifiers.length === 0) {
            return res.status(400).json({ error: 'Must provide at least one identifier: id, nipc, phone_number, or email' });
        }

        // Fields that belong to clients and entities tables
        const clientCols = ['name', 'email', 'phone_number', 'nif', 'nic', 'gender', 'dob'];
        const storeCols = ['nipc', 'address', 'city', 'country'];

        // Separate opening_hours from other storeCols
        const { opening_hours, ...otherStoreFields } = updated;

        // Prepare SET clauses and values
        const setClauses = [];
        const values = [];

        for (const key in updated) {
            if (clientCols.includes(key)) {
                setClauses.push(`c.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            } else if (storeCols.includes(key)) {
                setClauses.push(`e.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            }
        }

        if (setClauses.length === 0 && !opening_hours) {
            return res.status(400).json({ error: 'No updatable fields provided' });
        }

        // Prepare WHERE clauses for identifiers
        const whereClauses = [];
        for (const id of providedIdentifiers) {
            const prefix = id === 'email' ? 'c' : 'e';
            whereClauses.push(`${prefix}.${id} = ?`);
            values.push(updated[id]);
        }

        const updateQuery = `
        UPDATE clients c
        JOIN entities e ON c.id = e.id
        SET ${setClauses.join(', ')}
        WHERE ${whereClauses.join(' OR ')}
        `;

        // Execute update on primary DB
        await new Promise((resolve, reject) => {
            db.execute(updateQuery, values, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Execute update on replica DB
        // await new Promise((resolve, reject) => {
        //     dbR.execute(updateQuery, values, (err) => {
        //         if (err) return reject(err);
        //         resolve();
        //     });
        // });

        // If no opening_hours provided, finish here
        if (!opening_hours) {
            return res.json({ message: 'Store successfully updated' });
        }

        // Update entityHours table for the store hours

        let entityId = updated.id;

        if (!entityId) {
            // Fetch entity id by nipc, email, or phone_number
            const idQueryParts = [];
            const idValues = [];
            if (updated.nipc) {
                idQueryParts.push('e.nipc = ?');
                idValues.push(updated.nipc);
            }
            if (updated.email) {
                idQueryParts.push('c.email = ?');
                idValues.push(updated.email);
            }
            if (updated.phone_number) {
                idQueryParts.push('c.phone_number = ?');
                idValues.push(updated.phone_number);
            }

            const fetchIdQuery = `
                SELECT e.id FROM entities e
                JOIN clients c ON c.id = e.id
                WHERE ${idQueryParts.join(' OR ')}
                LIMIT 1
            `;

            const [rows] = await db.promise().query(fetchIdQuery, idValues);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Store not found to update hours' });
            }
            entityId = rows[0].id;
        }

        // Delete existing hours for this entity
        const deleteHoursQuery = `DELETE FROM entityHours WHERE entity = ?`;
        await db.promise().execute(deleteHoursQuery, [entityId]);
        //await dbR.promise().execute(deleteHoursQuery, [entityId]);

        // Insert new hours
        // Format: (entity, day, hours)
        const insertValues = [];
        const placeholders = [];

        for (const entry of opening_hours) {
            const hours = entry.hours;
            const storedHours = (hours === 'Closed') ? "Closed" : hours;
            placeholders.push('(?, ?, ?)');
            insertValues.push(entityId, entry.day, storedHours);
        }

        if (insertValues.length > 0) {
            const insertQuery = `INSERT INTO entityHours (entity, day, hours) VALUES ${placeholders.join(', ')}`;
            await db.promise().execute(insertQuery, insertValues);
           // await dbR.promise().execute(insertQuery, insertValues);
        }

        res.json({ message: 'Store and hours successfully updated' });

    } catch (error) {
        console.error('DB operation failed:', error.message);
        res.status(500).json({ error: 'Failed to update store' });
    }
});

// Get all charities
router.get('/ttuser/charity', verifyRequestOrigin, (req, res) => {
    const { id, nipc, email, phone_number } = req.query;

    let sql = `
        SELECT * FROM entities e 
        INNER JOIN clients c ON c.id = e.id
        LEFT JOIN entityHours eh ON eh.entity = e.id
        WHERE e.entity_type = "charity"
    `;

    const conditions = [];
    const values = [];

    if (id) {
        conditions.push('e.id = ?');
        values.push(id);
    }

    if (nipc) {
        conditions.push('e.nipc = ?');
        values.push(nipc);
    }

    if (email) {
        conditions.push('c.email = ?');
        values.push(email);
    }

    if (phone_number) {
        conditions.push('c.phone_number = ?');
        values.push(phone_number);
    }

    if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
    }

    const handleResult = (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!rows || rows.length === 0) {
            return res.status(204).send(); // No Content
        }

        const result = rows.reduce((acc, row) => {
            const existingCharity = acc.find(charity => charity.name === row.name);

            if (existingCharity) {
                if (row.day && row.hours) {
                    existingCharity.opening_hours.push({
                        day: row.day,
                        hours: row.hours
                    });
                }
            } else {
                acc.push({
                    id: row.id,
                    nipc: row.nipc,
                    name: row.name,
                    email: row.email,
                    phone_number: row.phone_number,
                    address: row.address,
                    city: row.city,
                    country: row.country,
                    opening_hours: row.day && row.hours ? [{
                        day: row.day,
                        hours: row.hours
                    }] : []
                });
            }

            return acc;
        }, []);

        res.json(result.length === 1 ? result[0] : result);
    };

    // Query
    db.query(sql, values, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            //dbR.query(sql, values, handleResult);
        } else {
            handleResult(null, rows);
        }
    });
});

// Add new charity
router.post('/ttuser/add/charity', verifyRequestOrigin, (req, res) => {
    const newCharity = req.body;

    // Check if charity exists in clients table
    db.query('SELECT * FROM clients WHERE id = ?', [newCharity.id], (err, row) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        // Insert charity into entities table including address, city, country
        db.execute(
            'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "charity", ?, ?, ?)',
            [newCharity.id, newCharity.nipc, newCharity.address || null, newCharity.city || null, newCharity.country || null],
            function (err) {
                if (err) {
                    console.error('DB operation failed:', err.message);
                }
                res.status(201).json({ message: 'Charity successfully added', charity: row });
                // Update replica
                // dbR.query('SELECT * FROM clients WHERE id = ?', [newCharity.id], (err, row) => {
                //     if (err) {
                //         console.error('DB operation failed:', err.message);
                //     }

                //     dbR.execute(
                //         'INSERT INTO entities (id, nipc, entity_type, address, city, country) VALUES (?, ?, "charity", ?, ?, ?)',
                //         [newCharity.id, newCharity.nipc, newCharity.address || null, newCharity.city || null, newCharity.country || null],
                //         function (err) {
                //             if (err) {
                //                 console.error('DB operation failed:', err.message);
                //             }

                //             res.status(201).json({ message: 'Charity successfully added', charity: row });
                //         }
                //     );
                // });
            }
        );
    });
});

// Edit charity
router.put('/ttuser/edit/charity', verifyRequestOrigin, async (req, res) => {
    try {
        const updated = req.body;

        // Must provide at least one identifier to find the charity
        const identifiers = ['id', 'nipc', 'email', 'phone_number'];
        const providedIdentifiers = identifiers.filter(id => updated[id] !== undefined);

        if (providedIdentifiers.length === 0) {
            return res.status(400).json({ error: 'Must provide at least one identifier: id, nipc, phone_number, or email' });
        }

        // Fields that belong to clients and entities tables
        const clientCols = ['name', 'email', 'phone_number', 'nif', 'nic', 'gender', 'dob'];
        const storeCols = ['nipc', 'address', 'city', 'country'];

        // Prepare SET clauses and values
        const setClauses = [];
        const values = [];

        for (const key in updated) {
            if (clientCols.includes(key)) {
                setClauses.push(`c.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            } else if (storeCols.includes(key)) {
                setClauses.push(`e.${key} = ?`);
                values.push(updated[key] === undefined ? null : updated[key]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided' });
        }

        // Prepare WHERE clauses for identifiers
        // For email, prefix with 'c', for others with 'e'
        const whereClauses = [];
        for (const id of providedIdentifiers) {
            const prefix = id === 'email' ? 'c' : 'e';
            whereClauses.push(`${prefix}.${id} = ?`);
            values.push(updated[id]);
        }

        const query = `
        UPDATE clients c
        JOIN entities e ON c.id = e.id
        SET ${setClauses.join(', ')}
        WHERE ${whereClauses.join(' OR ')}
        `;

        // Execute on primary DB
        await new Promise((resolve, reject) => {
            db.execute(query, values, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Execute on replica DB
        // await new Promise((resolve, reject) => {
        //     dbR.execute(query, values, (err) => {
        //         if (err) return reject(err);
        //         resolve();
        //     });
        // });

        res.json({ message: 'Charity successfully updated' });

    } catch (error) {
        console.error('DB operation failed:', error.message);
        res.status(500).json({ error: 'Failed to update charity' });
    }
});

// Add new charity project
router.post('/ttuser/add/charityProject', verifyRequestOrigin, (req, res) => {
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
            // dbR.query(query, values, (err, result) => {
            //     if (err) console.error('DB operation failed:', err.message);
            //     res.json({ success: true, insertedId: result.insertId });
            // });
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
            console.error('DB operation failed:', err.message);
        }
        return res.json({ success: true, deleted: result.affectedRows });
        // dbR.query(query, ids, (err, result) => {
        //     if (err) console.error('DB operation failed:', err.message);

        //     return res.json({ success: true, deleted: result.affectedRows });
        // });
    });
});

// Get charity projects
router.get('/ttuser/charityProjects', verifyRequestOrigin, (req, res) => {
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
            // dbR.query(query, [charity_id], (err, rows) => {
            //     if (err) {
            //         res.setHeader('Content-Type', 'application/json');
            //         return res.status(500).json({ error: err.message });
            //     }
            //     res.setHeader('Content-Type', 'application/json');
            //     res.json(rows || []);
            // });
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
            // dbR.query(query, (err, rows) => {
            //     if (err) return res.status(500).send({ error: err.message });
            //     return res.status(200).json(rows || []);
            // });
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
        if (err) console.error('DB operation failed:', err.message);
        res.status(201).send('Product alert successfully added');
        // Update replica
        // dbR.execute(query, values, function (err) {
        //     if (err) console.error('DB operation failed:', err.message);

        //     res.status(201).send('Product alert successfully added');
        // });
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
            // dbR.query(query, [req.params.email], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     return res.status(200).json(rows || []);
            // });
        } else {
            return res.status(200).json(rows || []);
        }
    });
});

// Remove product alert
router.delete('/ttuser/remove/interest/:id', verifyRequestOrigin, (req, res) => {
    const query = `DELETE FROM interests WHERE id = ?`;

    db.execute(query, [req.params.id], function (err) {
        if (err) console.error('DB operation failed:', err.message);
        res.status(200).send('Product alert successfully removed');
        // Update replica
        // dbR.execute(query, [req.params.id], function (err) {
        //     if (err) console.error('DB operation failed:', err.message);

        //     res.status(200).send('Product alert successfully removed');
        // });
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
            // new Promise((resolve, reject) => {
            //     dbR.execute(interestQuery, [interestId], (err, result) => {
            //         if (err) reject(err);
            //         else resolve(result);
            //     });
            // })
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
    const query = `UPDATE interests SET unread_notifications = 0 WHERE id = ?;`;

    db.execute(query, [req.params.id], function (err) {
        if (err) console.error('DB operation failed:', err.message);
        res.send('Notifications cleared successfully');
        // Update replica
        // dbR.execute(query, [req.params.id], function (err) {
        //     if (err) console.error('DB operation failed:', err.message);

        //     res.send('Notifications cleared successfully');
        // });
    });
});

// Add product to wishlist
router.post('/ttuser/wishlist', verifyRequestOrigin, (req, res) => {
    const query = `INSERT IGNORE INTO wishlist(wishlisted_product, interested_user) VALUES (?, ?)`;

    db.execute(query, [req.body.wishlisted_product, req.body.interested_user], function (err, result) {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.status(201).send('Product successfully added to wishlist');
        // Update replica
        // dbR.execute(query, [req.body.wishlisted_product, req.body.interested_user], function (err) {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }
        //     res.status(201).send('Product successfully added to wishlist');
        // });
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
            // dbR.query(query, [req.params.email], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     return res.status(200).json(rows || []);
            // });
        } else {
            return res.status(200).json(rows || []);
        }
    });
});

// Remove product from wishlist
router.delete('/ttuser/remove/wishlist/:id', verifyRequestOrigin, (req, res) => {
    const query = `DELETE FROM wishlist WHERE id = ?`;

    db.execute(query, [req.params.id], function (err) {
        if (err) console.error('DB operation failed:', err.message);
        return res.status(200).send("Product successfully removed from the user's wishlist");
        // Update replica
        // dbR.execute(query, [req.params.id], function (err) {
        //     if (err) console.error('DB operation failed:', err.message);

        //     return res.status(200).send("Product successfully removed from the user's wishlist");
        // });
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
            // dbR.query(query, [parseInt(req.params.product_id)], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     return res.status(200).json(rows[0] || { count: 0 });
            // });
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
            // dbR.query(query, [], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     const result = groupSales(rows);
            //     res.json(result);
            // });
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
            // dbR.query(query, [], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     const result = groupSales(rows);
            //     res.json(result);
            // });
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

    if (!transaction_value ||
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
            console.error('DB operation failed:', err.message);
        }

        const transactionId = result.insertId;
        if (order_number == "APPLE-PAY-") {
            order_number += transactionId;
        }

        db.query(saleQuery,
            [transactionId, is_online, order_number, employee, store, shipping_address,
                shipping_postal_code, shipping_city, shipping_country, network || null], (err) => {
                    if (err) {
                        console.error('DB operation failed:', err.message);
                    }

                    // Insert sold products
                    const soldProductsData = products.map(productId => [productId, transactionId]);

                    db.query(soldProductsQuery, [soldProductsData], (err) => {
                        if (err) {
                            console.error('DB operation failed:', err.message);
                        }

                        // Update availability of sold products
                        products.forEach(productId => {
                            db.query(productsQuery, [productId], (err) => {
                                if (err) console.error('Product update error:', err.message);
                            });
                        });
                        res.status(201).send({ message: 'Transaction, sale, and products added successfully', transactionId });
                        // Update replica
                        // dbR.query(transactionQuery, [client, transaction_value], (err, result) => {
                        //     if (err) {
                        //         console.error('DB operation failed:', err.message);
                        //     }

                        //     const transactionId = result.insertId;

                        //     // Insert into sales
                        //     dbR.query(saleQuery,
                        //         [transactionId, is_online, order_number, employee, store, shipping_address,
                        //             shipping_postal_code, shipping_city, shipping_country, network || null], (err) => {
                        //                 if (err) {
                        //                     console.error('DB operation failed:', err.message);
                        //                 }

                        //                 // Insert sold products
                        //                 const soldProductsData = products.map(productId => [productId, transactionId]);

                        //                 dbR.query(soldProductsQuery, [soldProductsData], (err) => {
                        //                     if (err) {
                        //                         console.error('DB operation failed:', err.message);
                        //                     }

                        //                     // Update availability of sold products
                        //                     products.forEach(productId => {
                        //                         dbR.query(productsQuery, [productId], (err) => {
                        //                             if (err) console.error('Product update error:', err.message);
                        //                         });
                        //                     });
                        //                 });

                        //                 res.status(201).send({ message: 'Transaction, sale, and products added successfully', transactionId });
                        //             });
                        // });
                    });
                });
    });
});

// Update sale transaction status
router.post('/tttransaction/sales/updateStatus/:saleId', verifyRequestOrigin, (req, res) => {
    const { saleId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus || typeof newStatus !== 'string') {
        return res.status(400).send({ error: 'Missing or invalid newStatus in request body' });
    }

    const updateQuery = `
        UPDATE sales
        SET sale_status = ?
        WHERE transaction_id = ?
    `;

    // Update sale status
    db.query(updateQuery, [newStatus, saleId], (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        // Update replica
        // dbR.query(updateQuery, [newStatus, saleId], (err) => {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     // If order is cancelled, relist the products
        //     if (newStatus.toLowerCase() === 'cancelled') {
        //         const getProductsQuery = `
        //             SELECT product_id FROM soldProducts WHERE sale_id = ?
        //         `;

        //         db.query(getProductsQuery, [saleId], (err, rows) => {
        //             if (err) {
        //                 console.error('DB operation failed:', err.message);
        //             }

        //             const productIds = rows.map(r => r.product_id);

        //             if (productIds.length === 0) {
        //                 // No products to update, just respond success
        //                 return res.status(200).send({ message: 'Sale status updated, no products to relist.' });
        //             } else {
        //                 const relistQuery = `UPDATE products SET availability = 1 WHERE id IN (${productIds.map(() => '?').join(',')})`;

        //                 db.query(relistQuery, productIds, (err) => {
        //                     if (err) console.error('DB operation failed:', err.message);
        //                     // Update replica
        //                     dbR.query(relistQuery, productIds, (err) => {
        //                         if (err) console.error('DB operation failed:', err.message);
        //                     });
        //                 });
        //                 res.status(200).send({ message: 'Sale status updated successfully' });
        //             }
        //         });
        //     } else {
        //         const getProductsQuery = `
        //             SELECT product_id FROM soldProducts WHERE sale_id = ?
        //         `;

        //         db.query(getProductsQuery, [saleId], (err, rows) => {
        //             if (err) {
        //                 console.error('DB operation failed:', err.message);
        //             }

        //             const productIds = rows.map(r => r.product_id);

        //             if (productIds.length === 0) {
        //                 // No products to update, just respond success
        //                 return res.status(200).send({ message: 'Sale status updated, no products to relist.' });
        //             } else {
        //                 const relistQuery = `UPDATE products SET availability = 0 WHERE id IN (${productIds.map(() => '?').join(',')})`;

        //                 db.query(relistQuery, productIds, (err) => {
        //                     if (err) console.error('DB operation failed:', err.message);
        //                     // Update replica
        //                     dbR.query(relistQuery, productIds, (err) => {
        //                         if (err) console.error('DB operation failed:', err.message);
        //                     });
        //                 });
        //                 res.status(200).send({ message: 'Sale status updated successfully' });
        //             }
        //         });
        //     }
        // });
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
            // dbR.query(query, productIds, (err, rows) => {
            //     if (err) {
            //         return res.status(500).json({ error: err.message });
            //     }

            //     const unavailable = rows.map(row => row.id);
            //     res.json({
            //         allAvailable: unavailable.length === 0,
            //         unavailable
            //     });
            // });
        }

        const unavailable = rows.map(row => row.id);
        res.json({
            allAvailable: unavailable.length === 0,
            unavailable
        });
    });
});

// Get purchase transactions
router.get('/tttransaction/purchases/', verifyRequestOrigin, (req, res) => {
    const query = `
        SELECT 
            t.id,
            p.purchasing_store,
            p.non_registered_client AS client,
            t.transaction_value,
            t.date_inserted,
            p.item_purchased,
            prod.name AS item_name
        FROM transactions t
        INNER JOIN purchases p ON p.transaction_id = t.id
        INNER JOIN products prod ON prod.id = p.item_purchased
        ORDER BY t.date_inserted DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            // Fallback to replica DB
            // dbR.query(query, (errR, rowsR) => {
            //     if (errR) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     return res.json(rowsR);
            // });
        } else {
            return res.json(rows);
        }
    });
});

// Add purchase transaction
router.post('/tttransaction/purchases/add', verifyRequestOrigin, (req, res) => {
    const { purchasing_store, transaction_value, non_registered_client, item_purchased } = req.body;

    // Validate input
    if (!transaction_value || transaction_value <= 0 || !non_registered_client || !purchasing_store || !item_purchased) {
        return res.status(400).json({ error: 'All required fields (store, value, client, item) must be provided.' });
    }

    const insertTransactionQuery = `
        INSERT INTO transactions (transaction_value)
        VALUES (?)
    `;
    const transactionValues = [transaction_value];

    db.query(insertTransactionQuery, transactionValues, (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        const transactionId = result.insertId;

        const insertPurchaseQuery = `
            INSERT INTO purchases (transaction_id, non_registered_client, purchasing_store, item_purchased)
            VALUES (?, ?, ?, ?)
        `;
        const purchaseValues = [transactionId, non_registered_client, purchasing_store, item_purchased];

        db.query(insertPurchaseQuery, purchaseValues, (err2) => {
            if (err2) {
                console.error('DB operation failed:', err.message);
            }

            // Update Replica
            // dbR.query(insertTransactionQuery, transactionValues, (errR1, resultR) => {
            //     if (errR1) console.error('DB operation failed:', err.message);
            //     else {
            //         const transactionIdR = resultR.insertId;
            //         dbR.query(insertPurchaseQuery, [transactionIdR, non_registered_client, purchasing_store, item_purchased], (errR2) => {
            //             if (errR2) console.error('DB operation failed:', err.message);
            //         });
            //     }
            // });

            return res.status(201).json({ message: 'Purchase transaction added successfully', id: transactionId });
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
            // dbR.query(query, [], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     res.json(rows);
            // });
        } else {
            res.json(rows);
        }
    });
});

// Add repair transactions
router.post('/tttransaction/repairs/add', verifyRequestOrigin, (req, res) => {
    const {
        client,
        non_registered_client,
        transaction_value,
        product_id,
        store,
        employee,
        repair_status = 'In repairs',
        order_number,
        network
    } = req.body;

    // Require at least one client type
    if ((!client && !non_registered_client) ||
        !transaction_value || transaction_value <= 0 ||
        !product_id || !store || !employee) {
        return res.status(400).json({ error: 'Required fields missing or invalid.' });
    }

    // Insert into transactions
    const insertTransactionQuery = `
    INSERT INTO transactions (client, transaction_value)
    VALUES (?, ?)
`;
    const transactionValues = [client || null, transaction_value];

    db.query(insertTransactionQuery, transactionValues, (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }

        const transactionId = result.insertId;

        const insertRepairQuery = `
            INSERT INTO repairs (
                transaction_id, product_id, store, employee,
                ${non_registered_client ? 'non_registered_client,' : ''}
                repair_status, network
            ) VALUES (
                ?, ?, ?, ?,
                ${non_registered_client ? '?,' : ''}
                ?, ?
            )
        `;

        const repairValues = non_registered_client
            ? [transactionId, product_id, store, employee, non_registered_client, repair_status, network]
            : [transactionId, product_id, store, employee, repair_status, network];

        db.query(insertRepairQuery, repairValues, (err2) => {
            if (err2) {
                console.error('DB operation failed:', err2.message);
            }
            return res.status(201).json({
                 message: 'Repair transaction added successfully',
                 id: transactionId
            });
            // Now update replica DB
            // dbR.query(insertTransactionQuery, transactionValues, (errR, resultR) => {
            //     if (errR) {
            //         console.error('DB operation failed:', errR.message);
            //     } else {
            //         const replicaTransactionId = resultR.insertId;

            //         dbR.query(insertRepairQuery, repairValues.map(v => v === transactionId ? replicaTransactionId : v), (errR2) => {
            //             if (errR2) {
            //                 console.error('DB operation failed:', errR2.message);
            //             }
            //         });
            //     }

            //     return res.status(201).json({
            //         message: 'Repair transaction added successfully',
            //         id: transactionId
            //     });
            // });
        });
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
            // dbR.query(query, [req.params.email], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     res.json(rows);
            // });
        } else {
            res.json(rows);
        }
    });
});

// Update repair transaction status
router.post('/tttransaction/repairs/updateStatus/:repairId', verifyRequestOrigin, (req, res) => {
    const { repairId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus || typeof newStatus !== 'string') {
        return res.status(400).send({ error: 'Missing or invalid newStatus in request body' });
    }

    const updateQuery = `
        UPDATE repairs
        SET repair_status = ?
        WHERE transaction_id = ?
    `;

    // Update repair status
    db.query(updateQuery, [newStatus, repairId], (err, result) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.status(200).send({ message: 'Repair status updated successfully' });
        // Update replica
        // dbR.query(updateQuery, [newStatus, repairId], (err) => {
        //     if (err) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     res.status(200).send({ message: 'Repair status updated successfully' });

        // });
    });
});

// Get shipping costs
router.get('/tttransaction/shipping', verifyRequestOrigin, (req, res) => {
    db.query('SELECT current_shipping_cost FROM shipping WHERE id=1', [], (err, rows) => {
        if (err) {
            // Fallback to replica DB
            // dbR.query('SELECT current_shipping_cost FROM shipping WHERE id=1', [], (err, rows) => {
            //     if (err) {
            //         return res.status(500).send({ error: err.message });
            //     }
            //     res.json(rows[0]);
            // });
        } else {
            res.json(rows[0]);
        }
    });
});

// Update shipping cost
router.post('/tttransaction/shipping/update', verifyRequestOrigin, (req, res) => {
    let { newCost } = req.body;

    newCost = parseFloat(req.body.newCost);

    if (isNaN(newCost) || newCost < 0) {
        return res.status(400).json({ error: 'Invalid shipping cost. It must be a non-negative number.' });
    }

    const updateQuery = `UPDATE shipping SET current_shipping_cost = ? WHERE id = 1`;

    // Update primary DB
    db.query(updateQuery, [newCost], (err) => {
        if (err) {
            console.error('DB operation failed:', err.message);
        }
        res.status(200).json({ message: 'Shipping cost updated successfully', newCost });
        // Update replica
        // dbR.query(updateQuery, [newCost], (errR) => {
        //     if (errR) {
        //         console.error('DB operation failed:', err.message);
        //     }

        //     res.status(200).json({ message: 'Shipping cost updated successfully', newCost });
        // });
    });
});

// Reports
router.get('/report', verifyRequestOrigin, (req, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');

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


    db.query('SELECT st.id, st.name, COUNT(s.transaction_id) AS total_sales FROM clients st JOIN entities e ON st.id = e.id ' +
        'LEFT JOIN sales s ON s.store = e.nipc GROUP BY st.id, st.name ORDER BY st.name;', [], (err, rows) => {

            drawSectionHeader('Sales by Store');

            rows.forEach(row => {
                drawMetric(row.name, `${row.total_sales} sales`);
            });


        });


    db.query('SELECT s.id, s.name, COUNT(r.transaction_id) AS total_repairs FROM clients s JOIN entities e ON s.id = e.id ' +
        'LEFT JOIN repairs r ON r.store = e.nipc GROUP BY s.id, s.name ORDER BY s.name;', [], async (err, rows) => {

            drawSectionHeader('Repairs by Store');

            rows.forEach(row => {
                drawMetric(row.name, `${row.total_repairs} repairs`);
            });

            // Finalize the PDF and end the stream
            doc.end();

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

// Send verification email
router.get("/auth-verification", verifyRequestOrigin, async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res.status(400).send({ error: "Missing user id" });
        }
        const auth0Domain = "dev-1qdq127lj6aekksz.us.auth0.com";
        const clientID = "iZ7i3x872x2Lwwg9I3jwg50JgePjaB3a";

        // Get Management API token
        const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                client_id: clientID,
                client_secret: "gQiNS0xg6HQBdJs6fGTnX8yYAcrM6HZhL08jl0ORj9zIr62kNisBtDrFFaiEqxms",
                audience: `https://${auth0Domain}/api/v2/`,
                grant_type: "client_credentials"
            })
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            console.error('Token error:', tokenData);
            return res.status(500).send({ error: 'Failed to get Auth0 token' });
        }

        // Send verification email
        const verifyResponse = await fetch(`https://${auth0Domain}/api/v2/jobs/verification-email`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${tokenData.access_token}`
            },
            body: JSON.stringify({ user_id: userId })
        });
        if (!verifyResponse.ok) {
            const errData = await verifyResponse.json();
            console.error('Verification email error:', errData);
            return res.status(500).send({ error: 'Failed to send verification email' });
        }

        res.status(200).send({ message: "Verification email sent." });
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).send({ error: "Failed to send verification email." });
    }
});

// Export the API routes
export { router };
