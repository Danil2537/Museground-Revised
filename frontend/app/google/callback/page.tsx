"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("http://localhost:3001/auth/google/callback", {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("access_token", data.access_token);
          router.push("/profile");
        } else {
          console.error("Google login failed", data);
        }
      } catch (err) {
        console.error("Error during Google login:", err);
      }
    };

    fetchToken();
  }, [router]);

  return <p>Logging in with Google...</p>;
}
