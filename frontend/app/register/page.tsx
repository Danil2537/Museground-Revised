"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT ?? "3001";
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}:${BACKEND_PORT}`
    : `http://museground-revised.onrender.com:${BACKEND_PORT}`;

  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });
  const router = useRouter();

  const handleFormDatachange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmedPassword) {
      setErrors(["Passwords don't match"]);
      return;
    }

    setErrors([]);

    try {
      alert(`${BACKEND_URL}/auth/register-jwt`);
      alert(JSON.stringify(formData));
      const res = await fetch(`${BACKEND_URL}/auth/register-jwt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          provider: "local",
        }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setErrors([data?.error ?? "Registration failed"]);
      }
    } catch (error) {
      console.error("Error registering on server", error);
      setErrors(["Server Error Registering User"]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-red-500">
          {errors.length > 0 && (
            <ul>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          <h1 className="text-2xl font-bold font-suprapower text-center mb-6 text-gray-700">
            Register
          </h1>

          <form method="POST" onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder=" "
                value={formData.username}
                onChange={handleFormDatachange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="username"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Username
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder=" "
                value={formData.email}
                onChange={handleFormDatachange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Email Address
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
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Password
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                id="confirmedPassword"
                name="confirmedPassword"
                required
                placeholder=" "
                value={formData.confirmedPassword}
                onChange={handleFormDatachange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor="password2"
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-suprapower  hover:bg-blue-700 transition"
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-suprapower  hover:bg-blue-700 transition"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
