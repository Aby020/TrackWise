require("dotenv").config({ quiet: true });

// The Express app and DB connection live as plain JS in src/ and are
// intentionally not compiled into dist/ (tsconfig excludes *.js), so the
// compiled entrypoint reaches back into the checked-out src/ tree.
const app = require("../src/app");
const connectDatabase = require("../src/config/database");

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    await connectDatabase();

    const server = app.listen(PORT, () => {
        console.log(`✅ TrackWise API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string): void => {
        console.log(`\n${signal} received — shutting down gracefully…`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error: Error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
});
