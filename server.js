require("dotenv").config();
const express = require("express");
const app = express();
const PORT  = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send("Server is up and running");
})

const {MongoClient, ServerApiVersion} = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri,{
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try{
        await client.connect();
        const database = client.db("medicare_db");
    }
    catch(error){
        console.log(error)
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});