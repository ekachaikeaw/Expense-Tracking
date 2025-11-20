import { loadEnvFile } from "process";
import { MigrationConfig } from "drizzle-orm/migrator";

loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
};

type APIConfig = {
    port: number;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig
}

type JWTConfig = {
    secret: string;
    issuer: string;
    defaultDuration: number;
    refreshDuration: number;
}

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value; 
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations"
};

export const config: Config = {
    api: {
        port: Number(envOrThrow("PORT")),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    jwt: {
        secret: envOrThrow("JWT_SECRET"),
        defaultDuration: 60 * 60, // 1 hour in seconds
        refreshDuration: 60 * 60 * 24 * 60 * 1000, // 60 days in millieseconds
        issuer: "keawman"
    }
}