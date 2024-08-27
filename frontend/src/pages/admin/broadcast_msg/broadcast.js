import React, { useState } from 'react';
import './broadcast.css'; 
import deleteicon from '../../photos-logos/delete.png';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';
const Broadcast = () => {

  const [messages, setMessages] = useState([]);


  const handleAddMessage = () => {
    const messageInput = document.getElementById('message-input');
    const messageValue = messageInput.value.trim();

    if (messageValue) {
      setMessages(prevMessages => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: messageValue }
      ]);
      messageInput.value = '';
    }
  };

  const handleDeleteMessage = (id) => {
    setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
  };

  return (
    <div className="main">
      <Header />
      <AdminSideBar/>
      <div className="br-content">
        <div className="br-top">
          <h3>Broadcast Message:</h3>
          <input placeholder="Enter Message" id="message-input" />
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
              {messages.map(message => (
                <tr key={message.id}>
                  <td>{message.id}</td>
                  <td>{message.text}</td>
                  <td className='br-btn'>
                    <label htmlFor={`toggle-${message.id}`} className="toggle-label">
                      <input className="circle" id={`toggle-${message.id}`} name="toggle" type="checkbox" />
                    </label>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMessage(message.id)}
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
  );
};

export default Broadcast;
