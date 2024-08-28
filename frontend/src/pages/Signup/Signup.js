import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import './signup.css';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
 
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

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

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password,role } = signupInfo;
    if (!name || !email || !password || !role) {
      return handleError('All feild are required');
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
      
      const { success, message, jwtToken, name, error } = result;

      if (success) {
        handleSuccess(message);
        // Store token and user name in sessionStorage
        sessionStorage.setItem('token', jwtToken);
        sessionStorage.setItem('user', name);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
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

  return (
    <div className='container'>
      <div className='custom-card'>
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <div className='form-group'>
            <label htmlFor='name' className='form-label'>Name</label>
            <input
              onChange={handleChange}
              type='text'
              name='name'
              id='name'
              placeholder='Enter your name...'
              value={signupInfo.name}
              className='form-control'
            />
            {errors.name && <span className='error-message'>{errors.name}</span>}
          </div>
          <div className='form-group'>
            <label htmlFor='email' className='form-label'>Email</label>
            <input
              onChange={handleChange}
              type='email'
              name='email'
              id='email'
              placeholder='Enter your email...'
              value={signupInfo.email}
              className='form-control'
            />
            {errors.email && <span className='error-message'>{errors.email}</span>}
          </div>
          <div className='form-group'>
            <label htmlFor='password' className='form-label'>Password</label>
            <input
              onChange={handleChange}
              type='password'
              name='password'
              id='password'
              placeholder='Enter your password...'
              value={signupInfo.password}
              className='form-control'
            />
          </div>
          
          <button type='submit' className='custom-button'>Signup</button>
          <span className='signup-link'>Already have an account? <Link to="/login">Login</Link></span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Signup;