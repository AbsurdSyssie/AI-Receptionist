// Import dependencies
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON payloads

require("dotenv").config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// Endpoint to receive POST requests and add data to Firestore
app.post("/addCall", async (req, res) => {
  try {
    console.log("Received request body:", req.body); // Log the request payload

    const { Name, DateOfBirth, Request, Transcript } = req.body;

    // Validate incoming data
    if (!Name || !DateOfBirth || !Request || !Transcript) {
      console.error("Missing required fields");
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

    console.log("Document successfully written with ID: ", docRef.id);
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
