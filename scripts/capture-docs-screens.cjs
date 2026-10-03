/**
 * Headless screenshot capture for the TrackWise docs.
 *
 * Boots nothing itself — it expects the API server on
 * :5000 and the Vite dev server on :5173 to be running
 * (see README "Local Development Setup").
 *
 * Usage:
 *   node scripts/capture-docs-screens.cjs
 *
 * Output:
 *   docs/screenshots/landing.png
 *   docs/screenshots/login.png
 *   docs/screenshots/demo-dashboard.png
 *   docs/screenshots/admin-console.png
 */

const { chromium } = require("playwright");

const BASE_URL = process.env.CLIENT_BASE_URL || "http://localhost:5173";
const API_URL = process.env.API_BASE_URL || "http://localhost:5000";
const OUT_DIR = "docs/screenshots";

const ADMIN_EMPLOYEE_ID = process.env.ADMIN_EMPLOYEE_ID || "ADMIN001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

const VIEWPORT = { width: 1440, height: 900 };
const THEME_KEY = "tw-theme";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Landmarks the scroll-reveal observer; each must cross the viewport once. */
const REVEAL_STEPS = 6;

const applyDarkTheme = (page) =>
    page.addInitScript((key) => {
        try {
            localStorage.setItem(key, "dark");
        } catch {
            /* storage unavailable — ignore */
        }
    }, THEME_KEY);

const revealPage = async (page) => {
    for (let step = 0; step < REVEAL_STEPS; step += 1) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.85));
        await sleep(450);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(700);
};

const capture = async (browser, { name, path, settleMs = 2500 }) => {
    const page = await browser.newPage({ viewport: VIEWPORT });

    await applyDarkTheme(page);

    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await sleep(settleMs);
    await revealPage(page);

    const file = `${OUT_DIR}/${name}.png`;

    await page.screenshot({ path: file, fullPage: true });
    console.log(`captured ${file}`);

    await page.close();
};

const loginAsAdmin = async (browser) => {
    const page = await browser.newPage({ viewport: VIEWPORT });

    await applyDarkTheme(page);

    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await sleep(1200);

    const identifierInput = page.locator('input[type="text"], input:not([type="password"])').first();
    await identifierInput.fill(ADMIN_EMPLOYEE_ID);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(ADMIN_PASSWORD);

    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle").catch(() => {});
    await sleep(3000);

    const url = page.url();
    const token = await page.evaluate(() => {
        try {
            return localStorage.getItem("token") || "";
        } catch {
            return "";
        }
    });

    await page.close();

    if (!token) {
        throw new Error(`Admin login did not produce a token (landed on ${url}).`);
    }

    console.log(`admin session established (${ADMIN_EMPLOYEE_ID}), landed on ${url}`);

    return token;
};

const captureAdminConsole = async (browser) => {
    const token = await loginAsAdmin(browser);
    const page = await browser.newPage({ viewport: VIEWPORT });

    await page.addInitScript(
        ({ savedToken, key }) => {
            try {
                localStorage.setItem("token", savedToken);
                localStorage.setItem(key, "dark");
            } catch {
                /* storage unavailable — ignore */
            }
        },
        { savedToken: token, key: THEME_KEY },
    );

    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await sleep(3500);
    await revealPage(page);

    const file = `${OUT_DIR}/admin-console.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`captured ${file}`);

    await page.close();
};

const main = async () => {
    const fs = require("fs");

    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const api = await fetch(`${API_URL}/`, { method: "GET" });
    if (!api.ok) {
        throw new Error(`API not reachable at ${API_URL} (status ${api.status}).`);
    }

    const client = await fetch(`${BASE_URL}/`, { method: "GET" });
    if (!client.ok) {
        throw new Error(`Client not reachable at ${BASE_URL} (status ${client.status}).`);
    }

    const browser = await chromium.launch({ headless: true });

    try {
        await capture(browser, { name: "landing", path: "/" });
        await capture(browser, { name: "login", path: "/login" });
        await capture(browser, {
            name: "demo-dashboard",
            path: "/dashboard?demo=true",
            settleMs: 4000,
        });
        await captureAdminConsole(browser);
    } finally {
        await browser.close();
    }

    console.log("All screenshots captured.");
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
