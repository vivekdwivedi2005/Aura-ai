import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Chat from "./pages/chat/chat";
import { supabase } from "./lib/supabase";

/* =========================================
   PROTECTED ROUTE
========================================= */

function ProtectedRoute() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session check failed:",
            error
          );

          if (mounted) {
            setAuthenticated(false);
            setLoading(false);
          }

          return;
        }

        if (mounted) {
          setAuthenticated(Boolean(session));
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (mounted) {
          setAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkSession();

    /*
     * Listen for login/logout/session changes.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setAuthenticated(Boolean(session));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* Loading */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#171717] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

          <p className="text-sm text-slate-500">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /* Not authenticated */
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
        }}
        replace
      />
    );
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
        {/* Public routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/chat"
            element={<Chat />}
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;