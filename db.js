console.log("Try programiz.pro");// What is that url?

const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"

let db = null;

async function connectDB() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        db = client.db();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

function getDB() {
    if (!db) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return db;
}

module.exports = {
    connectDB,
    getDB
};