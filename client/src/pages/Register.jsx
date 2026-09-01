import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

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

      const response = await api.post(
        "/auth/register",
        formData
      );

      setSuccess(
        response.data.message || "Registration successful"
      );

      console.log(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
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

        {/* Register Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0B1120] p-7 shadow-2xl shadow-black/40">

          {/* Heading */}
          <div className="mb-6">

            <h2 className="text-2xl font-semibold text-white">
              Create your account
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Join Nexora and start connecting.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-[#263449] bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

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
                placeholder="Create a password"
                className="w-full rounded-xl border border-[#263449] bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-slate-400">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Sign in
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

export default Register;