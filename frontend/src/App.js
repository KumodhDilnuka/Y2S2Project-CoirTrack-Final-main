import React from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Existing components
import ItemManagement from './components/Additem';
import Itemshow from './components/Shop';
import EditItem from './components/EditItem';
import Shops from './components/shops';
import PaymentSuccess from './components/PaymentSuccess';
import OrderPending from './components/OrderPendingPage';
import Home from './components/Home/Home';
import PaymentHistory from './components/PaymentHistory';
import AboutUs from './components/Home/AboutUs';

// New components
import AdminOrdersPanel from './components/AdminOrdersPanel';
import OrderStatus from './components/OrderStatus';
import AuthTest from './components/AuthTest';
import Contact from './components/Contact';
import FeedbackForm from './components/FeedbackForm';
import InquiryForm from './components/InquiryForm';
import AdminFeedback from './components/AdminFeedback';
import AdminInquiries from './components/AdminInquiries';
import UserInquiryDetail from './components/UserInquiryDetail';
import EditUserInquiry from './components/EditUserInquiry';

// Stock Management Components
import StockManagement from './components/StockManagement';
import StockInventory from './components/StockInventory';
import StockSuppliers from './components/StockSuppliers';
import StockReports from './components/StockReports';

function App() {
  return (
    <Router>
      <ToastContainer />
      <div>
        <div>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/inquiry" element={<InquiryForm />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/inquiries/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditUserInquiry />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/inquiries/:id" 
              element={
                <ProtectedRoute>
                  <UserInquiryDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pay" 
              element={
                <ProtectedRoute>
                  <OrderPending/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-success" 
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/paymnetHistory" 
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-status/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderStatus />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrdersPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/feedback" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminFeedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/inquiries" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminInquiries />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <ItemManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/itemsshow" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <Itemshow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-item/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <EditItem />
                </ProtectedRoute>
              } 
            />
            
            {/* Stock Management Routes */}
            <Route 
              path="/admin/stock" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <StockManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock/inventory" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <StockInventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock/suppliers" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <StockSuppliers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock/reports" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <StockReports />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;


























