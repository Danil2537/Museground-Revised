"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../constants";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const { refetchUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const router = useRouter();

  const handleFormDatachange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      //alert(`${BACKEND_URL}/auth/login-jwt`);
      //alert(JSON.stringify(formData));
      const res = await fetch(`${BACKEND_URL}/auth/login-jwt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      //alert(JSON.stringify(data));
      if (res.ok) {
        if (res.ok) {
          await refetchUser(); // ensures AuthProvider has user info
          router.push("/explore/samples");
        }
      } else {
        setError(data?.error ?? "Login failed");
      }
    } catch (err) {
      console.error("Unexpected Error", err);
      setError("Could not connect to server");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800 shadow-xl rounded-2xl p-6">
          {error && (
            <div className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <h1 className="text-2xl font-bold text-center mb-6 text-white-shadow font-suprapower">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                placeholder=" "
                onChange={handleFormDatachange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-white-shadow placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="username"
                className="absolute left-3 top-2 text-cyan-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-cyan-400"
              >
                Username
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder=" "
                value={formData.password}
                onChange={handleFormDatachange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-white-shadow placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-2 text-cyan-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-cyan-400"
              >
                Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-400 text-white font-suprapower font-semibold hover:bg-blue-500 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2 rounded-lg bg-cyan-400 text-white font-suprapower font-semibold hover:bg-blue-500 transition"
            >
              Sign in with Google
            </button>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/register")}
              className="w-full py-2 rounded-lg bg-cyan-400 text-white font-suprapower font-semibold hover:bg-blue-500 transition"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
