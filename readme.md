# Publisher Subscriber Notification System

The Publisher Subscriber Notification System is a Node.js application that allows publishers to send notifications to subscribers who are interested in specific topics. It provides APIs for subscribing to topics, unsubscribing from topics, and notifying subscribers about updates by sending mails, adding and deleting subscribers, adding new messages to topic, getting all messages for users topics, getting specific topics messages.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)

## Installation

To install and run the Publisher Subscriber Notification System, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/publisher-subscriber.git


2. **Navigate to the Project Directory:**

   ```bash
   cd publisher-subscriber

3. **Install Dependcies:**

   ```bash
   npm install

3. **Set Environment Variables::**
    Create a .env file in the root directory and define the following environment variables: (Added .env with my credentials for convenience)

    Replace your_email@gmail.com and your_email_password with your Gmail credentials. Make sure to enable less secure app access in your Gmail settings.
    ```bash
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password





## Usage
To start the application, run the following command:
    ```bash
    npm start
The server will start running at http://localhost:3000

### API Endpoints

#### Subscribe

- **URL:** `/subscribe`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "topicId": "topic_id",
    "subscriberId": "subscriber_id"
  }
- **Description:** Subscribe a subscriber to a topic.

#### Unsubscribe

- **URL:** `/unsubscribe`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "topicId": "topic_id",
    "subscriberId": "subscriber_id"
  }
- **Description:** Unsubscribe a subscriber from a topic.


#### Notify

- **URL:** `/notify`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "topicId": "topic_id"
  }
- **Description:** Send mail notifications to subscribers interested in a specific topic.


#### Add Subscriber

- **URL:** `/addSubscriber`
- **Method:** POST
- **Request Body:**
  ```json
    {
        "subscriberId": "subscriber_id",
        "name": "subscriber_name",
        "email": "subscriber_email"
    }
- **Description:** Add a new subscriber to the system.
 
#### Delete Subscriber

- **URL:** `/deleteSubscriber`
- **Method:** POST
- **Request Body:**
  ```json
    {
        "subscriberId": "subscriber_id"
    }
- **Description:** Delete a subscriber from the system.

#### Add Message to topic

- **URL:** `/addMessage`
- **Method:** POST
- **Request Body:**
  ```json
    {
    "topicId": "topicId",
    "message": "your_message"
}
- **Description:** Add a message in the given topic and all its subscribers will get notified using mail


#### Get all Messages

- **URL:** `/getAllMessages`
- **Method:** POST
- **Request Body:**
  ```json
    {
        "subscriberId": "subscriber_id"
    }
- **Description:** Gets all messages for given user in topic wise manner.

#### Get messages from specific topic

- **URL:** `/getMessagesForTopic`
- **Method:** POST
- **Request Body:**
  ```json
    {
        "subscriberId": "subscriber_id",
        "topicId":"topic_ID"
    }
- **Description:** Gets specific topic messages for given user 
 
 

## Testing

System is also deployed at URL: - **URL:** `https://publisher-subscriber.onrender.com`
To test the functionality of the API endpoints, you can run the provided test script:

This will execute a series of test cases to ensure that the application functions as expected.

```bash
node driver.js