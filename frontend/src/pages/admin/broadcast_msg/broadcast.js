import React, { useState, useEffect } from "react";
import axios from "axios";
import "./broadcast.css";
import deleteicon from "../../photos-logos/delete.png";
import Header from "../../header/header";
import AdminSideBar from "../admin-sidebar/adminSidebar";
import { useParams } from "react-router-dom";

const Broadcast = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { termId } = useParams();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log("Fetching messages...");
      const response = await axios.get(
        `${API_BASE_URL}/admin/${termId}/edit/broadcast`
      );
      console.log("Response:", response);
      console.log("Fetched messages:", response.data);
      setMessages(response.data);
    } catch (error) {
      console.error(
        "Error fetching messages:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (newMessage.trim()) {
      try {
        setLoading(true);
        const response = await axios.post(
          `${API_BASE_URL}/admin/${termId}/edit/broadcast`,
          { text: newMessage }
        );
        console.log("Message added:", response.data);
        setNewMessage("");
        fetchMessages();
      } catch (error) {
        console.error("Error adding message:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/admin/${termId}/edit/broadcast/${id}`
      );
      console.log("Message deleted:", id);
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMessage = async (id) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_BASE_URL}/admin/${termId}/edit/broadcast`,
        { id }
      );
      console.log("Message toggled:", response.data);
      fetchMessages(); // Refetch messages after toggling
    } catch (error) {
      console.error("Error toggling message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="topside-table">
        <AdminSideBar />
        <div className="admin-title-bar">
          <div className="adminedit-page-title">Broadcast Message</div>
        </div>
      </div>
      <div className="bm-main">
        <div className="container">
          <div className="br-content">
            <div className="br-top">
              <input
                placeholder="Enter Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleAddMessage} className="bm-enter-button">
                Enter
              </button>
            </div>

            {loading && (
              <div className="loader-spinner">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            )}

            <div className="br-bottom">
              <table id="message-table">
                <thead>
                  <tr>
                    <th>NUMBER</th>
                    <th>MESSAGE</th>
                    <th>ENABLE/DISABLE</th>
                    <th>DELETE</th>
                  </tr>
                </thead>
                <tbody id="table-body">
                  {messages.map((message, index) => (
                    <tr key={message._id}>
                      <td>{index + 1}</td>
                      <td>{message.text}</td>
                      <td className="toggle-td">
                        <div className="br-btn toggle-cont">
                          <input
                            className="toggle-input"
                            id={`toggle-${message._id}`} // Unique ID for each toggle
                            name="toggle"
                            type="checkbox"
                            checked={message.isActive} // Checkbox reflects active status
                            onChange={() => handleToggleMessage(message._id)} // Handle toggle
                          />
                          <label
                            className="toggle-label"
                            htmlFor={`toggle-${message._id}`}
                          >
                            <div className="cont-label-play">
                              <span className="label-play"></span>
                            </div>
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          className="broad-delete-btn"
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
    </div>
  );
};

export default Broadcast;
