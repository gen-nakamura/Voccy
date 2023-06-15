import { addANewVocab, changeTheSettings, deleteTheFlashcard, doSomethingAsync, getSettings, openTheApp, openTheFlashcardsTest, openTheListOfFlashcards, startTest, takeTheFlachcardsTest, updateTheFlashcard } from './db';
const express = require('express');

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

    // server.post('/api/data', async (req, res) => {
    //     console.log('get a post request');
    //     const { questionInput, answerInput } = req.body;
    //     try {
    //         await startTest();
    //         res.json({ success: true });
    //     } catch (error) {
    //         console.log('error in db operation: ', error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    server.post('/api/open_app', async (req, res) => {
        console.log('/api/open_app');
        try {
            await openTheApp();
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/open_app: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/add_vocab', async (req, res) => {
        console.log('/api/add_vocab');
        const { question, answer } = req.body;
        try {
            await addANewVocab(question, answer);
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/add_vocab: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/change_settings', async (req, res) => {
        console.log('/api/change_settings');
        try {
            await changeTheSettings(req.body);
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/change_settings: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/open_test', async (req, res) => {
        console.log('/api/open_test');
        try {
            const data = await openTheFlashcardsTest();
            res.json({ success: true, data: data });
        } catch (error) {
            console.error('error in /api/open_test: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/take_test', async (req, res) => {
        console.log('/api/take_test');
        try {
            await takeTheFlachcardsTest(req.body);
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/take_test: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // server.post('/api/done_test', async (req, res) => {
    //     console.log('/api/done_test');
    //     const { questionInput, answerInput } = req.body;
    //     try {
    //         await addANewVocab(questionInput, answerInput);
    //         res.json({ success: true });
    //     } catch (error) {
    //         console.error('error in /api/open_app: ', error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    // server.post('/api/on_notify', async (req, res) => {
    //     console.log('/api/on_notify');
    //     const { questionInput, answerInput } = req.body;
    //     try {
    //         await addANewVocab(questionInput, answerInput);
    //         res.json({ success: true });
    //     } catch (error) {
    //         console.error('error in /api/open_app: ', error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // });

    server.post('/api/open_config', async (req, res) => {
        console.log('/api/open_config');
        const { limit } = req.body;
        try {
            const data = await openTheListOfFlashcards(limit);
            res.json({ success: true, data });
        } catch (error) {
            console.error('error in /api/open_config: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/delete_vocab', async (req, res) => {
        console.log('/api/delete_vocab');
        const { id } = req.body;
        try {
            await deleteTheFlashcard(id);
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/delete_vocab: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    server.post('/api/update_vocab', async (req, res) => {
        console.log('/api/update_vocab');
        try {
            await updateTheFlashcard(req.body);
            res.json({ success: true });
        } catch (error) {
            console.error('error in /api/update_vocab: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    return server;
};
