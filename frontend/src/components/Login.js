import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaLongArrowAltRight } from 'react-icons/fa';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import authService from '../services/authService';
import './auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (authService.isLoggedIn()) {
      navigate('/');
    }
    
    // Add animation class after component mounts
    setTimeout(() => setAnimateForm(true), 500);
  }, [navigate]);

  const { email, password } = formData;

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Login user
      await authService.login(formData);
      
      // Show success animation
      setAnimateForm(false);
      setTimeout(() => {
        toast.success('Login successful!');
        // Force a window reload to update all components with the new auth state
        window.location.href = location.state?.from?.pathname || '/';
      }, 800);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.msg || 'Login failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "#16182f",
            },
          },
          fpsLimit: 60,
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.3,
            },
            size: {
              value: 3,
              random: true,
            },
            links: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              outMode: "out",
              bounce: false,
              attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
              resize: true
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 },
            }
          },
          detectRetina: true
        }}
        className="particles-container"
      />
      
      {/* Content */}
      <div className="auth-content">
        <AnimatePresence>
          {animateForm && (
            <motion.div
              className="auth-form-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              {/* Left Panel - Welcome/Branding */}
              <div className="auth-welcome-panel">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="auth-welcome-content"
                >
                  <h1 className="auth-title">CoirTrack</h1>
                  <div className="auth-title-underline"></div>
                  <p className="auth-welcome-text">
                    Welcome back! Log in to access your account and manage your coir products efficiently.
                  </p>
                  <div className="auth-alt-action">
                    <span>Don't have an account?</span>
                    <Link to="/register" className="auth-alt-link">
                      Sign up
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Panel - Login Form */}
              <div className="auth-form-panel">
                <div className="auth-form-wrapper">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <h2 className="auth-form-title">Sign In</h2>
                    <p className="auth-form-subtitle">Please sign in to your account to continue</p>
                    
                    <form onSubmit={onSubmit}>
                      <div className="auth-form-group">
                        <label htmlFor="email" className="auth-label">
                          Email Address
                        </label>
                        <div className="auth-input-wrapper">
                          <div className="auth-input-icon">
                            <FaEnvelope />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="auth-input"
                            placeholder="youremail@example.com"
                            value={email}
                            onChange={onChange}
                          />
                        </div>
                      </div>
                      
                      <div className="auth-form-group">
                        <div className="auth-password-header">
                          <label htmlFor="password" className="auth-label">
                            Password
                          </label>
                        </div>
                        <div className="auth-input-wrapper">
                          <div className="auth-input-icon">
                            <FaLock />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={onChange}
                          />
                          <div 
                            className="auth-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <span>
                              {showPassword ? 'Hide' : 'Show'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="auth-form-submit">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="auth-submit-button"
                        >
                          {isLoading ? (
                            <span className="auth-button-content">
                              <svg className="auth-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="auth-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="auth-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing in...
                            </span>
                          ) : (
                            <span className="auth-button-content">
                              Sign in 
                              <FaLongArrowAltRight className="auth-icon-right" />
                            </span>
                          )}
                        </button>
                      </div>
                    </form>
                    
                    <div className="auth-footer">
                      <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-footer-link">
                          Create account
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login; 