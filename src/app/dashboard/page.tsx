"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Module, ScheduleItem } from "@/lib/types";
import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [events, setEvents] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModuleCodes, setSelectedModuleCodes] = useState<Set<string>>(
        new Set()
    );
    const [selectedEventTypes, setSelectedEventTypes] = useState<Set<string>>(
        new Set()
    );
    const [availableEventTypes, setAvailableEventTypes] = useState<string[]>(
        []
    );
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("valdi_token") || "";
                const modules = await api.getModules(token, []);
                setAllModules(modules);

                // Extract unique event types
                const types = new Set<string>();
                modules.forEach((m: Module) => {
                    m.schedule.forEach((event) => {
                        if (event.type) types.add(event.type);
                    });
                });
                const sortedTypes = Array.from(types).sort();
                setAvailableEventTypes(sortedTypes);

                // Load saved module preferences
                const saved = localStorage.getItem("selected_modules");
                if (saved) {
                    setSelectedModuleCodes(new Set(JSON.parse(saved)));
                } else {
                    // If no saved prefs, select all by default
                    const allCodes = new Set(
                        modules.map((m: Module) => m.code)
                    );
                    setSelectedModuleCodes(allCodes);
                }

                // Load saved type preferences or select all
                const savedTypes = localStorage.getItem("selected_event_types");
                if (savedTypes) {
                    setSelectedEventTypes(new Set(JSON.parse(savedTypes)));
                } else {
                    setSelectedEventTypes(new Set(sortedTypes));
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Filter events based on selected modules AND event types
        const filteredEvents = allModules
            .filter((m: Module) => selectedModuleCodes.has(m.code))
            .flatMap((m: Module) => m.schedule)
            .filter((event) => selectedEventTypes.has(event.type));
        setEvents(filteredEvents);
    }, [selectedModuleCodes, selectedEventTypes, allModules]);

    const toggleModule = (code: string) => {
        const newSelected = new Set(selectedModuleCodes);
        if (newSelected.has(code)) {
            newSelected.delete(code);
        } else {
            newSelected.add(code);
        }
        setSelectedModuleCodes(newSelected);
        // Save to localStorage
        localStorage.setItem(
            "selected_modules",
            JSON.stringify(Array.from(newSelected))
        );
    };

    const toggleEventType = (type: string) => {
        const newSelected = new Set(selectedEventTypes);
        if (newSelected.has(type)) {
            newSelected.delete(type);
        } else {
            newSelected.add(type);
        }
        setSelectedEventTypes(newSelected);
        // Save to localStorage
        localStorage.setItem(
            "selected_event_types",
            JSON.stringify(Array.from(newSelected))
        );
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                Loading timetable...
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            <div className="w-64 flex-shrink-0 md:inline hidden overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-sm space-y-6">
                {/* Module Filter */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                            Modules
                        </h2>
                        <button
                            onClick={() => router.push("/select-modules")}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                            title="Change module selection"
                        >
                            Edit
                        </button>
                    </div>
                    <div className="space-y-2">
                        {allModules.map((module: Module) => (
                            <div
                                key={module.id}
                                className="flex items-start space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    id={module.id}
                                    checked={selectedModuleCodes.has(
                                        module.code
                                    )}
                                    onChange={() => toggleModule(module.code)}
                                    className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                                />
                                <label
                                    htmlFor={module.id}
                                    className="text-sm text-foreground cursor-pointer select-none"
                                >
                                    <span className="font-medium">
                                        {module.code}
                                    </span>
                                    <br />
                                    <span className="text-xs text-muted-foreground line-clamp-2">
                                        {module.name}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Type Filter */}
                <div className="border-t border-border pt-4">
                    <h2 className="mb-3 text-lg font-semibold text-foreground">
                        Event Types
                    </h2>
                    <div className="space-y-2">
                        {availableEventTypes.map((type) => (
                            <div
                                key={type}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    id={`type-${type}`}
                                    checked={selectedEventTypes.has(type)}
                                    onChange={() => toggleEventType(type)}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                                />
                                <label
                                    htmlFor={`type-${type}`}
                                    className="text-sm text-foreground cursor-pointer select-none"
                                >
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <header className="flex-shrink-0">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                        My Timetable
                    </h1>
                    <p className="text-muted-foreground">
                        {events.length} events showing
                    </p>
                </header>
                {/* Module List Button */}
                <Button
                    variant="outline"
                    className="self-start inline md:hidden"
                    onClick={() => router.push("/select-modules")}
                >
                    Edit Modules
                </Button>
                <div className="flex-1 min-h-0">
                    <Calendar events={events} />
                </div>
            </div>
        </div>
    );
}
