import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ThemeProviderCustom, ThemeContext } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboard from "./pages/Onboard";
import PhoneVerification from "./pages/PhoneVerification";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import RBACMatrix from "./pages/RBACMatrix";
import Dashboard from "./pages/Dashboard";
import Header from "./Shared/Header";
import UserRoleMatrix from "./pages/UserRoleMatrix";
import Layout from "./Layout";


function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function AppWithTheme() {
  const { theme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes: no header/layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboard" element={<Onboard />} />
            <Route path="/verify-phone" element={<PhoneVerification />} />

            {/* Protected routes: with header/layout */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Header />
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/roles" element={<Roles />} />
                      <Route path="/permissions" element={<Permissions />} />
                      <Route path="/rbac-matrix" element={<RBACMatrix />} />
                      <Route path="/user-role-matrix" element={<UserRoleMatrix />} />

                      
                      {/* Default route */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProviderCustom>
      <AppWithTheme />
    </ThemeProviderCustom>
  );
}