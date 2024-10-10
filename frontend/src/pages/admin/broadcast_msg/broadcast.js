import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './broadcast.css';
import deleteicon from '../../photos-logos/delete.png';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';
import { useParams } from 'react-router-dom';

const Broadcast = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { termId } = useParams();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...');
      const response = await axios.get(`/admin/${termId}/edit/broadcast`);
      console.log('Response:', response);
      console.log('Fetched messages:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response ? error.response.data : error.message);
    }
  };

  const handleAddMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await axios.post(`/admin/${termId}/edit/broadcast`, { text: newMessage });
        console.log('Message added:', response.data);
        setNewMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Error adding message:', error);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`/admin/${termId}/edit/broadcast/${id}`);
      console.log('Message deleted:', id);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleToggleMessage = async (id) => {
    try {
      const response = await axios.patch(`/admin/${termId}/edit/broadcast`, { id });
      console.log('Message toggled:', response.data);
      fetchMessages();
    } catch (error) {
      console.error('Error toggling message:', error);
    }
  };

  return (
    <div className="main">
      <Header />
      <div className="container">
        <AdminSideBar />
        <div className="br-content">
          <div className="br-top">
            <h3>Broadcast Message:</h3>
            <input
              placeholder="Enter Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleAddMessage} className="enter-button">Enter</button>
          </div>

          <div className="br-bottom">
            <table id="message-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {messages.map((message, index) => (
                  <tr key={message._id}>
                    <td>{index + 1}</td>
                    <td>{message.text}</td>
                    <td className='br-btn'>
                      <div class="toggle-cont">
                        <input class="toggle-input" id="toggle" name="toggle" type="checkbox" />
                        <label class="toggle-label" for="toggle">
                          <div class="cont-label-play">
                            <span class="label-play"></span>
                          </div>
                        </label>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteMessage(message._id)}
                      >
                        <img src={deleteicon} alt="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;
