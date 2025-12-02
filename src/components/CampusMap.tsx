"use client";

import React, {
    useState,
    useMemo,
    useRef,
    useEffect,
    useCallback,
} from "react";
import Map, {
    Marker,
    Popup,
    NavigationControl,
    MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Clock, BookOpen } from "lucide-react";
import { getRoomDirections } from "@/lib/room-utils";
import { ScheduleItem } from "@/lib/types";
import "dotenv/config";
import { getEventProgressStatus } from "@/lib/event-utils";

// Placeholder token - user needs to replace this
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Kingston University Penrhyn Road Coordinates
const INITIAL_VIEW_STATE = {
    latitude: 51.4035,
    longitude: -0.3038,
    zoom: 16,
    bearing: 0,
    pitch: 45, // Tilt for 3D effect
};

// Key buildings with coordinates
const BUILDINGS: Record<
    string,
    { name: string; latitude: number; longitude: number; description: string }
> = {
    JG: {
        name: "John Galsworthy Building",
        latitude: 51.40274271591014,
        longitude: -0.30301070618001685,
        description: "Home to lecture theatres and computer labs.",
    },
    TB: {
        name: "Town House",
        latitude: 51.403964956931034,
        longitude: -0.30367553308285655,
        description: "Library, dance studios, and study spaces.",
    },
    MB: {
        name: "Mary Seacole Building",
        latitude: 51.40312365254974,
        longitude: -0.30400819100378135,
        description: "Facilities for health and social care courses.",
    },
    SB: {
        name: "Sopwith Building",
        latitude: 51.402410929352854,
        longitude: -0.30285140547882,
        description: "Engineering and technology workshops.",
    },
    PR: {
        name: "Penrhyn Road Main Building",
        latitude: 51.4035,
        longitude: -0.3038,
        description: "The central hub of the campus.",
    },
};

interface CampusMapProps {
    events?: ScheduleItem[];
    focusLocation?: string | null;
}

