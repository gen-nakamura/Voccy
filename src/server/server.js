import { doSomethingAsync, startTest } from './db';
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

console.log('server.jsだよおおおおおおお\n\n\n');

export function createServer() {
    const server = express();

    server.use(express.json());
    // CORS設定  
    server.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    server.post('/api/data', async (req, res) => {
        console.log('get a post request');
        const { questionInput, answerInput } = req.body;
        try {
            await startTest();
            res.json({ success: true });
        } catch (error) {
            console.log('error in db operation: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // get quiz from 
    
    return server;
};
