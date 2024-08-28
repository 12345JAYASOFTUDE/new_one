import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";

function Login({ setIsAuthenticated }) {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email and password are required");
    }

    try {
      const url =" http://localhost:8000/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();

      if (!response.ok) {
        handleError(result.message || "An error occurred. Please try again.");
        return;
      }

      const { success, message, jwtToken, user, error } = result;

      if (success) {
        handleSuccess(message);
        sessionStorage.setItem('token', jwtToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log(user.role);

        if(user.role=="admin") {
          
            navigate('/admin');
          
        }else if(user.role==="resolver"){
          setTimeout(() => {
            navigate('/resolver');
          }, 1000);
         
        }
        else{
          setTimeout(() => {
            navigate('/home')
          }, 1000);
     
        }
        setIsAuthenticated(true); // Update authentication state
       
      } else {
        const errorMessage = error?.details?.[0]?.message || message || "An error occurred. Please try again.";
        handleError(errorMessage);
      }
    } catch (err) {
      handleError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="custom-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email..."
              value={loginInfo.email}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password..."
              value={loginInfo.password}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="custom-button">
            Login
          </button>
          <span className="login-link">
            Don't have an account? <Link to="/signup">Signup</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;