const http = require("http");

const BASE = "http://localhost:5000";

const request = (method, path, body) =>
    new Promise((resolve, reject) => {
        const req = http.request(
            `${BASE}${path}`,
            { method, headers: { "Content-Type": "application/json" } },
            (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => resolve({ status: res.statusCode, body: data }));
            },
        );
        req.on("error", reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });

const main = async () => {
    let failures = 0;

    // GET /api/shift/current MUST return 200 (or a defined status, never 404).
    const shift = await request("GET", "/api/shift/current");
    console.log(`GET  /api/shift/current                -> ${shift.status}`);
    if (shift.status === 404) {
        failures += 1;
    }

    // POST /api/modern/attendance/punch-in MUST return 200 or 401, never 404.
    const punch = await request("POST", "/api/modern/attendance/punch-in", {});
    console.log(`POST /api/modern/attendance/punch-in  -> ${punch.status}`);
    if (punch.status === 404) {
        failures += 1;
    }

    // Extra coverage for the sibling mounts.
    const modernShift = await request("GET", "/api/modern/shift/current");
    console.log(`GET  /api/modern/shift/current        -> ${modernShift.status}`);
    if (modernShift.status === 404) {
        failures += 1;
    }

    const legacyPunch = await request("POST", "/api/attendance/punch-in", {});
    console.log(`POST /api/attendance/punch-in         -> ${legacyPunch.status}`);
    if (legacyPunch.status === 404) {
        failures += 1;
    }

    if (failures > 0) {
        console.error(`\n${failures} route(s) still return 404.`);
        process.exit(1);
    }

    console.log("\nAll routes resolve (no 404s). PASS.");
};

main().catch((error) => {
    console.error("Verification failed:", error.message);
    process.exit(1);
});
