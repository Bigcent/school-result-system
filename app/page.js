"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}
