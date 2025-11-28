"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("valdi_token");
        if (!token) {
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-card shadow-sm border-b border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold text-primary">
                                    Valdi
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    localStorage.removeItem("valdi_token");
                                    router.push("/login");
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
