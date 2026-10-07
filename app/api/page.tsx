
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../lib/apiBase";

export default function ApiLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const user = data.user;

        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/customer");
        }
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return <div>Api Login Page Placeholder</div>;
}
