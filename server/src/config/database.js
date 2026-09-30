const pool = require("../database/db");
const setupDatabase = require("../database/setup");

const connectDatabase = async () => {
    try {
        await pool.query("SELECT NOW()");
        await setupDatabase();
    } catch (error) {
        console.error("❌ Database connection failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;
