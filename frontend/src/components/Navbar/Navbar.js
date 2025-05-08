import React, { useEffect, useState } from "react";
import "./Navbar.css"; // CSS file for styling
import { Link } from "react-router-dom"; // Import the Link component
import authService from "../../services/authService";
import { FaHome, FaList, FaWarehouse, FaTachometerAlt, FaSignInAlt, FaUserPlus, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
/*
<li className="home-ll">
<Link to="/imgpart" className="active home-a">
  <h1>addimag</h1>
</Link>
</li>*/

function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response && response.user.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    if (authService.isLoggedIn()) {
      fetchUserStatus();
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="home-ul">
      <div className="menu-toggle" onClick={toggleMenu}>
        <div className="hamburger">
          {menuOpen ? <FaTimes size={20} color="white" /> : <FaBars size={20} color="white" />}
        </div>
      </div>
      
      <ul className={menuOpen ? 'menu-open' : ''}>
        <li className="home-ll">
          <Link to="/" className="active home-a">
            <h1>Home</h1>
          </Link>
        </li>
        
        {isAdmin ? (
          // Admin navigation options
          <>
            <li className="home-ll">
              <Link to="/admin" className="active home-a">
                <h1>Dashboard</h1>
              </Link>
            </li>
            <li className="home-ll">
              <Link to="/items" className="active home-a">
                <h1>Add Item</h1>
              </Link>
            </li>
            <li className="home-ll">
              <Link to="/itemsshow" className="active home-a">
                <h1>All Products</h1>
              </Link>
            </li>
            <li className="home-ll">
              <Link to="/shops" className="active home-a">
                <h1>Inventory Details</h1>
              </Link>
            </li>
          </>
        ) : (
          // Regular user navigation options
          <>
            <li className="home-ll">
              <Link to="/shops" className="active home-a">
                <h1>Products</h1>
              </Link>
            </li>
            <li className="home-ll">
              <Link to="/itemsshow" className="active home-a">
                <h1>All Products</h1>
              </Link>
            </li>
            <li className="home-ll">
              <Link to="/shops" className="active home-a">
                <h1>Inventory Details</h1>
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Navbar;
