 "use client";
 
 import { useEffect, useState } from "react";
 import { useRouter } from "next/navigation";
 import { Sidebar } from "@/components/Sidebar";
 import { LoadingScreen } from "@/components/LoadingScreen";
 
 export default function AdminLayout({
     children,
 }: {
     children: React.ReactNode;
 }) {
     const router = useRouter();
     const [isAuthorized, setIsAuthorized] = useState(false);
 
     useEffect(() => {
         const token = localStorage.getItem("token");
         if (!token) {
             // Pas de session, on renvoie vers la connexion
             router.replace("/connexion");
             return;
         }
         setIsAuthorized(true);
     }, [router]);
 
    if (!isAuthorized) {
        return <LoadingScreen fullScreen />;
    }
 
     return (
         <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
             <Sidebar />
             <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
                 {children}
             </main>
         </div>
     );
 }
