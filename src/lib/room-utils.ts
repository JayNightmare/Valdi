export const getRoomDirections = (roomCode: string): string => {
    if (!roomCode) return "";

    // Map of building codes to names
    const buildingMap: Record<string, string> = {
        SB: "Sopwith Building",
        JG: "John Galsworthy Building",
        MB: "Main Building",
        TB: "Town House Building",
        PR: "Penrhyn Road Main Building",
        KH: "Kingston Hill",
        RV: "Roehampton Vale",
        WS: "West Smithfield",
        REG: "Regent Street",
    };

    // Clean up input
    const cleanCode = roomCode.trim().toUpperCase();

    // Regex to separate letters/dots from the number at the end
    // Matches: "SB2025", "PR.JG.1003", "1003"
    const match = cleanCode.match(/^([A-Z\.]+)?\s*(\d{4})$/);

    if (!match) {
        return "Please enter a valid room code (e.g., SB2025 or JG.1003).";
    }

    const prefixPart = match[1] || "";
    const numberPart = match[2];

    // Determine Building Name and Campus
    let buildingName = "the building"; // Default
    let campusName = "";

    const campusMap: Record<string, string> = {
        PR: "Penrhyn Road Campus",
        KH: "Kingston Hill Campus",
        RV: "Roehampton Vale Campus",
    };

    if (prefixPart) {
        // Handle "PR.JG." or "SB"
        // Split by dot, filter empty
        const parts = prefixPart.split(".").filter((p) => p.length > 0);

        // Check for campus in parts
        for (const part of parts) {
            if (campusMap[part]) {
                campusName = campusMap[part];
            }
        }

        // The building code is usually the last part, unless it's just the campus
        const code = parts.length > 0 ? parts[parts.length - 1] : "";

        // If the last part is a campus code, and there are other parts, maybe the building is the one before?
        // But usually format is Campus.Building.Room or just Building.Room
        // If code is a campus code, we might not have a specific building name from the map unless we look at other parts.
        // However, the current map has building codes like JG, SB.
        // Let's stick to: Last part is likely building, unless it IS a campus code and we have no other info?
        // Actually, if I have PR.JG, 'JG' is building. 'PR' is campus.

        if (buildingMap[code]) {
            buildingName = buildingMap[code];
        } else if (parts.length > 0 && !campusMap[code]) {
            // If code not found but exists and is not a campus code
            buildingName = `Building ${code}`;
        } else if (campusMap[code]) {
            // If the "building code" we found is actually a campus code (e.g. input was just "PR.1003")
            // Then we don't have a specific building name, just campus.
            buildingName = "Main Building"; // Fallback or generic? Or just say "the building"
        }
    }

    // Parse Number
    const floorDigit = parseInt(numberPart[0], 10);
    const roomIndex = parseInt(numberPart.substring(1), 10);

    const floorSuffix = (n: number) => {
        const j = n % 10,
            k = n % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    };

    let floorStr = "";
    if (floorDigit === 0) {
        floorStr = "Ground";
    } else {
        floorStr = `${floorDigit}${floorSuffix(floorDigit)}`;
    }

    const roomStr = `${roomIndex}${floorSuffix(roomIndex)}`;

    let locationStr = buildingName;
    if (campusName) {
        locationStr = `${buildingName} at ${campusName}`;
    }

    return `Go to ${locationStr}, go to the ${floorStr} floor and it will be the ${roomStr} room (counting from the left).`;
};
