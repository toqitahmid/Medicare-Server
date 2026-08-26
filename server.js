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
    const appointmentCollection = database.collection("appointments")
    const planCollection = database.collection("plans")
    const paymentCollection = database.collection("payments");

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
            $lte: [{$toDouble: "$consultationFee"}, Number(maxFee)],
        })
       }

       if(minExperience){
        numericFilters.push({
            $gte: [{$toDouble: "$experience"}, Number(minExperience)]
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

   app.get("/api/appointments/:id", async(req,res) => {
    
    try{
      const {id} = req.params;
      const query = {patientId: id};
      const result = await appointmentCollection.find(query).toArray();
      res.send(result);
    }
    catch(err){
      console.error(err);
    }

   })

   app.post("/api/appointments", async(req,res) => {
    try{
      const appointment = req.body;
      const appointmentData = {
        ...appointment,
        createAt: new Date(),
      }

      const result = await appointmentCollection.insertOne(appointmentData);
      res.send(result);
    }
    catch(err){
      console.err("error: ", err);
      res.status(500).send({massege: "Failed to create appointment"})
    }
   })

   app.get("/api/plans", async(req,res) => {
    try{
      const query = {};
      if(req.query.planId){
        query.id = req.query.planId;
      }
      const result = await planCollection.findOne(query);
      res.send(result);
    }
    catch(err){
      console.error(err);
      res.status(500).send({message: "Failed to get plan"})
    }
   })

   app.post("/api/payments", async(req,res) => {
      try{
        const data = req.body;
        const paymentInfo = {
          ...data,
          createdAt: new Date(),
        }
        const result = await paymentCollection.insertOne(paymentInfo);

        const filter = {_id: new ObjectId(data.patientId)};
        const updateDoc = {
          $set: {
            plan: data.planId,
          }
        }
        const updateResult = await patientCollection.updateOne(filter, updateDoc);
        res.send({updateResult,result});
      }
      catch(err){
        console.error('error : ', err);
        res.status(500).send({massege: "Failed to post paymentInfo"});
      }
   })

   app.get("/api/payments/:id", async(req,res) => {
      try{const {id} = req.params;
      const query = {patientId: id};

      const result = await paymentCollection.find(query).toArray();

      res.send(result);}

      catch(err){
        console.error(err);
        res.status(500).send({massege: "failed to get payments"})
      }
   })

  } 
  catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
