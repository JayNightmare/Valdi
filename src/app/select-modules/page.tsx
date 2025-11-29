"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Module } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";

export default function SelectModulesPage() {
    const router = useRouter();
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [selectedModuleCodes, setSelectedModuleCodes] = useState<Set<string>>(
        new Set()
    );
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState<
        "ALL" | "CI4" | "CI5" | "CI6"
    >("ALL");
    const [sortBy, setSortBy] = useState<"NAME" | "EVENTS">("NAME");

    const filteredModules = allModules
        .filter((m) => {
            if (filterLevel === "ALL") return true;
            return m.code.startsWith(filterLevel);
        })
        .sort((a, b) => {
            if (sortBy === "NAME") {
                return a.name.localeCompare(b.name);
            } else {
                return b.schedule.length - a.schedule.length;
            }
        });

    useEffect(() => {
        const token = localStorage.getItem("valdi_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const modules = await api.getModules(token, []);
                setAllModules(modules);

                // Check if user has saved preferences
                const saved = localStorage.getItem("selected_modules");
                if (saved) {
                    setSelectedModuleCodes(new Set(JSON.parse(saved)));
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const toggleModule = (code: string) => {
        const newSelected = new Set(selectedModuleCodes);
        if (newSelected.has(code)) {
            newSelected.delete(code);
        } else {
            newSelected.add(code);
        }
        setSelectedModuleCodes(newSelected);
    };

    const selectAll = () => {
        const newSelected = new Set(selectedModuleCodes);
        filteredModules.forEach((m) => newSelected.add(m.code));
        setSelectedModuleCodes(newSelected);
    };

    const deselectAll = () => {
        setSelectedModuleCodes(new Set());
    };

    const handleContinue = () => {
        // Save selection to localStorage
        localStorage.setItem(
            "selected_modules",
            JSON.stringify(Array.from(selectedModuleCodes))
        );
        router.push("/dashboard");
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg text-gray-600">Loading modules...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="min-h-screen bg-background py-12 px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            Select Your Modules
                        </h1>
                        <p className="text-muted-foreground">
                            Choose which modules you'd like to see in your
                            timetable
                        </p>
                    </div>

                    <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
                        <div className="flex flex-col space-y-4 mb-6">
                            <div className="flex flex-wrap gap-2 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {(
                                        ["ALL", "CI4", "CI5", "CI6"] as const
                                    ).map((level) => (
                                        <Button
                                            key={level}
                                            variant={
                                                filterLevel === level
                                                    ? "primary"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setFilterLevel(level)
                                            }
                                            className="text-sm h-8"
                                        >
                                            {level === "ALL"
                                                ? "All Levels"
                                                : `Level ${level.replace(
                                                      "CI",
                                                      ""
                                                  )}`}
                                        </Button>
                                    ))}
                                </div>
                                <select
                                    aria-label="Sort modules"
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(
                                            e.target.value as "NAME" | "EVENTS"
                                        )
                                    }
                                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-2 sm:mt-0"
                                >
                                    <option value="NAME">
                                        Sort by Name (A-Z)
                                    </option>
                                    <option value="EVENTS">
                                        Sort by Most Events
                                    </option>
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border gap-2">
                                <div className="text-sm text-muted-foreground">
                                    {selectedModuleCodes.size} selected (
                                    {filteredModules.length} shown)
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={selectAll}
                                        className="text-sm h-8"
                                    >
                                        Select All Shown
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={deselectAll}
                                        className="text-sm h-8"
                                    >
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-2">
                            {filteredModules.map((module) => (
                                <label
                                    key={module.id}
                                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedModuleCodes.has(module.code)
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedModuleCodes.has(
                                            module.code
                                        )}
                                        onChange={() =>
                                            toggleModule(module.code)
                                        }
                                        className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-ring"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-foreground truncate">
                                            {module.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {module.code}
                                        </div>
                                        <div className="text-xs text-muted-foreground/70 mt-1">
                                            {module.schedule.length} events
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            className="px-6"
                        >
                            Skip for Now
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={selectedModuleCodes.size === 0}
                            className="px-8"
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
