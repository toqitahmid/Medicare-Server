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
    const usersCollection = database.collection("user");
    const doctorsCollection = database.collection("doctors");
    const patientCollection = database.collection("patients");
    const appointmentCollection = database.collection("appointments");
    const planCollection = database.collection("plans");
    const paymentCollection = database.collection("payments");
    const prescriptionCollection = database.collection("precriptions");
    const reviewCollection = database.collection("reviews");

    // ----------- admin's api -------------
    // Put these FIRST
    app.get("/api/admin/users", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.status(200).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "failed to fetch users" });
      }
    });

    app.get("/api/admin/doctors", async (req, res) => {
      try {
        const result = await doctorsCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "failed to fetch doctors" });
      }
    });

    app.get("/api/admin/patients", async (req, res) => {
      try {
        const result = await patientCollection.find().toArray();
        res.status(200).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "failed to fetch patients" });
      }
    });

    app.get("/api/admin/appointments", async (req, res) => {
      try {
        const result = await appointmentCollection.find().toArray();
        res.status(200).send(result);
      } catch (err) {
        res.status(500).send({ message: "failed to fetch appointments" });
      }
    });

    app.get("/api/admin/reviews", async (req, res) => {
      try {
        const result = await reviewCollection.find().toArray();
        res.status(200).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "failed to fetch reviews" });
      }
    });

    // This MUST come LAST among /api/admin/* routes
    app.get("/api/admin/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch admin data" });
      }
    });

    app.patch("/api/admin/patients/:patientId", async (req, res) => {
      try {
        const { patientId } = req.params;
        const { verificationStatus } = req.body;

        if (!verificationStatus) {
          return res
            .status(400)
            .json({ message: "verificationStatus is required." });
        }

        if (!ObjectId.isValid(patientId)) {
          return res.status(400).json({ message: "Invalid patientId." });
        }

        const result = await patientCollection.findOneAndUpdate(
          { _id: new ObjectId(patientId) },
          { $set: { verificationStatus } },
          { returnDocument: "after" }, // v3.x driver: use { returnOriginal: false }
        );

        const updatedPatient = result?.value ?? result;

        if (!updatedPatient) {
          return res.status(404).json({ message: "Patient not found." });
        }

        return res.status(200).json({
          message: "Patient status updated successfully",
          patient: updatedPatient,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    app.patch("/api/admin/doctors/:doctorId", async (req, res) => {
      try {
        const { doctorId } = req.params;
        const { verificationStatus } = req.body;

        if (!verificationStatus) {
          return res
            .status(400)
            .json({ message: "verificationStatus is required." });
        }

        if (!ObjectId.isValid(doctorId)) {
          return res.status(400).json({ message: "Invalid patientId." });
        }

        const result = await doctorsCollection.findOneAndUpdate(
          { _id: new ObjectId(doctorId) },
          { $set: { verificationStatus } },
          { returnDocument: "after" }, // v3.x driver: use { returnOriginal: false }
        );

        const updatedDoctor = result?.value ?? result;

        if (!updatedDoctor) {
          return res.status(404).json({ message: "Patient not found." });
        }

        return res.status(200).json({
          message: "Patient status updated successfully",
          patient: updatedDoctor,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

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

    app.patch("/api/admin/patients/:patientId", async (req, res) => {
      try {
        const { patientId } = req.params;
        const { verificationStatus } = req.body;

        if (!verificationStatus) {
          return res
            .status(400)
            .json({ message: "verificationStatus is required." });
        }

        if (!ObjectId.isValid(patientId)) {
          return res.status(400).json({ message: "Invalid patientId." });
        }

        const result = await patientCollection.findOneAndUpdate(
          { _id: new ObjectId(patientId) },
          { $set: { verificationStatus } },
          { returnDocument: "after" }, // driver v4+; use { returnOriginal: false } on older versions
        );

        // Some driver versions return the doc directly, others wrap it as { value: doc }
        const updatedPatient = result?.value ?? result;

        if (!updatedPatient) {
          return res.status(404).json({ message: "Patient not found." });
        }

        return res.status(200).json({
          message: "Patient status updated successfully",
          patient: updatedPatient,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ message: "Internal server error" });
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
          return res.status(400).send({
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

    app.get("/api/prescriptions/doctors/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const prescription = await prescriptionCollection
          .find({
            doctorId: id,
          })
          .toArray();

        if (!prescription) {
          return res.status(404).send({ message: "Prescription not found" });
        }

        res.send(prescription);
      } catch (err) {
        console.error("Error fetching prescription: ", err);
        res.status(500).send({ message: "Failed to fetch prescription" });
      }
    });
    app.get("/api/prescriptions/patients/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const prescription = await prescriptionCollection
          .find({
            doctorId: id,
          })
          .toArray();

        if (!prescription) {
          return res.status(404).send({ message: "Prescription not found" });
        }

        res.send(prescription);
      } catch (err) {
        console.error("Error fetching prescription: ", err);
        res.status(500).send({ message: "Failed to fetch prescription" });
      }
    });

    // ------------- review api ----------------
    app.post("/api/reviews", async (req, res) => {
      try {
        const {
          appointmentId,
          patientId,
          patientName,
          doctorId,
          doctorName,
          rating,
          reviewText,
        } = req.body;

        // Validate required fields
        if (!appointmentId || !doctorId || !rating || !reviewText) {
          return res.status(400).send({
            message: "Missing required fields for review submission",
          });
        }

        const reviewData = {
          appointmentId,
          patientId,
          patientName: patientName || "Anonymous Patient",
          doctorId,
          doctorName: doctorName || "",
          rating: Number(rating),
          reviewText: reviewText.trim(),
          createdAt: new Date(),
        };

        const result = await reviewCollection.insertOne(reviewData);
        res.status(201).send(result);
      } catch (err) {
        console.error("error: ", err);
        res.status(500).send({ message: "Failed to submit review" });
      }
    });

    app.get("/api/reviews/patient/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { patientId: id };

        const result = await reviewCollection.find(query).toArray();

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "failed to get patient reviews" });
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
