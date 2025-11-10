"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinedSchema = exports.rewardsSchema = exports.eventsSchema = exports.learningSchema = exports.viralSchema = exports.userSchema = exports.authSchema = exports.db = void 0;
exports.getDbInstance = getDbInstance;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var pg_1 = require("pg");
var node_postgres_1 = require("drizzle-orm/node-postgres");
var authSchema = require("./auth-schema");
exports.authSchema = authSchema;
var userSchema = require("./user-schema");
exports.userSchema = userSchema;
var viralSchema = require("./viral-schema");
exports.viralSchema = viralSchema;
var learningSchema = require("./learning-schema");
exports.learningSchema = learningSchema;
var eventsSchema = require("./events-schema");
exports.eventsSchema = eventsSchema;
var rewardsSchema = require("./rewards-schema");
exports.rewardsSchema = rewardsSchema;
// Combine all schemas for Drizzle adapter
var combinedSchema = __assign(__assign(__assign(__assign(__assign(__assign({}, authSchema), userSchema), viralSchema), learningSchema), eventsSchema), rewardsSchema);
exports.combinedSchema = combinedSchema;
var dbInstance = null;
function getDb() {
    if (dbInstance) {
        return dbInstance;
    }
    var databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }
    // Detect Neon vs standard Postgres
    // Neon uses postgres:// with @neon.tech or neon.tech in the host
    // Standard Postgres uses pg package with Pool
    var isNeon = databaseUrl.includes("neon.tech") || databaseUrl.includes("@neon");
    if (isNeon) {
        // Use postgres client for Neon
        var client = (0, postgres_1.default)(databaseUrl, {
            max: 1, // Neon serverless works best with max 1 connection
        });
        dbInstance = (0, postgres_js_1.drizzle)(client, { schema: combinedSchema });
    }
    else {
        // Use pg Pool for standard Postgres
        var pool = new pg_1.Pool({
            connectionString: databaseUrl,
        });
        dbInstance = (0, node_postgres_1.drizzle)(pool, { schema: combinedSchema });
    }
    return dbInstance;
}
// Lazy initialization - only create connection when actually used
exports.db = new Proxy({}, {
    get: function (_target, prop) {
        return getDb()[prop];
    },
});
// Export function to get the actual db instance for adapters that need it
function getDbInstance() {
    return getDb();
}
