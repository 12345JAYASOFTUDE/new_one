import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleError, handleSuccess } from '../../utils';
import { ToastContainer } from 'react-toastify';
import './home.css';
import Table from 'react-bootstrap/Table';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

const UserDashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [tickets, setTickets] = useState([]);
  const [editTicket, setEditTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'Low', // Default priority
    userId: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userJsonObj = sessionStorage.getItem('user');
    if (userJsonObj) {
      try {
        const user = JSON.parse(userJsonObj);
        setLoggedInUser(user.name || ''); // Ensure name exists
        setNewTicket((prev) => ({ ...prev, userId: user._id }));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        handleError('Failed to parse user data.');
        navigate('/login');
      }
    } else {
      handleError('User information is missing.');
      navigate('/login'); // Redirect to login if user info is missing
    }
  }, [navigate]);

  useEffect(() => {
    if (!newTicket.userId) return; // Prevent API call if userId is not set

    const fetchTickets = async () => {
      try {
        const url = 'http://localhost:8000/tickets/getticket';
        const response = await axios.get(url, {
          params: { user: newTicket.userId },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
            'Content-Type': 'application/json',
          },
        });
        setTickets(response.data.tickets || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        handleError('Failed to fetch tickets.');
      }
    };

    fetchTickets();
  }, [newTicket.userId]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user'); // Ensure this key matches what you set in login
    handleSuccess('User Logged out');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const url = 'http://localhost:8000/tickets/delete';
      const response = await axios.delete(url, {
        params: { id: ticketId },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
        },
      });
      const result = response.data;
      if (result.success) {
        handleSuccess('Ticket deleted successfully');
        setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
      } else {
        handleError(result.message);
      }
    } catch (err) {
      handleError('Failed to delete ticket.');
    }
  };

  const handleNewTicketChange = (e) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async () => {
    try {
      const url = 'http://localhost:8000/tickets/create';
      const response = await axios.post(url, newTicket, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
        },
      });
      const result = response.data;

      if (result.success) {
        handleSuccess('Ticket created successfully');
        setNewTicket({ title: '', description: '', priority: 'Low', userId: newTicket.userId });
        setShowCreateForm(false);
        // Refresh tickets
        const updatedResponse = await axios.get('http://localhost:8000/tickets/getticket', {
          params: { user: newTicket.userId },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
            'Content-Type': 'application/json',
          },
        });
        setTickets(updatedResponse.data.tickets || []);
      } else {
        handleError(result.message);
      }
    } catch (err) {
      handleError('Failed to create ticket.');
    }
  };

  const handleEditTicketChange = (e) => {
    const { name, value } = e.target;
    setEditTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTicket = async () => {
    try {
      if (!editTicket?._id) return; // Ensure _id exists
      const url = 'http://localhost:8000/tickets/update'; // Fixed URL string

      const response = await axios.put(url, editTicket, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
        },
      });

      const result = response.data;

      if (result.success) {
        handleSuccess('Ticket updated successfully');
        setEditTicket(null);
        setShowEditForm(false);

        const updatedResponse = await axios.get('http://localhost:8000/tickets/getticket', {
          params: { user: newTicket.userId },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`, // Fixed template literal
            'Content-Type': 'application/json',
          },
        });
        setTickets(updatedResponse.data.tickets || []);
      } else {
        handleError(result.message);
      }
    } catch (err) {
      handleError('Failed to update ticket.');
    }
  };

  return (
    <div className="usercontainer">
      <nav className="navbar">
        <div className="welcome-message">Welcome {loggedInUser}</div>
        <button className="Button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <button className="create-button" onClick={() => setShowCreateForm(true)}>
        Create Ticket
      </button>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <div className="create-ticket-form show">
          <button
            className="close-button"
            onClick={() => setShowCreateForm(false)}
          >
            &times;
          </button>
          <h2>Create Ticket</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTicket();
            }}
          >
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTicket.title}
                onChange={handleNewTicketChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newTicket.description}
                onChange={handleNewTicketChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={newTicket.priority}
                onChange={handleNewTicketChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <button type="submit" className="Button">
              Submit
            </button>
          </form>
        </div>
      )}

      {/* Edit Ticket Form */}
      {showEditForm && editTicket && (
        <div className="create-ticket-form show">
          <button
            className="close-button"
            onClick={() => setShowEditForm(false)}
          >
            &times;
          </button>
          <h2>Edit Ticket</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTicket();
            }}
          >
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editTicket.title}
                onChange={handleEditTicketChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={editTicket.description}
                onChange={handleEditTicketChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={editTicket.priority}
                onChange={handleEditTicketChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <button type="submit" className="Button">
              Update
            </button>
          </form>
        </div>
      )}

      <div className="my-5 mx-5">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={ticket._id}>
                <td>{index + 1}</td>
                <td>{ticket.title}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.status || 'Pending'}</td>
                <td className="d-flex">
                  <div className="mx-3">
                    <FaEdit
                      onClick={() => {
                        setEditTicket(ticket);
                        setShowEditForm(true);
                      }}
                    />
                  </div>
                  <div className="mx-3">
                    <MdDeleteForever
                      onClick={() => handleDeleteTicket(ticket._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserDashboard;
