"use strict";

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './database/database.db';
const SQL_INIT_FILE = path.join(__dirname, '../database/ttDatabase.sql');

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
                ('Apple Watch Series 10', 112233445, 'Used', 1, 'Latest model Apple Watch', 'Smartwatches'),
                ('Samsung Galaxy S24', 112233445, 'New', 1, 'Latest flagship smartphone from Samsung', 'Smartphones'),
                ('Sony PlayStation 5', 112233445, 'New', 1, 'Next-gen gaming console with 4K capabilities', 'Gaming Consoles'),
                ('HP Envy Laptop', 112233445, 'Used', 1, 'High-performance laptop with Intel i7 processor', 'Laptops'),
                ('LG OLED 65-inch TV', 112233445, 'New', 1, '55-inch OLED 4K smart TV with HDR', 'Televisions'),
                ('Nintendo Switch', 112233445, 'Used', 1, 'Hybrid gaming console from Nintendo', 'Gaming Consoles'),
                ('Apple MacBook Pro', 112233445, 'New', 1, 'MacBook Pro with M1 chip for professionals', 'Laptops'),
                ('Bose Noise Cancelling Headphones', 112233445, 'New', 1, 'Premium noise-canceling headphones', 'Audio'),
                ('GoPro Hero 11', 112233445, 'Used', 1, 'Action camera for extreme sports', 'Cameras'),
                ('iPad Pro 12.9-inch', 112233445, 'New', 1, 'High-performance tablet with Apple Pencil support', 'Tablets'),
                ('Microsoft Surface Laptop', 112233445, 'Used', 1, 'Versatile laptop with touchscreen functionality', 'Laptops'),
                ('Razer Blade 15 Laptop', 112233445, 'New', 1, 'High-end gaming laptop with Nvidia RTX graphics', 'Laptops'),
                ('Canon EOS R5 Camera', 112233445, 'Used', 1, 'Mirrorless camera with 8K video recording', 'Cameras'),
                ('Fitbit Charge 5', 112233445, 'New', 1, 'Fitness tracker with health monitoring features', 'Wearables'),
                ('Xiaomi Mi 11', 112233445, 'Used', 1, 'Flagship smartphone from Xiaomi with high-end specs', 'Smartphones'),
                ('Apple AirPods Pro', 112233445, 'New', 1, 'True wireless noise-canceling earphones', 'Audio');
                
                INSERT INTO saleProducts (id, price) VALUES
                (1, 1500),
                (3, 350),
                (4, 1299),
                (5, 699),
                (6, 599),
                (7, 899),
                (8, 350),
                (9, 399),
                (10, 999),
                (11, 199),
                (12, 249),
                (13, 799),
                (14, 599),
                (15, 1399),
                (16, 599),
                (17, 119),
                (18, 899),
                (19, 149);
                
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

// Export the database connection and router
module.exports = { db, router };