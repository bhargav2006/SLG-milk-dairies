import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import MainLayout from "../layouts/MainLayout";

// Import pages
import Login from "../pages/Login";
// import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import AddEditProduct from "../pages/AddEditProduct";
import CreateBill from "../pages/CreateBill";
import Bills from "../pages/Bills";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import BillReceiptStandalone from "../pages/BillReceiptStandalone";
import DeliveryOrderStandalone from "../pages/DeliveryOrderStandalone";
import LandingPage from "../pages/LandingPage";
import About from "../pages/About";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import Orders from "../pages/Orders";
import DeliveryLogin from "../pages/DeliveryLogin";
import DeliveryDashboard from "../pages/DeliveryDashboard";
import TrackOrders from "../pages/TrackOrders";

// Import error pages
import { NotFoundPage, UnauthorizedPage } from "../pages/Errors";

// Delivery Boy Protected Route Wrapper
const DeliveryProtectedRoute = () => {
  const token = localStorage.getItem("delivery_token");
  if (!token) {
    return <Navigate to="/delivery/login" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
       <Route path="/bill/:invoiceNumber" element={<BillReceiptStandalone />} />
      <Route path="/delivery-order/:orderNumber" element={<DeliveryOrderStandalone />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<About />} />
      <Route path="/track-orders" element={<TrackOrders />} />
      
      {/* Delivery Boy Public & Protected Routes */}
      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route element={<DeliveryProtectedRoute />}>
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      </Route>

      {/* Protected Routes (Admin + Accountant) */}
      <Route
        element={<ProtectedRoute allowedRoles={["admin", "accountant"]} />}>
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />
        <Route
          path="/bills"
          element={
            <MainLayout>
              <Bills />
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout>
              <Orders />
            </MainLayout>
          }
        />
        <Route
          path="/bills/create"
          element={
            <MainLayout>
              <CreateBill />
            </MainLayout>
          }
        />
        <Route
          path="/billing/retail"
          element={
            <MainLayout>
              <CreateBill key="retail" billType="retail" />
            </MainLayout>
          }
        />
        <Route
          path="/billing/wholesale"
          element={
            <MainLayout>
              <CreateBill key="wholesale" billType="wholesale" />
            </MainLayout>
          }
        />

        {/* Admin Only Views */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/products/add"
            element={
              <MainLayout>
                <AddEditProduct />
              </MainLayout>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <MainLayout>
                <AddEditProduct />
              </MainLayout>
            }
          />
          <Route
            path="/bills/edit/:invoiceNumber"
            element={
              <MainLayout>
                <CreateBill isEditMode={true} />
              </MainLayout>
            }
          />
          <Route
            path="/users"
            element={
              <MainLayout>
                <Users />
              </MainLayout>
            }
          />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
