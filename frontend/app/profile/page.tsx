"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../constants";
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

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
