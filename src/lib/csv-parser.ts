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
            });
        }

        return items;
    } catch (error) {
        console.error("Error fetching/parsing CSV:", error);
        return [];
    }
};
