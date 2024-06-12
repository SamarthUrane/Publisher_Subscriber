import axios from 'axios';

//For local Website
// const baseURL = 'http://localhost:3000';

//For deployed Website
const baseURL="https://publisher-subscriber.onrender.com"

async function testSubscribe(subscriberId, topicId) {
    try {
        const response = await axios.post(`${baseURL}/subscribe`, { topicId, subscriberId });
        console.log(response.data);
    } catch (error) {
        console.error('Error subscribing:', error.response.data);
    }
}

async function testUnsubscribe(subscriberId, topicId) {
    try {
        const response = await axios.post(`${baseURL}/unsubscribe`, { topicId, subscriberId });
        console.log(response.data);
    } catch (error) {
        console.error('Error unsubscribing:', error.response.data);
    }
}

async function testNotify(topicId) {
    try {
        const response = await axios.post(`${baseURL}/notify`, { topicId });
        console.log(response.data);
    } catch (error) {
        console.error('Error notifying subscribers:', error.response ? error.response.data : error.message);
    }
}

async function testAddMessage(topicId, message) {
    try {
        const response = await axios.post(`${baseURL}/addMessage`, { topicId, message });
        console.log(response.data);
    } catch (error) {
        console.error('Error adding message:', error.response ? error.response.data : error.message);
    }
}

async function testGetAllMessages(subscriberId) {
    try {
        const response = await axios.post(`${baseURL}/getAllMessages`, { subscriberId });
        console.log(response.data);
    } catch (error) {
        console.error('Error getting all messages:', error.response ? error.response.data : error.message);
    }
}

async function testGetMessagesForTopic(subscriberId, topicId) {
    try {
        const response = await axios.post(`${baseURL}/getMessagesForTopic`, { subscriberId, topicId });
        console.log(response.data);
    } catch (error) {
        console.error('Error getting messages for topic:', error.response ? error.response.data : error.message);
    }
}


async function runTests() {
    await testSubscribe('user1', 'technology');

    await testSubscribe('user2', 'technology');

    await testUnsubscribe('user1', 'technology');

    await testNotify('news'); 
        await testAddMessage('technology', 'New article on technology.');
 
        await testGetAllMessages('user2');
     
        await testGetMessagesForTopic('user2', 'technology');
}

runTests();
