"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!username.trim()) {
            setError("Please enter a username");
            setLoading(false);
            return;
        }

        try {
            const user = await api.login(username);
            // Store token in localStorage for now (simple auth)
            localStorage.setItem("valdi_token", user.token);
            localStorage.setItem("valdi_username", username);
            router.push("/select-modules");
        } catch (error) {
            console.error("Login failed", error);
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-background">
                <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg border border-border">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-card-foreground">
                            Sign in to Valdi
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Access your Kingston University timetable
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="sr-only">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="Username / Student ID"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
