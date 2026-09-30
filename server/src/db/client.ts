import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseSettings } from "@/config/env";
import * as schema from "@/db/schema";

export const createPool = (): Pool =>
    new Pool(
        databaseSettings.connectionString
            ? {
                  connectionString: databaseSettings.connectionString,
                  ssl: databaseSettings.ssl
                      ? { rejectUnauthorized: false }
                      : false,
                  max: databaseSettings.poolMax,
              }
            : {
                  host: databaseSettings.host,
                  port: databaseSettings.port,
                  user: databaseSettings.user,
                  password: databaseSettings.password,
                  database: databaseSettings.database,
                  ssl: databaseSettings.ssl
                      ? { rejectUnauthorized: false }
                      : false,
                  max: databaseSettings.poolMax,
              },
    );

export const pool: Pool = createPool();

export const db = drizzle(pool, { schema });
