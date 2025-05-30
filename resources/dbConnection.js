"use strict";

import { Router } from 'express';
const router = Router();
import { createConnection } from 'mysql2';
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
let dbR;

const connectToDb = async () => {
    try {
        db = createConnection(connection);
        dbR = createConnection(connectionReplica);
        await new Promise((resolve, reject) => {
            db.connect((err) => (err ? reject(err) : resolve()));
            dbR.connect((err) => (err ? reject(err) : resolve()));
        });
        console.log('Connected to the TechThrift databases.');
        return true;
    } catch (err) {
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
        db = createConnection(connection);
        dbR = createConnection(connectionReplica);
        await new Promise((resolve, reject) => {
            db.connect((err) => (err ? reject(err) : resolve()));
            dbR.connect((err) => (err ? reject(err) : resolve()));
        });
        console.log('Connected to the TechThrift databases (locally).');
        return true;
    }
};

// Flag for database connection
const dbReady = connectToDb();

// Export the database connection, router, and flag
export { db, dbR, router, dbReady };
