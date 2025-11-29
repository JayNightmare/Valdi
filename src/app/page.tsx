"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Calendar, Filter, Clock, ArrowRight } from "lucide-react";

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
                <div className="w-full max-w-3xl text-center space-y-8">
                    {/* Hero Section */}
                    <div className="space-y-4">
                        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                            Your Timetable <br />
                            <span className="text-primary">Simplified</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Valdi helps Kingston University Computer Science
                            students view and manage their course schedule with
                            a modern, intuitive interface.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 flex justify-center gap-4">
                        <Button
                            onClick={() => router.push("/login")}
                            size="lg"
                            className="text-lg px-8 h-12 rounded-full font-medium"
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg">
                                Calendar View
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Visualize your week at a glance with our clean
                                calendar interface.
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Filter className="h-8 w-8" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg">
                                Smart Filtering
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Easily filter modules to see only what's
                                relevant to your course.
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg">
                                Real-time Updates
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Stay up to date with the latest schedule changes
                                and room info.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40">
                <p>
                    © {new Date().getFullYear()} Valdi. Built for Kingston
                    University Students.
                </p>
            </footer>
        </div>
    );
}
