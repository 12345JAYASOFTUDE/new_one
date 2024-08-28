import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleError, handleSuccess } from '../../utils';
import { ToastContainer } from 'react-toastify';
import './admin.css'; // Ensure you have the correct styles
import Table from 'react-bootstrap/Table';

const AdminDashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [tickets, setTickets] = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAddResolver, setShowAddResolver] = useState(false);
  const [selectedResolver, setSelectedResolver] = useState(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [description, setDescription] = useState('');
  
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userJsonObj = sessionStorage.getItem('user');
    if (userJsonObj) {
      try {
        const user = JSON.parse(userJsonObj);
        setLoggedInUser(user.name || '');
      } catch (error) {
        console.error('Failed to parse user data:', error);
        handleError('Failed to parse user data.');
        navigate('/login');
      }
    } else {
      handleError('User information is missing.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const url = 'http://localhost:8000/tickets/getticket';
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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
  }, []);

  const fetchResolvers = async (role) => {
    try {
        console.log("Fetching resolvers for role:", role); // Debugging info
        const url = `http://localhost:8000/auth/getallresolvers`;
        const response = await axios.post(url, {role}, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('++++++++++++++++++++++++++++')
        console.log("Resolvers fetched:", response.data.resolvers); // Debugging info
        setResolvers(response.data.resolvers);
    } catch (err) {
        console.error('Error fetching resolvers:', err);
        handleError('Failed to fetch resolvers.');
    }
};

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
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
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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

  const handleAssignButtonClick = (ticket) => {
    setSelectedTicket(ticket);
    fetchResolvers('resolver');
    setShowAddResolver(true);
  };

  
  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedResolver) return;
  
    console.log('Assigning Ticket:', selectedTicket._id, 'to Resolver:', selectedResolver._id); // Add this line
  
    try {
      const url = 'http://localhost:8000/tickets/assign';
      const response = await axios.put(url, {
        ticketId: selectedTicket._id,
        resolverId: selectedResolver._id,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
  
      const result = response.data;
  
      if (result.success) {
        handleSuccess('Ticket assigned successfully');
        setShowAddResolver(false);
        setSelectedResolver(null);
        setSelectedTicket(null);


        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket._id === selectedTicket._id
              ? { ...ticket, status: 'Assigned', resolverId: selectedResolver._id }
              : ticket
          )
        );
  
        // Optionally fetch updated tickets
        // const updatedResponse = await axios.get('http://localhost:8000/tickets/getticket', {
        //   headers: {
        //     Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        //     'Content-Type': 'application/json',
        //   },
        // });
        // setTickets(updatedResponse.data.tickets || []);
      } else {
        handleError(result.message);
      }
    } catch (err) {
      handleError('Failed to assign ticket.');
    }
  };
  

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = signupInfo;
    if (!name || !email || !password || !role) {
      return handleError('All fields are required');
    }

    if (Object.keys(errors).length > 0) {
      return handleError('Please fix the validation errors');
    }

    try {
      const url = "http://localhost:8000/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupInfo)
      });
      const result = await response.json();
      console.log(result);
      
      const { success, message, jwtToken, name: userName, error } = result;

      if (success) {
        handleSuccess(message);
        sessionStorage.setItem('token', jwtToken);
        sessionStorage.setItem('user', userName);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));

    // Validate input
    validateInput(name, value);
  };

  const validateInput = (name, value) => {
    let newErrors = { ...errors };

    if (name === 'name') {
      const namePattern = /^[A-Za-z\s]+$/;
      if (!namePattern.test(value)) {
        newErrors.name = 'Name must contain only alphabetic characters';
      } else {
        delete newErrors.name;
      }
    }

    if (name === 'email') {
      const emailPattern = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailPattern.test(value)) {
        newErrors.email = 'Email must start with alphabetic characters and be a valid email format';
      } else {
        delete newErrors.email;
      }
    }

    setErrors(newErrors);
  };

  const handleResolverSelect = async (resolver) => {
    console.log(resolver);
    
    setSelectedResolver(resolver);
    // ======================================================================================
    await handleAssignTicket(resolver, selectedTicket);
    setShowAddResolver(false);
  };

  const handleDescriptionClick = (ticket) => {
    setDescription(ticket.description || 'No description available.');
    setShowDescriptionModal(true);
  };

  return (
    <div className="admincontainer">
      <nav className="navbar">
        <div className="welcome-message">Welcome {loggedInUser}</div>
        <button className="Button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <button className="Button" onClick={() => setShowSignupForm(true)}>
        Add Resolver
      </button>

      <div className="my-5 mx-5">
      <Table striped bordered hover>
  <thead>
    <tr>
      <th>Serial No</th>
      <th>Title</th>
      <th>Priority</th>
      <th>Status</th>
      <th>User Name</th>
      <th>User Email</th>
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
        <td>{ticket.user?.name || 'Unknown'}</td> {/* Display user name */}
        <td>{ticket.user?.email || 'Unknown'}</td> {/* Display user email */}
        <td className="d-flex">
          <div className="mx-2">
            <button
              className="Button"
              onClick={() => handleAssignButtonClick(ticket)}
            >
              Assign
            </button>
          </div>
          <div className="mx-2">
            <button
              className="Button"
              onClick={() => handleDescriptionClick(ticket)}
            >
              Check Description
            </button>
          </div>
          <div className="mx-2">
            <button
              className="Button"
              onClick={() => handleDeleteTicket(ticket._id)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
      </div>

      {/* Resolver Modal */}
      {showAddResolver && (
  <div className="resolver-modal">
    <h2>Select Resolver</h2>
    <button className="close-button" onClick={() => setShowAddResolver(false)}>
      &times;
    </button>
    <Table striped bordered hover className="resolver-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {(resolvers && resolvers.length > 0) ? (
      resolvers.map((resolver) => (
        <tr key={resolver._id}>
          <td>{resolver.name}</td>
          <td>{resolver.email}</td>
          <td>
            <button
              className="resolver-select-button"
              onClick={() => handleResolverSelect(resolver)}
            >
              Select
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="3">No resolvers available</td>
      </tr>
    )}
  </tbody>
</Table>

  </div>
)}
      {/* Signup Form Modal */}
      {showSignupForm && (
        <div className="signup-form-modal show">
          <button className="close-button" onClick={() => setShowSignupForm(false)}>
            &times;
          </button>
          <h2>Signup Form</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={signupInfo.name}
                onChange={handleChange}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={signupInfo.email}
                onChange={handleChange}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={signupInfo.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-control"
                value={signupInfo.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="resolver">Resolver</option>
              </select>
            </div>
            <button type="submit" className="custom-button">
              Signup
            </button>
          </form>
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="resolver-modal">
          <h2>Ticket Description</h2>
          <button className="close-button" onClick={() => setShowDescriptionModal(false)}>
            &times;
          </button>
          <p>{description}</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
