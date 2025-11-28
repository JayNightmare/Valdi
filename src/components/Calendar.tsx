"use client";

import {
    Calendar as BigCalendar,
    momentLocalizer,
    Event,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ScheduleItem } from "@/lib/types";

const localizer = momentLocalizer(moment);

interface CalendarProps {
    events: ScheduleItem[];
}

// Custom event component to display time
const EventComponent = ({ event }: { event: Event }) => {
    const scheduleEvent = event as ScheduleItem;
    const startTime = moment(scheduleEvent.start).format("HH:mm");
    const endTime = moment(scheduleEvent.end).format("HH:mm");

    return (
        <div className="flex flex-col h-full">
            <div className="font-semibold text-xs truncate">
                {scheduleEvent.title}
            </div>
            <div className="text-xs opacity-90">
                {startTime} - {endTime}
            </div>
            <div className="text-xs opacity-75 truncate">
                {scheduleEvent.location}
            </div>
        </div>
    );
};

export default function Calendar({ events }: CalendarProps) {
    return (
        <div className="h-full bg-card text-card-foreground p-4 shadow-sm border border-border rounded-lg">
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={["month", "week", "day"]}
                defaultView="week"
                components={{
                    event: EventComponent,
                }}
            />
        </div>
    );
}
