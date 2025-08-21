"use client"
import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState<{username:string, email:string}|null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Not logged in");
      return;
    }

    fetch("http://localhost:3001/auth/profile", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
    
    .then(res => res.json())
    .then(data => setProfile(data))
    .catch(err => setError("Failed to load profile"));
  }, []);

  if (error) return <h3>{error}</h3>;
  if (!profile) return <h3>Loading...</h3>;

  return (
    <>
      <h1>Profile</h1>
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
    </>
  );
}