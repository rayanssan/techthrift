"use strict";

const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const connection = {
    host: '0.0.0.0',
    user: 'root',
    password: '',
    database: 'tt_database',
    multipleStatements: true
};

let db;

const connectToDb = async () => {
    try {
        db = mysql.createConnection(connection);
        await new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        console.log('Connected to the TechThrift database.');
        return true;
    } catch (err) {
        return false;
    }
};

// Flag for database connection
const dbReady = connectToDb();

// Export the database connection, router, and flag
module.exports = { db, router, dbReady };
