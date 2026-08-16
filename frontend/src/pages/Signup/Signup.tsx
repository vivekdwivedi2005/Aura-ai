import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      /*
       * Depending on Supabase email confirmation
       * settings, a session may or may not exist
       * immediately after signup.
       */

      if (data.session) {
        navigate("/chat", {
          replace: true,
        });

        return;
      }

      /*
       * Email confirmation is enabled:
       * user needs to verify email first.
       */
      setError(
        "Account created successfully. Please check your email and verify your account before logging in."
      );
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to create your account right now. Please try again."
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[430px]">
          {/* Brand */}
          <div className="mb-9 text-center">
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
            <h2 className="text-[25px] font-semibold tracking-tight">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start your journey with Aura AI.
            </p>
          </div>

          {/* Error / Info */}
          {error && (
            <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSignup}
            className="space-y-5"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-[13px] font-medium text-slate-300"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#3b3b3b] bg-[#212121] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-slate-600 hover:border-[#4a4a4a] focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#3b3b3b] bg-[#212121] pl-11 pr-11 text-[14px] text-white outline-none transition placeholder:text-slate-600 hover:border-[#4a4a4a] focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-40"
                  title={
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[13px] font-medium text-slate-300"
              >
                Confirm password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#3b3b3b] bg-[#212121] pl-11 pr-11 text-[14px] text-white outline-none transition placeholder:text-slate-600 hover:border-[#4a4a4a] focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-40"
                  title={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Create Account */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-[14px] font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </span>

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
          </form>

          {/* Login */}
          <p className="mt-7 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Login
            </button>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-[10px] leading-5 text-slate-600">
            By creating an account, you agree to Aura AI's
            terms and privacy policy.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;