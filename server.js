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
    const appointmentCollection = database.collection("appointments");
    const planCollection = database.collection("plans");
    const paymentCollection = database.collection("payments");
    const prescriptionCollection = database.collection("precriptions")

    // ----------- doctors api --------------
    app.get("/api/doctors", async (req, res) => {
      try {
        const { role, specialization, minExperience, maxFee } = req.query;
        const query = {};
        if (role === "doctor") {
          query.role = req.query.role;
        }

        if (specialization) {
          query.specialization = { $regex: specialization, $options: "i" };
        }

        const numericFilters = [];
        if (maxFee) {
          numericFilters.push({
            $lte: [{ $toDouble: "$consultationFee" }, Number(maxFee)],
          });
        }

        if (minExperience) {
          numericFilters.push({
            $gte: [{ $toDouble: "$experience" }, Number(minExperience)],
          });
        }

        if (numericFilters.length > 0) {
          query.$expr = { $and: numericFilters };
        }

        const cursor = doctorsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch doctors" });
      }
    });

    app.get("/api/doctors/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const cursor = { _id: new ObjectId(id) };
        const result = await doctorsCollection.findOne(cursor);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch doctor by id" });
      }
    });

    app.get("/api/doctors/appointments/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { doctorId: id };
        const result = await appointmentCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.get("/api/doctors/user/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { userId: id };
        const result = await doctorsCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ error: "doctor not found" });
        }
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "failed to fetch doctor by user id" });
      }
    });

    app.get("/api/doctors/appointments/today/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const today = new Date().toLocaleDateString("en-CA");

        const query = { doctorId: id, appointmentDate: today };
        const result = await appointmentCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.patch("/api/doctors/update_schedule/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { availableDays, availableSlots } = req.body;

        if (!availableDays || !availableSlots) {
          return res.status(400).json({
            success: false,
            message: "Both availableDays and availableSlots are required.",
          });
        }

        const formattedDays = Array.isArray(availableDays)
          ? availableDays.join(", ")
          : availableDays;

        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            availableDays: formattedDays,
            availableSlots: availableSlots,
          },
        };

        const result = await doctorsCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found.",
          });
        }

        res.status(200).json({
          success: true,
          message: "Schedule updated successfully.",
        });
      } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error.",
          error: error.message,
        });
      }
    });

    app.patch("/api/appointments/update/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { appointmentStatus } = req.body;

        if (!appointmentStatus) {
          return res.status(400).send({
            success: false,
            message: "appointmentStatus is required.",
          });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            appointmentStatus: appointmentStatus,
          },
        };

        const result = await appointmentCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Appointment not found.",
          });
        }

        res.send({
          success: true,
          message: `Appointment status updated to ${appointmentStatus}`,
          result,
        });
      } catch (err) {
        console.error("Error updating appointment status:", err);
        res.status(500).send({
          success: false,
          message: "Failed to update appointment status",
        });
      }
    });

    // ----------- patients api --------------
    app.get("/api/patients/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { userId: id };
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

    app.get("/api/appointments/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { patientId: id };
        const result = await appointmentCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.post("/api/appointments", async (req, res) => {
      try {
        const appointment = req.body;
        const appointmentData = {
          ...appointment,
          createAt: new Date(),
        };

        const result = await appointmentCollection.insertOne(appointmentData);
        res.send(result);
      } catch (err) {
        console.err("error: ", err);
        res.status(500).send({ massege: "Failed to create appointment" });
      }
    });

    // -------------- plans api ---------------
    app.get("/api/plans", async (req, res) => {
      try {
        const query = {};
        if (req.query.planId) {
          query.id = req.query.planId;
        }
        const result = await planCollection.findOne(query);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to get plan" });
      }
    });

    // ------------- payments api -------------
    app.post("/api/payments", async (req, res) => {
      try {
        const data = req.body;
        const paymentInfo = {
          ...data,
          createdAt: new Date(),
        };
        const result = await paymentCollection.insertOne(paymentInfo);

        const filter = { _id: new ObjectId(data.patientId) };
        const updateDoc = {
          $set: {
            plan: data.planId,
          },
        };
        const updateResult = await patientCollection.updateOne(
          filter,
          updateDoc,
        );
        res.send({ updateResult, result });
      } catch (err) {
        console.error("error : ", err);
        res.status(500).send({ massege: "Failed to post paymentInfo" });
      }
    });

    app.get("/api/payments/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { patientId: id };

        const result = await paymentCollection.find(query).toArray();

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ massege: "failed to get payments" });
      }
    });


    // ------------- prescription api ------------
    app.post("/api/prescriptions", async (req, res) => {
      try {
        const {
          doctorId,
          doctorName,
          patientId,
          appointmentId,
          notes,
          medicines,
        } = req.body;

        // Validate required fields
        if (!doctorId || !patientId || !appointmentId) {
          return res
            .status(400)
            .send({
              message: "Missing required appointment, doctor, or patient ID",
            });
        }

        const prescriptionData = {
          doctorId,
          doctorName: doctorName || "",
          patientId,
          appointmentId,
          notes: notes || "",
          medicines: medicines || [],
          createAt: new Date(),
        };

        const result = await prescriptionCollection.insertOne(prescriptionData);
        res.send(result);
      } catch (err) {
        console.error("error: ", err);
        res.status(500).send({ message: "Failed to create prescription" });
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
