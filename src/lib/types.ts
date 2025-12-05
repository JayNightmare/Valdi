export interface Course {
    id: string;
    name: string;
    code: string;
}

export interface Module {
    id: string;
    name: string;
    code: string;
    courseId: string;
    schedule: ScheduleItem[];
}

export interface ScheduleItem {
    id: string;
    title: string;
    start: Date;
    end: Date;
    location: string;
    type: string; // Changed to string to accommodate CSV values
    moduleCode: string; // Added for filtering
    lecturer?: string; // Staff member(s) from CSV
}

export interface User {
    username: string;
    token: string;
}
