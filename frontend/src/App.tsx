import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Chat from "./pages/chat/chat";

/* =========================================
   AUTH CHECK
========================================= */

export const isAuthenticated = (): boolean => {
  try {
    return (
      localStorage.getItem("aura-ai-authenticated") ===
      "true"
    );
  } catch {
    return false;
  }
};

/* =========================================
   PROTECTED ROUTE
========================================= */

function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/* =========================================
   APP
========================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;