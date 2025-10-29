import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Dashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [weather, setWeather] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const token = localStorage.getItem('token');
  console.log("Token on load:", token);

  const handleAddItem = async (e) => {
    e.preventDefault();
    console.log("handleAddItem called with event:", e);
    console.log("Submitting with token:", token, { title, description });
    if (!token) {
      console.error('No token found');
      return;
    }
    if (!title || !description) {
      console.error('Title or description is empty');
      return;
    }
    try {
      console.log("Sending POST request to create_item.php...");
      const res = await axios.post('http://localhost/webapp-backend/create_item.php', {
        name: title,
        description: description,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Add response:', res.data);
      fetchItems();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Add error:', err.response?.data || err.message);
    }
  };

  const fetchItems = useCallback(async () => {
    console.log("Fetching with token:", token);
    if (!token) {
      console.error('No token found for fetch');
      return;
    }
    try {
      const res = await axios.get('http://localhost/webapp-backend/get_items.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetch response:', res.data);
      console.log('Fetched items data:', res.data.items);
      setItems(res.data.items || res.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
    }
  }, [token]);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost/webapp-backend/get_weather.php?lat=-26.2041&lon=28.0473'); // Johannesburg coordinates
      console.log('Weather response:', res.data);
      setWeather(res.data);
    } catch (err) {
      console.error('Weather fetch error:', err.response?.data || err.message);
    }
  }, []);

  const handleDeleteItem = async (id) => {
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      console.log("Sending DELETE request for item ID:", id);
      await axios.delete(`http://localhost/webapp-backend/delete_item.php?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
    }
  };

  const handleEditItem = (item) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = async () => {
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      console.log("Sending PUT request for item ID:", editId);
      const res = await axios.put(`http://localhost/webapp-backend/update_item.php?id=${editId}`, {
        name: editTitle,
        description: editDescription,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Edit response:', res.data);
      setEditId(null);
      setEditTitle('');
      setEditDescription('');
      fetchItems();
    } catch (err) {
      console.error('Edit error:', err.response?.data || err.message);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('Items state before fetch:', items);
    fetchItems();
    fetchWeather();
  }, [fetchItems, fetchWeather]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#333',
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      <h2 style={{ 
        color: darkMode ? '#fff' : '#333',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        Dashboard
        <div>
          <button
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: darkMode ? '#d32f2f' : '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Logout
          </button>
          <button
            onClick={toggleDarkMode}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: darkMode ? '#90caf9' : '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer'
            }}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </h2>
      {weather && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          border: `1px solid ${darkMode ? '#555' : '#ccc'}`, 
          borderRadius: '4px',
          backgroundColor: darkMode ? '#444' : '#f9f9f9'
        }}>
          <h3 style={{ marginBottom: '10px', color: darkMode ? '#fff' : '#333' }}>Current Weather (Johannesburg)</h3>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Condition: {weather.weather[0].main}</p>
        </div>
      )}
      <form onSubmit={handleAddItem} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{ 
            padding: '8px', 
            marginRight: '10px', 
            border: '1px solid ' + (darkMode ? '#555' : '#ccc'), 
            borderRadius: '4px',
            backgroundColor: darkMode ? '#444' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          style={{ 
            padding: '8px', 
            marginRight: '10px', 
            border: '1px solid ' + (darkMode ? '#555' : '#ccc'), 
            borderRadius: '4px',
            backgroundColor: darkMode ? '#444' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }}
        />
        <button
          type="submit"
          style={{ 
            padding: '8px 16px', 
            backgroundColor: darkMode ? '#66bb6a' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
        >
          Add Item
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: darkMode ? '#444' : '#f2f2f2' }}>
            <th style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), textAlign: 'left', color: darkMode ? '#fff' : '#333' }}>Title</th>
            <th style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), textAlign: 'left', color: darkMode ? '#fff' : '#333' }}>Description</th>
            <th style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), textAlign: 'left', color: darkMode ? '#fff' : '#333' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map(item => (
              <tr key={item.id} style={{ backgroundColor: editId === item.id ? (darkMode ? '#355' : '#e6f3ff') : (darkMode ? '#333' : 'white') }}>
                {editId === item.id ? (
                  <>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd') }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        style={{ 
                          padding: '6px', 
                          border: '1px solid ' + (darkMode ? '#555' : '#ccc'), 
                          borderRadius: '4px', 
                          width: '100%',
                          backgroundColor: darkMode ? '#444' : '#fff',
                          color: darkMode ? '#fff' : '#333'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd') }}>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        required
                        style={{ 
                          padding: '6px', 
                          border: '1px solid ' + (darkMode ? '#555' : '#ccc'), 
                          borderRadius: '4px', 
                          width: '100%',
                          backgroundColor: darkMode ? '#444' : '#fff',
                          color: darkMode ? '#fff' : '#333'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd') }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: darkMode ? '#90caf9' : '#2196F3', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          marginRight: '5px', 
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: darkMode ? '#ef5350' : '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), color: darkMode ? '#fff' : '#333' }}>{item.title}</td>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), color: darkMode ? '#fff' : '#333' }}>{item.description}</td>
                    <td style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd') }}>
                      <button
                        onClick={() => handleEditItem(item)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: darkMode ? '#90caf9' : '#2196F3', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          marginRight: '5px', 
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: darkMode ? '#ef5350' : '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" style={{ padding: '12px', border: '1px solid ' + (darkMode ? '#555' : '#ddd'), textAlign: 'center', color: darkMode ? '#fff' : '#333' }}>No items found</td></tr>
          )}
        </tbody>
      </table>
      <style>
        {`
          table tr:hover { background-color: ${darkMode ? '#444' : '#f5f5f5'}; }
          button:hover { opacity: 0.9; }
          input:focus { 
            outline: none; 
            border-color: ${darkMode ? '#66bb6a' : '#4CAF50'}; 
            box-shadow: 0 0 5px rgba(${darkMode ? '102, 187, 106' : '76, 175, 80'}, 0.5); 
          }
        `}
      </style>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={fetchWeather}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: darkMode ? '#90caf9' : '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
        >
          Fetch Weather
        </button>
        {weather && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            border: `1px solid ${darkMode ? '#555' : '#ccc'}`, 
            borderRadius: '4px',
            backgroundColor: darkMode ? '#444' : '#f9f9f9'
          }}>
            <p>Temperature: {weather.main.temp}°C</p>
            <p>Condition: {weather.weather[0].main}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;