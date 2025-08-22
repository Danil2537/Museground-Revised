"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT ?? "3001";
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;

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
      const res = await fetch(`${BACKEND_URL}/auth/login-jwt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔹 important to include cookies
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/profile");
      } else {
        const data = await res.json();
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
    <>
      <h1>Login</h1>
      <h3>{error}</h3>
      <form onSubmit={handleLogin}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleFormDatachange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleFormDatachange}
        />
        <button type="submit">Sign In</button>
      </form>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </>
  );
}
