function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/70 p-10 backdrop-blur-xl">
        <h1 className="text-center text-4xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Login to Aura AI
        </p>

        <input
          type="email"
          placeholder="Email"
          className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-violet-500"
        />

        <input
          type="password"
          placeholder="Password"
          className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-violet-500"
        />

        <button className="mt-8 w-full rounded-xl bg-violet-600 py-4 font-semibold hover:bg-violet-700">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;