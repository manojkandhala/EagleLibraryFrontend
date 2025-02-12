"use client"

import LoginForm from "@/components/LoginForm"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // User is logged in, redirect to dashboard based on role
      const role = localStorage.getItem("role");
      router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } 
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Eagle Library</h1>
      <LoginForm />
    </main>
  )
}
