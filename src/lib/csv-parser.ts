import { ScheduleItem } from "./types";
import moment from "moment";

interface CsvRow {
    [key: string]: string;
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                // Escaped quote
                currentValue += '"';
                i++;
            } else {
                // Toggle quotes
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            // End of value
            values.push(currentValue);
            currentValue = "";
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue);
    return values;
}

// Format staff member names from "LAST, FIRST" format to "First Last"
// Handles multiple staff members in the format "LAST1, FIRST1, LAST2, FIRST2"
function formatStaffNames(staffColumn: string): string {
    if (!staffColumn || staffColumn.trim() === "") {
        return "";
    }

    // Split by comma and trim whitespace
    const parts = staffColumn.split(",").map((part) => part.trim());

    // If we have no parts, return empty string
    if (parts.length === 0) {
        return "";
    }

    // Helper function to capitalize first letter and lowercase the rest
    const toProperCase = (name: string): string => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    const formattedNames: string[] = [];

    // If we have 2 or fewer parts, it's a single person: LAST, FIRST
    if (parts.length <= 2) {
        if (parts.length === 2) {
            const firstName = toProperCase(parts[1]);
            const lastName = toProperCase(parts[0]);
            formattedNames.push(`${firstName} ${lastName}`);
        } else {
            // Only one name part, just capitalize it
            formattedNames.push(toProperCase(parts[0]));
        }
    } else {
        // Multiple people: iterate through pairs (LAST, FIRST)
        for (let i = 0; i < parts.length; i += 2) {
            if (i + 1 < parts.length) {
                const lastName = toProperCase(parts[i]);
                const firstName = toProperCase(parts[i + 1]);
                formattedNames.push(`${firstName} ${lastName}`);
            } else {
                // Odd number of parts, handle the last one
                formattedNames.push(toProperCase(parts[i]));
            }
        }
    }

    return formattedNames.join(", ");
}

export const fetchAndParseTimetable = async (
    url: string
): Promise<ScheduleItem[]> => {
    try {
        const response = await fetch(url);
        const text = await response.text();

        const lines = text.split("\n");
        // Find the header row
        const headerRowIndex = lines.findIndex((line) =>
            line.includes('"Description","Module code"')
        );

        if (headerRowIndex === -1) {
            console.error("Could not find header row in CSV:", url);
            return [];
        }

        const headers = parseCSVLine(lines[headerRowIndex]).map((h) =>
            h.trim()
        );

        const items: ScheduleItem[] = [];

        for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);

            // Map values to headers
            const row: CsvRow = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || "";
            });

            if (!row["Start date"] || !row["Start time"]) continue;

            const startDateTime = moment(
                `${row["Start date"]} ${row["Start time"]}`,
                "YYYY-MM-DD HH:mm"
            ).toDate();
            const endDateTime = moment(
                `${row["End date"]} ${row["End time"]}`,
                "YYYY-MM-DD HH:mm"
            ).toDate();

            items.push({
                id: `${row["Module code"]}-${i}`,
                title: row["Description"],
                start: startDateTime,
                end: endDateTime,
                location: row["Room(s)"],
                type: row["Type"],
                moduleCode: row["Module code"],
                lecturer: formatStaffNames(row["Staff member(s)"]),
            });
        }

        return items;
    } catch (error) {
        console.error("Error fetching/parsing CSV:", error);
        return [];
    }
};

export const getMapUrl = (location: string): string => {
    if (!location) return "";

    // Base Google Maps Search URL
    const baseUrl = "https://www.google.com/maps/search/?api=1&query=";

    // Map common Kingston University prefixes to full names for better search accuracy
    const campusMap: Record<string, string> = {
        PR: "Penrhyn Road Campus",
        KH: "Kingston Hill Campus",
        RV: "Roehampton Vale Campus",
        JG: "John Galsworthy Building",
        MB: "Main Building",
        TB: "Town House Building",
        WS: "West Smithfield",
        REG: "Regent Street",
    };

    // Split by "." to handle codes like "PR.JG.1003"
    const parts = location.split(".");

    // Expand known abbreviations
    const expandedParts = parts.map((part) => {
        // Remove any trailing numbers or extra chars if mixed (simple check)
        const cleanPart = part.trim();
        return campusMap[cleanPart] || cleanPart;
    });

    // Construct the query
    // If we expanded something, it's likely a valid building code.
    // We prepend "Kingston University" to ensure we get the university building, not a generic street.
    const query = `Kingston University ${expandedParts.join(" ")}`;

    return `${baseUrl}${encodeURIComponent(query)}`;
};