export default function CampusMap({
    events = [],
    focusLocation,
}: CampusMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [popupInfo, setPopupInfo] = useState<any>(null);
    const [roomQuery, setRoomQuery] = useState("");
    const [directions, setDirections] = useState("");
    const [mapLoaded, setMapLoaded] = useState(false);

    const handleRoomSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomQuery) return;
        const result = getRoomDirections(roomQuery);
        setDirections(result);
    };

    // Filter events for today
    const todayEvents = useMemo(() => {
        const today = new Date();
        return events.filter((event) => {
            const eventDate = new Date(event.start);
            return (
                eventDate.getDate() === today.getDate() &&
                eventDate.getMonth() === today.getMonth() &&
                eventDate.getFullYear() === today.getFullYear()
            );
        });
    }, [events]);

    // Group events by building
    const buildingEvents = useMemo(() => {
        const grouped: Record<string, ScheduleItem[]> = {};

        todayEvents.forEach((event) => {
            // Extract building code from location (e.g., "PR.JG.1003" -> "JG")
            // Or "SB2025" -> "SB"
            let buildingCode = "";
            const cleanedLocation = event.location.replace(/(\d+).*$/, "$1");
            const loc = cleanedLocation.trim().toUpperCase();

            // Try to match known prefixes
            for (const code of Object.keys(BUILDINGS)) {
                if (loc.includes(code)) {
                    buildingCode = code;
                    break;
                }
            }

            // If found, add to group
            if (buildingCode) {
                if (!grouped[buildingCode]) {
                    grouped[buildingCode] = [];
                }
                grouped[buildingCode].push(event);
            }
        });

        return grouped;
    }, [todayEvents]);

    const focusOnLocation = useCallback(
        (location: string) => {
            if (!mapRef.current) return;

            // Logic to find building
            let buildingCode = "";
            const cleanedLocation = location.replace(/(\d+).*$/, "$1");

            const loc = cleanedLocation.trim().toUpperCase();
            for (const code of Object.keys(BUILDINGS)) {
                if (loc.includes(code)) {
                    buildingCode = code;
                    break;
                }
            }

            const building = BUILDINGS[buildingCode];
            if (building) {
                mapRef.current.flyTo({
                    center: [building.longitude, building.latitude],
                    zoom: 18,
                    pitch: 60,
                    duration: 2000,
                });

                // Find events for this building to show in popup
                const eventsForBuilding = buildingEvents[buildingCode] || [];

                setPopupInfo({
                    ...building,
                    events: eventsForBuilding,
                });
            }
        },
        [buildingEvents]
    );

    useEffect(() => {
        if (focusLocation && mapLoaded) {
            focusOnLocation(focusLocation);
        }
    }, [focusLocation, mapLoaded, focusOnLocation]);

    const handleEventClick = (evt: ScheduleItem) => {
        const cleanedLocation = evt.location.replace(/(\d+).*$/, "$1");

        const loc = cleanedLocation.trim().toUpperCase();

        setRoomQuery(loc);
        setDirections(getRoomDirections(loc));
        // Also ensure we are zoomed in on the building
        focusOnLocation(loc);
    };

    return (
        <div className="h-full w-full flex flex-col rounded-lg overflow-hidden border border-border relative">
            <div className="absolute top-4 left-4 z-10 bg-card p-4 rounded-lg shadow-lg border border-border w-80">
                <h3 className="font-bold mb-2">Find a Room</h3>
                <form onSubmit={handleRoomSearch} className="flex gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="e.g. SB2025"
                        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                        value={roomQuery}
                        onChange={(e) => setRoomQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                    >
                        Search
                    </button>
                </form>
                {directions && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                        <p className="font-medium text-foreground">
                            Directions:
                        </p>
                        <p className="text-muted-foreground">{directions}</p>
                    </div>
                )}
            </div>

            <Map
                ref={mapRef}
                initialViewState={INITIAL_VIEW_STATE}
                mapStyle="mapbox://styles/mapbox/standard"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
                onLoad={() => setMapLoaded(true)}
            >
                <NavigationControl position="bottom-right" />

                {Object.entries(buildingEvents).map(([code, events]) => {
                    const building = BUILDINGS[code];
                    if (!building) return null;

                    return (
                        <Marker
                            key={code}
                            latitude={building.latitude}
                            longitude={building.longitude}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setPopupInfo({
                                    ...building,
                                    events,
                                });
                            }}
                        >
                            <div className="relative group cursor-pointer">
                                <MapPin
                                    className="text-blue-600 w-10 h-10 drop-shadow-lg hover:scale-110 transition-transform"
                                    fill="currentColor"
                                />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                    {events.length}
                                </span>
                            </div>
                        </Marker>
                    );
                })}

                {popupInfo && (
                    <Popup
                        anchor="top"
                        latitude={popupInfo.latitude}
                        longitude={popupInfo.longitude}
                        onClose={() => setPopupInfo(null)}
                        className="text-black min-w-[250px]"
                    >
                        <div className="p-2 max-h-64 overflow-y-auto">
                            <h3
                                className="font-bold text-sm mb-1 cursor-pointer hover:text-blue-600 hover:underline"
                                onClick={() => {
                                    if (mapRef.current) {
                                        mapRef.current.flyTo({
                                            center: [
                                                popupInfo.longitude,
                                                popupInfo.latitude,
                                            ],
                                            zoom: 18,
                                            pitch: 60,
                                            duration: 1500,
                                        });
                                    }
                                }}
                                title="Zoom to building"
                            >
                                {popupInfo.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                                {popupInfo.description}
                            </p>

                            <div className="space-y-2">
                                {popupInfo.events?.map(
                                    (evt: ScheduleItem, i: number) => {
                                        const statusInfo =
                                            getEventProgressStatus(
                                                evt.start,
                                                evt.end
                                            );
                                        return (
                                            <div
                                                key={i}
                                                className="bg-gray-50 p-2 rounded border border-gray-100 text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                                onClick={() =>
                                                    handleEventClick(evt)
                                                }
                                                title="Get directions"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {statusInfo.status && (
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${statusInfo.color} flex-shrink-0`}
                                                            title={
                                                                statusInfo.label
                                                            }
                                                        />
                                                    )}
                                                    <div className="font-semibold text-blue-700 truncate">
                                                        {evt.title}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                    <Clock size={10} />
                                                    <span>
                                                        {new Date(
                                                            evt.start
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 mt-0.5">
                                                    <BookOpen size={10} />
                                                    <span>{evt.location}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
