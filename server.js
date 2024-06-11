import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import sendMail from './utils/sendMail.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const topicsPath = path.resolve(__dirname, 'data', 'Topics.json');
const subscribersPath = path.resolve(__dirname, 'data', 'Subscriber.json');

app.use(bodyParser.json());

 
const loadData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

 
const saveData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');


app.post('/subscribe', (req, res) => {
    const { topicId, subscriberId } = req.body;
    const topics = loadData(topicsPath);
    const subscribers = loadData(subscribersPath);

    const subscriberExists = subscribers.some(sub => sub.subscriberId === subscriberId);

    if (!subscriberExists) {
        return res.status(400).send({ message: `Subscriber ID ${subscriberId} does not exist` });
    }

    if (!topics[topicId]) {
        topics[topicId] = [];
    }

    if (!topics[topicId].includes(subscriberId)) {
        topics[topicId].push(subscriberId);
        saveData(topicsPath, topics);
        return res.status(200).send({ message: `Subscriber ${subscriberId} subscribed to topic ${topicId}` });
    } else {
        return res.status(200).send({ message: `Subscriber ${subscriberId} is already subscribed to topic ${topicId}` });
    }
});

app.post('/unsubscribe', (req, res) => {
    const { topicId, subscriberId } = req.body;
    const topics = loadData(topicsPath);

    if (!topics[topicId] || !topics[topicId].includes(subscriberId)) {
        return res.status(400).send({ message: `Subscriber ${subscriberId} is not subscribed to topic ${topicId}` });
    }

    topics[topicId] = topics[topicId].filter(sub => sub !== subscriberId);
    saveData(topicsPath, topics);

    res.status(200).send({ message: `Subscriber ${subscriberId} unsubscribed from topic ${topicId}` });
});

app.post('/notify', async (req, res) => {
    const { topicId } = req.body;
    const topics = loadData(topicsPath);
    const subscribers = loadData(subscribersPath);
    const subscriberIds = topics[topicId] || [];

    if (subscriberIds.length === 0) {
        return res.status(200).send({ message: `No subscribers for topic ${topicId}` });
    }

    const subscriberEmails = subscriberIds.map(subscriberId => {
        const subscriber = subscribers.find(sub => sub.subscriberId === subscriberId);
        return subscriber ? subscriber.email : null;
    }).filter(email => email);

    if (subscriberEmails.length > 0) {
        try {
            const info = await sendMail(subscriberEmails, topicId);
            res.status(200).send({ message: `Notified subscribers of topic ${topicId}`, subscribers: subscriberEmails });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Failed to send notifications' });
        }
    } else {
        res.status(200).send({ message: `No valid subscriber emails for topic ${topicId}` });
    }
});


app.post('/addSubscriber', (req, res) => {
    const { subscriberId, name, email } = req.body;
    const subscribers = loadData(subscribersPath);
 
    const existingSubscriber = subscribers.find(sub => sub.subscriberId === subscriberId);
    if (existingSubscriber) {
        return res.status(400).json({ error: `Subscriber with ID ${subscriberId} already exists` });
    }
 
    subscribers.push({ subscriberId, name, email });
    saveData(subscribersPath, subscribers);

    return res.status(200).json({ message: `Subscriber ${subscriberId} added successfully` });
});

 
app.post('/deleteSubscriber', (req, res) => {
    const { subscriberId } = req.body;
    let subscribers = loadData(subscribersPath);
 
    const subscriberIndex = subscribers.findIndex(sub => sub.subscriberId === subscriberId);
    if (subscriberIndex === -1) {
        return res.status(400).json({ error: `Subscriber with ID ${subscriberId} does not exist` });
    }
 
    subscribers.splice(subscriberIndex, 1);
    saveData(subscribersPath, subscribers);

    return res.status(200).json({ message: `Subscriber ${subscriberId} deleted successfully` });
});


app.listen(port, () => {
    console.log(`Publisher Subscriber system running at http://localhost:${port}`);
});
