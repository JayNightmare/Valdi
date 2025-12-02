import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.valdi.app",
    appName: "Valdi",
    webDir: "out",
    server: {
        androidScheme: "https",
    },
};

export default config;
