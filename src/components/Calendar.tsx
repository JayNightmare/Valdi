"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ScheduleItem } from "@/lib/types";
import { EventContentArg, EventClickArg } from "@fullcalendar/core";
import {
    X,
    MapPin,
    Clock,
    BookOpen,
    Calendar as CalendarIcon,
    ExternalLink,
    User,
} from "lucide-react";
import { getMapUrl } from "@/lib/csv-parser";
import { getEventProgressStatus } from "@/lib/event-utils";

interface CalendarProps {
    events: ScheduleItem[];
    onViewMap?: (location: string) => void;
}

export default function Calendar({ events, onViewMap }: CalendarProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        const handleResize = () => {
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                if (window.innerWidth < 900) {
                    calendarApi.changeView("timeGridDay");
                    calendarApi.setOption("headerToolbar", {
                        left: "prev,next today",
                        center: "",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    });
                } else {
                    calendarApi.changeView("timeGridWeek");
                    calendarApi.setOption("headerToolbar", {
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    });
                }
            }
        };

        // Set initial view
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Transform ScheduleItems to FullCalendar events
    const calendarEvents = events.map((event) => ({
        id: event.id,
        title:
            event.title.slice(0, 30) + (event.title.length > 30 ? "..." : ""),
        start: event.start,
        end: event.end,
        extendedProps: {
            location: event.location,
            type: event.type,
            moduleCode: event.moduleCode,
            lecturer: event.lecturer,
        },
    }));

    const getEventColor = (type: string) => {
        const normalizedType = type || "";
        if (normalizedType.includes("Lecture")) {
            return "bg-blue-600 border-blue-700 text-white hover:bg-blue-700";
        }
        if (
            normalizedType.includes("lab") ||
            normalizedType.includes("Specialist Computing")
        ) {
            return "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700";
        }
        if (normalizedType.includes("Drop in Session")) {
            return "bg-violet-600 border-violet-700 text-white hover:bg-violet-700";
        }
        if (normalizedType.includes("Placeholder")) {
            return "bg-amber-600 border-amber-700 text-white hover:bg-amber-700";
        } else {
            return "bg-primary border-primary text-primary-foreground hover:bg-primary/90";
        }
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        let location = eventInfo.event.extendedProps.location;
        if (location.includes("PR.")) {
            location = location.slice(3).replace(".", " ");
            location = location.replace(/(\d+).*$/, "$1");
        }

        return (
            <div className="flex flex-col overflow-hidden p-1 h-full w-full cursor-pointer">
                <div className="font-semibold text-xs truncate">
                    {eventInfo.event.title}
                </div>
                <div className="text-[10px] opacity-90 truncate">
                    {eventInfo.timeText}
                </div>
                <div className="text-[10px] opacity-75 truncate">
                    {
                        // slice location if too long
                        location.length > 20
                            ? location.slice(0, 17) + "..."
                            : location
                    }
                </div>
            </div>
        );
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            ...clickInfo.event.extendedProps,
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <>
            <div className="h-full bg-card text-card-foreground p-4 shadow-sm border border-border rounded-lg calendar-wrapper">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={calendarEvents}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    eventClassNames={(arg) =>
                        `transition-colors rounded-md shadow-sm border ${getEventColor(
                            arg.event.extendedProps.type
                        )}`
                    }
                    height="100%"
                    allDaySlot={false}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    expandRows={true}
                    stickyHeaderDates={true}
                    nowIndicator={true}
                    dayMaxEvents={true}
                    selectable={false}
                />
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background text-foreground rounded-xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div
                            className={`p-4 ${getEventColor(
                                selectedEvent.type
                            )}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const statusInfo = getEventProgressStatus(
                                            selectedEvent.start,
                                            selectedEvent.end
                                        );
                                        return statusInfo.status ? (
                                            <div
                                                className={`w-3 h-3 rounded-full ${statusInfo.color} shadow-lg`}
                                                title={statusInfo.label}
                                            />
                                        ) : null;
                                    })()}
                                    <h3 className="text-lg font-bold text-white">
                                        {selectedEvent.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-white/80 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-white/90 text-sm mt-1 font-medium">
                                {selectedEvent.moduleCode}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">
                                        {formatDate(selectedEvent.start)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatTime(selectedEvent.start)} -{" "}
                                        {formatTime(selectedEvent.end)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {selectedEvent.location}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (onViewMap) {
                                                onViewMap(
                                                    selectedEvent.location
                                                );
                                            } else {
                                                window.open(
                                                    getMapUrl(
                                                        selectedEvent.location
                                                    ),
                                                    "_blank"
                                                );
                                            }
                                        }}
                                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5 bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        View on Map <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                                <p className="font-medium capitalize">
                                    {selectedEvent.type}
                                </p>
                            </div>

                            {selectedEvent.lecturer && (
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <p className="font-medium">
                                        {selectedEvent.lecturer}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-muted/50 border-t border-border flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-background border border-input hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
