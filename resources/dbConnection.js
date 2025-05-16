"use strict";

import { Router } from 'express';
const router = Router();
import { createConnection } from 'mysql2';
const connection = {
    host: '10.0.1.6',
    user: 'techthrift',
    password: '123',
    database: 'db',
    multipleStatements: true
};
const connectionReplica = {
    host: '10.0.1.6',
    user: 'techthrift',
    password: '123',
    database: 'db',
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
        return false;
    }
};

// Flag for database connection
const dbReady = connectToDb();

// Export the database connection, router, and flag
export { db, dbR, router, dbReady };
