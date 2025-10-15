"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header";
export default function ProfilePage() {
  //const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT ?? "3001";
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}` //${BACKEND_PORT}`
    : `https://museground-revised.onrender.com`; //${BACKEND_PORT}`;

  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null,
  );
  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/profile`, {
          method: "GET",
          credentials: "include", // send cookies
        });
        const data = await res.json();
        alert(JSON.stringify(data));
        if (res.ok) {
          setUser(data);
        } else if (res.status === 401) {
          router.push("/login");
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error(err);
        setError("Server error loading profile");
      }
    };

    fetchProfile();
  }, [BACKEND_URL, router]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Header activeTop="Profile" />
      <div className="pt-20 px-4">
        {" "}
        {/*moving this div down by the height of the header*/}
        <h1>Profile</h1>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <button
          onClick={async () => {
            await fetch(`${BACKEND_URL}/auth/logout`, {
              method: "POST",
              credentials: "include",
            });
            router.push("/login");
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
}
