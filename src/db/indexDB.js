import dotenv from 'dotenv';
import { MongoClient } from "mongodb";
import { DB_NAME } from "../constants.js";
dotenv.config()


let db;
let client;

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI
        // 2. DEBUG LOG: Let's see exactly what Node is reading
        console.log("DEBUG: My URI is ->", uri);

        // 3. THIS PREVENTS THE CRASH
        if (!uri) {
            throw new Error("MONGODB_URI is undefined! Check your .env file location and spelling.");
        }
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`Connected to MongoDB natively`)
    }
    catch (err) {
        console.error(`MongoDB connection failed: ${err}`)
        process.exit(1);
    }
}

export default connectDB;
export const getDB = () => db;