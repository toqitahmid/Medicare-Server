require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {


  try {
    await client.connect();
    const database = client.db("medicare_db");
    const doctorsCollection = database.collection("doctors");

   app.get("/api/doctors", async (req, res) => {
     try {
        
        const {role, specialization, minExperience, maxFee} = req.query;
       const query = {};
       if (role === "doctor") {
         query.role = req.query.role;
       }

       if(specialization){
        query.specialization = {$regex: specialization, $options: "i"}
       }

       const numericFilters = [];
       if(maxFee){
        numericFilters.push({
            $lte: [{$toDouble: "consultationFee"}, Number(maxFee)],
        })
       }

       if(minExperience){
        numericFilters.push({
            $gte: [{$toDouble: "experience"}, Number(minExperience)]
        });
       }

       if(numericFilters.length > 0){
        query.$expr = {$and: numericFilters};
       }

       const cursor = doctorsCollection.find(query);
       const result = await cursor.toArray();
       res.send(result);
     } catch (error) {
       console.error(error);
       res.status(500).send({ error: "Failed to fetch doctors" });
     }
   });



  } 
  catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
