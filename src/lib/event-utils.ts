/**
 * Utility functions for event status calculations
 */

export type EventStatus = "starting" | "ongoing" | "finished" | null;

export interface EventStatusInfo {
    status: EventStatus;
    color: string;
    label: string;
}

/**
 * Calculate the progress status of an event based on current time
 * @param startTime - Event start time
 * @param endTime - Event end time
 * @returns EventStatusInfo object with status, color, and label
 */
export function getEventProgressStatus(
    startTime: Date,
    endTime: Date
): EventStatusInfo {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Convert to milliseconds
    const nowMs = now.getTime();
    const startMs = start.getTime();
    const endMs = end.getTime();

    // 10 minutes in milliseconds
    const TEN_MINUTES = 10 * 60 * 1000;

    // Calculate time boundaries
    const startingEndTime = startMs + TEN_MINUTES;
    const finishedStartTime = endMs - TEN_MINUTES;

    // Event hasn't started yet
    if (nowMs < startMs) {
        return { status: null, color: "", label: "" };
    }

    // Event has ended
    if (nowMs > endMs) {
        return { status: null, color: "", label: "" };
    }

    // Starting: within first 10 minutes after start
    if (nowMs >= startMs && nowMs <= startingEndTime) {
        return {
            status: "starting",
            color: "starting",
            label: "Starting",
        };
    }

    // Finished: within last 10 minutes before end
    if (nowMs >= finishedStartTime && nowMs <= endMs) {
        return {
            status: "finished",
            color: "ending",
            label: "Finishing",
        };
    }

    // On-going: everything in between
    return {
        status: "ongoing",
        color: "ongoing",
        label: "On-going",
    };
}
