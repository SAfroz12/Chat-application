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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 mb-4">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white"
            >
              <path
                d="M5 6.5C5 5.67 5.67 5 6.5 5h11C18.33 5 19 5.67 19 6.5v7c0 .83-.67 1.5-1.5 1.5H12l-4.5 4V15H6.5C5.67 15 5 14.33 5 13.5v-7Z"
                fill="currentColor"
              />
            </svg>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Nexora
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Connect. Chat. Stay in sync.
          </p>

        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/60 p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sign in to continue your conversations.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs text-gray-400">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-400"
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
          <p className="text-sm text-center text-gray-500 mt-7">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </Link>

          </p>

        </div>

    

      </div>

    </div>
  );
}

export default Login;