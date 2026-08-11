import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate(); // 👈 YAHAN add karna hai

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/70 p-10 backdrop-blur-xl">
        <h1 className="text-center text-4xl font-bold">
          Welcome Back
        </h1>

        <button
          onClick={() => navigate("/chat")}
          className="mt-8 w-full rounded-xl bg-violet-600 py-4 font-semibold hover:bg-violet-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;