"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/app/constants";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/google/callback`, {
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
