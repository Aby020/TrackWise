const { Pool } = require("pg");
require("dotenv").config({ quiet: true });

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
          }
        : {
              host: process.env.DB_HOST || "localhost",
              port: Number(process.env.DB_PORT) || 5432,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
          },
);

module.exports = pool;
