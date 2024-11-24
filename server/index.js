// Import dependencies
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON payloads

require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); // Load Firebase service account key from environment variable

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Endpoint to receive POST requests and add data to Firestore
app.post("/addCall", async (req, res) => {
  try {
    const { Name, DateOfBirth, Request, Transcript } = req.body;

    // Validate incoming data
    if (!Name || !DateOfBirth || !Request || !Transcript) {
      return res.status(400).send("Missing required fields");
    }

    // Add data to Firestore
    const docRef = await db.collection("Calls").add({
      Name,
      "Date of Birth": DateOfBirth,
      Request,
      Transcript,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send({ message: "Call added successfully", id: docRef.id });
  } catch (error) {
    console.error("Error adding call:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
