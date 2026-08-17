import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Agar user already logged in hai aur /login open karta hai,
   * to directly chat par bhej do.
   */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/chat", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        console.error("Supabase login error:", loginError);

        if (
          loginError.message
            .toLowerCase()
            .includes("invalid login credentials")
        ) {
          setError("Invalid email or password.");
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.session) {
        setError(
          "Login could not be completed. Please try again."
        );
        return;
      }

      const redirectPath =
        location.state?.from?.pathname ||
        location.state?.from ||
        "/chat";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to sign in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#171717] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/[0.06] blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-100px] h-[360px] w-[360px] rounded-full bg-fuchsia-600/[0.05] blur-[110px]" />
      </div>

      {/* Main */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">

          {/* Brand */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
              <img
                src="/aura-logo.png"
                alt="Aura AI"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="text-[28px] font-semibold tracking-tight">
              Aura AI
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Your personal AI assistant
            </p>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[26px] font-semibold tracking-tight text-white">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue your conversation
              with Aura AI.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-400">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#3b3b3b] bg-[#212121] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-slate-600 hover:border-[#4a4a4a] focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#3b3b3b] bg-[#212121] pl-11 pr-11 text-[14px] text-white outline-none transition placeholder:text-slate-600 hover:border-[#4a4a4a] focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-40"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-[14px] font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Continue"}
              </span>

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#303030]" />

            <span className="text-[11px] uppercase tracking-wider text-slate-600">
              or
            </span>

            <div className="h-px flex-1 bg-[#303030]" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() =>
              alert(
                "Google authentication will be added later."
              )
            }
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#3b3b3b] bg-[#212121] text-[14px] font-medium text-slate-300 transition hover:bg-[#292929] hover:text-white"
          >
            <span className="text-base font-bold">
              G
            </span>

            Continue with Google
          </button>

          {/* Signup */}
          <p className="mt-7 text-center text-[13px] text-slate-500">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/signup")
              }
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Sign up
            </button>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-[10px] leading-5 text-slate-600">
            By continuing, you agree to Aura AI's
            terms and privacy policy.
          </p>

        </div>
      </div>
    </main>
  );
}

export default Login;