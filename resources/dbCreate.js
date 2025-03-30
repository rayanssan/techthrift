"use strict";

const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

// Function to create database and its replica
const createDatabaseIfNotExists = async () => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    // Check if database exists, if not, create it
    const [ttdb_rows] = await connection.promise().query('SHOW DATABASES LIKE "tt_database"');
    if (ttdb_rows.length === 0) {
        console.log('Database does not exist, creating tt_database...');
        await connection.promise().query('CREATE DATABASE tt_database');

        // Connect to the database after it is created
        const db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tt_database',
            multipleStatements: true
        });

        // Initialize tables
        const initSql = fs.readFileSync(path.join(__dirname, '../database/ttDatabase.sql'), 'utf8');
        await db.promise().query(initSql);

        // Populate tables
        const insertSql = fs.readFileSync(path.join(__dirname, '../database/ttInitDatabase.sql'), 'utf8');
        await db.promise().query(insertSql);

        console.log('Database tt_database created and populated successfully.');
        db.end();

    } else {
        console.log('Database already exists.');
    }

    // Check if replica database exists, if not, create it
    const [ttdbr_rows] = await connection.promise().query('SHOW DATABASES LIKE "tt_database_replica"');
    if (ttdbr_rows.length === 0) {
        console.log('Replica database does not exist, creating tt_database_replica...');
        await connection.promise().query('CREATE DATABASE tt_database_replica');
        const [tables] = await connection.promise().query("SHOW TABLES FROM tt_database");

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            await connection.promise().query(`CREATE TABLE tt_database_replica.${tableName} LIKE tt_database.${tableName}`);
            await connection.promise().query(`INSERT INTO tt_database_replica.${tableName} SELECT * FROM tt_database.${tableName}`);
        }

        console.log('Replica database tt_database_replica created successfully.');

    } else {
        console.log('Replica database already exists.');
    }

    connection.end();
};

createDatabaseIfNotExists();