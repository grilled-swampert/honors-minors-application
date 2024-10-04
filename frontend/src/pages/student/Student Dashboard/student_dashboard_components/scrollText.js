import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './scrollText.module.css';

export default function ScrollText() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
              console.log('Fetching broadcast messages...');
              const response = await axios.get('/student/broadcast-messages');
              console.log('Fetched messages:', response.data);
              setMessages(response.data); 
            } catch (error) {
              console.error('Error fetching broadcast messages:', error);
            }
          };

        fetchMessages();
        const interval = setInterval(fetchMessages, 60000); 

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.adminMessage}>
            <p className={styles.scrollMessageText}>
                {messages.map((message, index) => (
                    <span key={message._id}>
                        {message.text}
                        {index < messages.length - 1}
                    </span>
                ))}
            </p>
        </div>
    );
}