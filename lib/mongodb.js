// lib/mongodb.js
const  mongoose = require("mongoose");

const MONGODB_URI = PROCESS.ENV.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please add your Mongo URI to .env.local");
}

let isConnected = null;

export default async function dbConnect() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: "momentum", // make sure this matches your DB name
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}

// // // lib/db.js
// // import mysql from 'mysql2/promise';

// // // Define the configuration for the MySQL connection pool
// // const MYSQL_CONFIG = {
// //   host: process.env.MYSQL_HOST || 'localhost',
// //   port: process.env.MYSQL_PORT || 3306,
// //   user: process.env.MYSQL_USER,
// //   password: process.env.MYSQL_PASSWORD,
// //   database: process.env.MYSQL_DATABASE || 'momentom',
// //   // Pool-specific settings for robustness
// //   waitForConnections: true,
// //   connectionLimit: 10,
// //   queueLimit: 0,
// //   connectTimeout: 10000,
// // };

// // // Immediately fail if essential environment variables are missing
// // if (!MYSQL_CONFIG.user || !MYSQL_CONFIG.password || !MYSQL_CONFIG.database) {
// //   throw new Error('FATAL ERROR: Please define MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE environment variables');
// // }

// // /**
// //  * Global is used here to maintain a cached connection across hot reloads
// //  * in development, and to maintain the connection pool between serverless
// //  * function invocations in production.
// //  */
// // let cached = global.mysql;

// // if (!cached) {
// //   cached = global.mysql = { pool: null, promise: null };
// // }

// // /**
// //  * Establishes a connection to the MySQL database.
// //  * It uses a cached pool to avoid creating new connections on every request.
// //  * It handles concurrent connection attempts gracefully.
// //  * @returns {Promise<import('mysql2/promise').Pool>} A promise that resolves to the connection pool.
// //  */
// // async function dbConnect() {
// //   // If a pool already exists, return it immediately.
// //   if (cached.pool) {
// //     return cached.pool;
// //   }

// //   // If a connection promise doesn't exist, create one. This is the core
// //   // of preventing the "thundering herd" problem.
// //   if (!cached.promise) {
// //     cached.promise = (async () => {
// //       try {
// //         console.log('🟡 Creating new MySQL connection pool...');
// //         const pool = mysql.createPool(MYSQL_CONFIG);

// //         // Test the connection by trying to get a connection from the pool
// //         const connection = await pool.getConnection();
// //         console.log('✅ MySQL Pool created and connection tested successfully.');
// //         connection.release(); // Important: release the connection back to the pool

// //         return pool;
// //       } catch (error) {
// //         console.error('❌ Failed to create MySQL connection pool:', error);
// //         // If creation fails, reset the promise so the next request can try again.
// //         cached.promise = null;
// //         throw error; // Re-throw the error to be caught by the caller
// //       }
// //     })();
// //   }

// //   // Wait for the connection promise to resolve.
// //   // This will be the same promise for all concurrent requests.
// //   try {
// //     cached.pool = await cached.promise;
// //   } catch (error) {
// //     // If the promise was rejected, the pool is null.
// //     // The error will be thrown to the API route that called dbConnect.
// //     cached.pool = null;
// //     throw error;
// //   }

// //   return cached.pool;
// // }

// // export default dbConnect;

// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function mongoConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//       family: 4
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       console.log('✅ MongoDB Connected Successfully');
//       return mongoose;
//     }).catch((error) => {
//       console.error('❌ MongoDB Connection Error:', error);
//       cached.promise = null;
//       throw error;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.conn = null;
//     throw e;
//   }

//   return cached.conn;
// }


// // // Initialize MySQL connection pool and handle caching
// // let cached = global.mysql;

// // if (!cached) {
// //   cached = global.mysql = { pool: null, promise: null };
// // }

// // async function dbConnect() {
// //   if (cached.pool) {
// //     return cached.pool;
// //   }

// //   if (!cached.promise) {
// //     cached.promise = (async () => {
// //       try {
// //         console.log('🟡 Creating new MySQL connection pool...');
// //         const pool = mysql.createPool(MYSQL_CONFIG);

// //         // Test the connection and create database/tables if needed
// //         const connection = await pool.getConnection();
// //         await connection.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_CONFIG.database}`);
// //         await connection.query(`USE ${MYSQL_CONFIG.database}`);
        
// //         // Create tasks table if it doesn't exist
// //         await connection.query(`
// //           CREATE TABLE IF NOT EXISTS tasks (
// //             id INT AUTO_INCREMENT PRIMARY KEY,
// //             title VARCHAR(255) NOT NULL,
// //             description TEXT,
// //             duration INT NOT NULL,
// //             energy ENUM('Low', 'Medium', 'High') NOT NULL,
// //             date VARCHAR(255) NOT NULL,
// //             priority ENUM('low', 'medium', 'high') NOT NULL,
// //             completed BOOLEAN DEFAULT false,
// //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// //             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// //           )
// //         `);

// //         console.log('✅ MySQL Pool created and connection tested successfully.');
// //         connection.release();
// //         return pool;
// //       } catch (error) {
// //         console.error('❌ Failed to create MySQL connection pool:', error);
// //         cached.promise = null;
// //         throw error;
// //       }
// //     })();
// //   }

// //   try {
// //     cached.pool = await cached.promise;
// //   } catch (error) {
// //     cached.pool = null;
// //     throw error;
// //   }

// //   return cached.pool;
// // }

// // export default dbConnect;