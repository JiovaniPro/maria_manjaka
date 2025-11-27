import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
            <Sidebar />
            <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
                {children}
            </main>
        </div>
    );
}
