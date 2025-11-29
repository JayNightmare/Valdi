"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("valdi_token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        <span className="font-heading text-xl font-bold text-foreground">
                            Valdi
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://github.com/JayNightmare/Valdi"
                        target="_blank"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        GitHub
                    </Link>
                    <ModeToggle />
                    <div>
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
