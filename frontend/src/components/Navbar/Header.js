import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import "./header.css"; // Import the CSS file

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect from dashboard to profile
  useEffect(() => {
    if (location.pathname === '/dashboard' && isLoggedIn) {
      navigate('/profile', { replace: true });
    }
  }, [location.pathname, isLoggedIn, navigate]);

  useEffect(() => {
    // Check if user is logged in
    const checkLogin = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const currentUser = authService.getCurrentUser();
        setUserData(currentUser?.user || null);
      }
    };
    
    checkLogin();
    
    // Close dropdown when clicking outside
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUserData(null);
    setShowDropdown(false);
    navigate('/');
    toast.info('Logged out successfully');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
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

          {/* Profile/Login Button */}
          {isLoggedIn ? (
            <div className="profile-container" ref={dropdownRef}>
              <button onClick={toggleDropdown} className="profile-btn">
                <FaUserCircle size={20} className="mr-2" />
                <span>{userData?.name?.split(' ')[0] || 'Profile'}</span>
              </button>
              
              {showDropdown && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaUser className="dropdown-icon" /> My Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <FaSignOutAlt className="dropdown-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
