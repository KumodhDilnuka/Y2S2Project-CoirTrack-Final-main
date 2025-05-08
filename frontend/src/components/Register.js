import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaUserPlus, FaLongArrowAltRight, FaPhone, FaIdCard, FaShieldAlt } from 'react-icons/fa';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import authService from '../services/authService';
import './auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (authService.isLoggedIn()) {
      navigate('/');
    }
    
    // Add animation class after component mounts
    setTimeout(() => setAnimateForm(true), 500);
  }, [navigate]);

  const { name, email, phone, password, confirmPassword } = formData;

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!name) {
        toast.error('Please enter your name');
        return;
      }
      if (!phone) {
        toast.error('Please enter your phone number');
        return;
      }
    } else if (step === 2) {
      if (!email) {
        toast.error('Please enter your email');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !phone || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user (remove confirmPassword from sent data)
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      
      // Show success animation
      setAnimateForm(false);
      setTimeout(() => {
        toast.success('Registration successful!');
        // Force a window reload to update all components with the new auth state
        window.location.href = '/';
      }, 800);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.msg || 'Registration failed';
      toast.error(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">Personal Information</h3>
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <FaUser />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={onChange}
                />
              </div>
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="phone" className="auth-label">
                Phone Number
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <FaPhone />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="auth-input"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={onChange}
                />
              </div>
            </div>
            
            <div className="step-buttons">
              <button 
                type="button" 
                className="auth-button next-button"
                onClick={nextStep}
              >
                Next <FaLongArrowAltRight className="ml-2" />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">Account Information</h3>
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
                  placeholder="you@example.com"
                  value={email}
                  onChange={onChange}
                />
              </div>
            </div>
            
            <div className="step-buttons">
              <button 
                type="button" 
                className="auth-button prev-button"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                type="button" 
                className="auth-button next-button"
                onClick={nextStep}
              >
                Next <FaLongArrowAltRight className="ml-2" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">Security</h3>
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <FaLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <FaLock />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className="step-buttons">
              <button 
                type="button" 
                className="auth-button prev-button"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
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
                    Create your account to track and purchase quality coir products!
                  </p>
                  <div className="auth-progress-steps">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                      <div className="step-icon">
                        <FaIdCard />
                      </div>
                      <span>Personal</span>
                    </div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                      <div className="step-icon">
                        <FaUser />
                      </div>
                      <span>Account</span>
                    </div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                      <div className="step-icon">
                        <FaShieldAlt />
                      </div>
                      <span>Security</span>
                    </div>
                  </div>
                  <div className="auth-alt-action">
                    <span>Already have an account?</span>
                    <Link to="/login" className="auth-alt-link">
                      Sign in
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Panel - Registration Form */}
              <div className="auth-form-panel">
                <div className="auth-form-wrapper">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <h2 className="auth-form-title">Create Account</h2>
                    <p className="auth-form-subtitle">Sign up to access our products and services</p>
                    
                    <form onSubmit={onSubmit}>
                      {renderStepContent()}
                    </form>
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

export default Register; 