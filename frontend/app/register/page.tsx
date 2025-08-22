"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT ?? "3001";
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;

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
      const res = await fetch(`${BACKEND_URL}/auth/register-jwt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
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
    <>
      <h1>Register</h1>
      <form method="POST" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleFormDatachange}
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
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
        <label htmlFor="confirmedPassword">Confirm</label>
        <input
          type="password"
          id="confirmedPassword"
          name="confirmedPassword"
          required
          value={formData.confirmedPassword}
          onChange={handleFormDatachange}
        />
        <button type="submit">Register</button>
      </form>
      {errors.length > 0 && (
        <ul>
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </>
  );
}
