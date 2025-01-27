import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); // Number of users per page
  const [notification, setNotification] = useState(null); // For notification message

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(response.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        department: 'N/A', // Placeholder since department is not available in API
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasError(true);
    }
  };

  // Get the users for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) {
      return; // If user cancels, do nothing
    }

    try {
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, deleting: true } : user
      );
      setUsers(updatedUsers);

      await new Promise((resolve) => setTimeout(resolve, 150)); // Shorter delay

      await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));

      // Show notification after successful deletion
      setNotification('User deleted successfully!');
      setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
    } catch (error) {
      console.error('Error deleting user:', error);
      setHasError(true);
    }
  };

  const handleFormSubmit = (user) => {
    if (user.id) {
      setUsers(users.map((u) => (u.id === user.id ? user : u)));
      setNotification('User edited successfully!');
    } else {
      user.id = users.length + 1;
      setUsers([...users, user]);
      setNotification('User added successfully!');
    }
    setIsFormOpen(false);
    setSelectedUser(null);

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (hasError) {
    return <h2>Something went wrong. Please try again later.</h2>;
  }

  // Pagination logic
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(users.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="app">
      <h1>User Management System</h1>

      {/* Display notification */}
      {notification && <div className="notification">{notification}</div>}

      <div className="user-list">
        <button className="add-user-btn" onClick={() => setIsFormOpen(true)}>Add User</button>
        {isFormOpen && (
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id} className={user.deleting ? 'deleting' : ''} style={{ animationDelay: `${index * 0.15}s` }}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {pageNumbers.map(number => (
            <button
              key={number}
              className={`page-btn ${currentPage === number ? 'active' : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Department:</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
        />
      </div>
      <div className="form-actions">
        <button className="submit-btn" type="submit">Submit</button>
        <button className="cancel-btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default App;
