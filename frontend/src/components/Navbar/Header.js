import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import "./header.css"; // Import the CSS file

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    setIsLoggedIn(authService.isLoggedIn());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/');
    toast.info('Logged out successfully');
  };

  return (
    <header>
      <div className="container">
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo">
            <img src={require("./icons/coir-logo.png")} alt="Nesasa Coir Logo" />
            <div className="logo-text">Nesasa Coir</div>
          </div>

          {/* Navigation */}
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/aboutUs">About</Link></li>
              <li><Link to="/shops">Products</Link></li>
              {isLoggedIn && <li><Link to="/paymnetHistory">Orders</Link></li>}
              {isLoggedIn && authService.isAdmin() && <li><Link to="/admin">Admin</Link></li>}
              <li><Link to="/contact">Contact</Link></li>      
            </ul>
          </nav>

          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="login-btn">Logout</button>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
