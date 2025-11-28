"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-2xl text-center space-y-8">
                {/* Logo/Title */}
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Valdi
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Your Kingston University timetable, simplified
                    </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground max-w-md mx-auto">
                    View and manage your Computer Science course schedule with
                    an intuitive calendar interface.
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                    <Button
                        onClick={() => router.push("/login")}
                        size="lg"
                        className="text-lg"
                    >
                        Get Started
                    </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-8 text-sm text-muted-foreground">
                    <div className="space-y-1">
                        <div className="text-2xl">📅</div>
                        <div className="font-medium">Calendar View</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl">🔍</div>
                        <div className="font-medium">Filter Modules</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl">⏰</div>
                        <div className="font-medium">Time Details</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
