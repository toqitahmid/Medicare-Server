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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const patientCollection = database.collection("patients");

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
     } catch (err) {
       console.error(err);
       res.status(500).send({ error: "Failed to fetch doctors" });
     }
   });

   app.get("/api/doctors/:id", async(req,res) => {
       
       try{
            const {id} = req.params;
            const cursor = {_id: new ObjectId(id)};
            const result = await doctorsCollection.findOne(cursor);
            res.send(result);
        }
        catch(err){
            console.error(err);
            res.status(500).send({ error: "Failed to fetch doctor by id" });
        }
   })

   app.get("/api/patients/:id", async (req, res) => {
   try {
     const { id } = req.params;
     const query = { userId: id};
     const result = await patientCollection.findOne(query);
     if (!result) {
       return res.status(404).send({ error: "patient not found" });
     }
     res.send(result);
   } catch (err) {
     console.error(err);
     res.status(500).send({ error: "failed to fetch patient by id" });
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
