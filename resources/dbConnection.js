"use strict";

import { Router } from 'express';
const router = Router();
import { createPool } from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ path: 'resources/dbCredentials.env' });

let connection = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
};
let connectionReplica = {
    host: process.env.DB_HOST_REPLICA,
    port: Number(process.env.DB_PORT_REPLICA),
    user: process.env.DB_USER_REPLICA,
    password: process.env.DB_PASS_REPLICA,
    database: process.env.DB_NAME_REPLICA,
    multipleStatements: true
};

let db;
//let dbR;

const connectToDb = async () => {
    try {
        db = createPool(connection);
        //dbR = createPool(connectionReplica);

        // Test connections by acquiring a connection from each pool
        await Promise.all([
            new Promise((resolve, reject) => {
                db.getConnection((err, connection) => {
                    if (err) return reject(err);
                    connection.release();
                    resolve();
                });
            }),
            // new Promise((resolve, reject) => {
            //     dbR.getConnection((err, connection) => {
            //         if (err) return reject(err);
            //         connection.release();
            //         resolve();
            //     });
            // }),
        ]);

        console.log('Connected to the TechThrift databases.');
        return true;
    } catch (err) {
        // Fallback to local connection configs
        connection = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tt_database',
            multipleStatements: true
        };
        connectionReplica = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tt_database_replica',
            multipleStatements: true
        };

        db = createPool(connection);
        dbR = createPool(connectionReplica);

        // Test local connections
        await Promise.all([
            new Promise((resolve, reject) => {
                db.getConnection((err, connection) => {
                    if (err) return reject(err);
                    connection.release();
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                dbR.getConnection((err, connection) => {
                    if (err) return reject(err);
                    connection.release();
                    resolve();
                });
            }),
        ]);

        console.log('Connected to the TechThrift databases (locally).');
        return true;
    }
};


// Flag for database connection
const dbReady = connectToDb();

// Export the database connection, router, and flag
//export { db, dbR, router, dbReady };
export { db, router, dbReady };
