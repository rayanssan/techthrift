"use strict";

const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const connection = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tt_database',
    multipleStatements: true
};

let db = mysql.createConnection(connection);
db.connect((err) => {
    if (err) {
        console.log('Error: No TechThrift databases exist.');
        process.exit(1);
    } else {
        console.log('Connected to the TechThrift database.');
    }
});

// Export the database connection and router
module.exports = { db, router };
