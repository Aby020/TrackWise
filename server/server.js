require("dotenv").config({ quiet: true });

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDatabase();

    const server = app.listen(PORT, () => {
        console.log(`✅ TrackWise API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`\n${signal} received — shutting down gracefully…`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
});
