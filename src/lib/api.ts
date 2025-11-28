import { Course, Module, ScheduleItem, User } from "./types";
import { fetchAndParseTimetable } from "./csv-parser";

const MOCK_DELAY = 500;

const DATA_FILES = [
    "/data/specific/CompSci-Level4_timetable_2526.csv",
    "/data/specific/CompSci-Level5_timetable_2526.csv",
    "/data/specific/CompSci-Level6_timetable_2526.csv",
];

export const api = {
    login: async (username: string): Promise<User> => {
        // Simulating login
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    username,
                    token: "mock-token-123",
                });
            }, MOCK_DELAY);
        });
    },

    getCourses: async (token: string): Promise<Course[]> => {
        // Placeholder: In a real app, we might parse the overview JSONs here.
        // For now, we just return static data or empty.
        return [];
    },

    getModules: async (
        token: string,
        courseIds: string[]
    ): Promise<Module[]> => {
        // Fetch all CSVs
        const allEventsPromises = DATA_FILES.map((url) =>
            fetchAndParseTimetable(url)
        );
        const allEventsArrays = await Promise.all(allEventsPromises);
        const allEvents = allEventsArrays.flat();

        // Group by Module Code to create "Modules"
        const modulesMap = new Map<string, Module>();

        allEvents.forEach((event) => {
            if (!modulesMap.has(event.moduleCode)) {
                modulesMap.set(event.moduleCode, {
                    id: event.moduleCode,
                    name: event.title.split("(")[0].trim(), // Simple heuristic to get name
                    code: event.moduleCode,
                    courseId: "unknown",
                    schedule: [],
                });
            }
            modulesMap.get(event.moduleCode)?.schedule.push(event);
        });

        return Array.from(modulesMap.values());
    },
};
