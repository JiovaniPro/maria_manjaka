"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import { useAuth } from "@/contexts/AuthContext";
import {
    DashboardIcon,
    TransactionsIcon,
    CategoriesIcon,
    UsersIcon,
    SettingsIcon,
    LogoutIcon,
    IconChurch,
} from "@/components/Icons";

type NavItem = { label: string; icon: any; href: string };
type PreferenceItem = { label: string; icon: any };

const navItems: NavItem[] = [
    { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
    { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
    { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
    { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
];

const preferenceItems: PreferenceItem[] = [
    { label: "Paramètres", icon: SettingsIcon },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        showToast("Déconnexion réussie", "success");
        setTimeout(() => {
            router.replace("/connexion");
        }, 500);
    };

    return (
        <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between bg-black px-6 py-8 text-white">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <IconChurch />
                    <div className="text-sm font-semibold uppercase tracking-[0.3em]">
                        MARIA MANJAKA
                    </div>
                </div>
                <nav className="space-y-6">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                        Menu
                    </p>
                    <ul className="space-y-2">
                        {navItems.map(({ label, icon: Icon, href }) => {
                            const isActive = pathname === href;
                            return (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${isActive
                                                ? "bg-white text-black"
                                                : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <Icon />
                                        <span>{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
            <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Préférences
                </p>
                <ul className="space-y-2">
                    {preferenceItems.map(({ label, icon: Icon }) => (
                        <li key={label}>
                            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
                                <Icon />
                                <span>{label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black"
                >
                    <LogoutIcon />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
