import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import sendMail from './utils/sendMail.js';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const topicsPath = path.resolve(__dirname, 'data', 'Topics.json');
const subscribersPath = path.resolve(__dirname, 'data', 'Subscriber.json');
const messagePath = path.resolve(__dirname, 'data', 'Message.json');

app.use(bodyParser.json());


const loadData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));


const saveData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');


app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'index.ejs'));
});

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
            console.log("INFO")
            const info = await sendMail(subscriberEmails, topicId);
            console.log(info)
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


app.post('/addMessage', async (req, res) => {
    const { topicId, message } = req.body;
    const messages = loadData(messagePath);

    if (!messages[topicId]) {
        messages[topicId] = [];
    }

    messages[topicId].push(message);
    saveData(messagePath, messages);

    try {
        const notifyResponse = await axios.post('http://localhost:3000/notify', { topicId });
        console.log("Notify response:", notifyResponse.data);

        if (notifyResponse.status === 200) {
            res.status(200).send({ message: `Message added and subscribers notified`, notifyResult: notifyResponse.data });
        } else {
            res.status(500).send({ message: `Message added but failed to notify subscribers`, notifyResult: notifyResponse.data });
        }
    } catch (error) {
        console.error("Error notifying subscribers:", error);
        res.status(500).send({ message: `Message added but failed to notify subscribers`, error: error.message });
    }
});


app.post('/getAllMessages', (req, res) => { 
    const { subscriberId } = req.body;
    const topics = loadData(topicsPath);
    const messages = loadData(messagePath);
    const subscribers = loadData(subscribersPath);

    const subscriberExists = subscribers.some(sub => sub.subscriberId === subscriberId);
    if (!subscriberExists) {
        return res.status(400).send({ message: `Subscriber ID ${subscriberId} does not exist` });
    }
    const subscribedTopics = Object.keys(topics).filter(topicId => topics[topicId].includes(subscriberId));

    const subscriberMessages = subscribedTopics.reduce((acc, topicId) => {
        if (messages[topicId]) {
            acc[topicId] = messages[topicId];
        }
        return acc;
    }, {});

    res.status(200).send({ subscriberId, messages: subscriberMessages });
});


app.post('/getMessagesForTopic', (req, res) => {
    const { subscriberId, topicId } = req.body;
    const topics = loadData(topicsPath);
    const messages = loadData(messagePath);
    const subscribers = loadData(subscribersPath);

    const subscriberExists = subscribers.some(sub => sub.subscriberId === subscriberId);
    if (!subscriberExists) {
        return res.status(400).send({ message: `Subscriber ID ${subscriberId} does not exist` });
    }

    if (!topics[topicId] || !topics[topicId].includes(subscriberId)) {
        return res.status(400).send({ message: `Subscriber ID ${subscriberId} is not subscribed to topic ${topicId}` });
    }

    const topicMessages = messages[topicId] || [];

    res.status(200).send({ subscriberId, topicId, messages: topicMessages });
});


app.listen(port, () => {
    console.log(`Publisher Subscriber system running at http://localhost:${port}`);
});
