import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { getMe } from "../store/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      console.log("Login response:", response.data);

      await dispatch(getMe()).unwrap();

      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log(import.meta.env.VITE_API_URL);

    window.location.href =
      `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#05070D] px-4 py-8 flex items-center justify-center">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="mb-7 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/25">
            N
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Nexora
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Connect. Chat. Stay in sync.
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0B1120] p-7 shadow-2xl shadow-black/40">

          {/* Heading */}
          <div className="mb-6">

            <h2 className="text-2xl font-semibold text-white">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Sign in to continue your conversations.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#263449] bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Password */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#263449] bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">

            <div className="h-px flex-1 bg-[#1E293B]" />

            <span className="text-xs text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-[#1E293B]" />

          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#263449] bg-[#111827] py-3 text-sm font-medium text-slate-200 transition hover:border-[#3B4B63] hover:bg-[#172033]"
          >

            {/* Google Logo */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
              />

              <path
                fill="#34A853"
                d="M12 21.82c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.82Z"
              />

              <path
                fill="#FBBC05"
                d="M6.53 13.89A5.86 5.86 0 0 1 6.22 12c0-.66.11-1.3.31-1.89V7.58H3.29A9.82 9.82 0 0 0 2.18 12c0 1.59.38 3.09 1.11 4.42l3.24-2.53Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.08c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.15 14.63 2.18 12 2.18a9.74 9.74 0 0 0-8.71 5.4l3.24 2.53C7.3 7.8 9.46 6.08 12 6.08Z"
              />
            </svg>

            Continue with Google

          </button>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-slate-400">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Create an account
            </Link>

          </p>

        </div>

        {/* Bottom text */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Secure conversations with Nexora
        </p>

      </div>

    </div>
  );
}

export default Login;