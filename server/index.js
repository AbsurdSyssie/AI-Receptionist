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
    console.log("Received request body:", JSON.stringify(req.body, null, 2)); // Log the entire request body for debugging

    const { message } = req.body;

    // Validate message
    if (!message || !message.toolCalls || !message.toolCalls.length) {
      console.error("Invalid message format: toolCalls missing");
      return res
        .status(400)
        .send({ error: "Invalid message format: toolCalls missing" });
    }

    // Extract the first toolCall (assuming one call per request)
    const toolCall = message.toolCalls[0];
    const functionDetails = toolCall.function;

    if (!functionDetails || !functionDetails.arguments) {
      console.error("Invalid function call format: arguments missing");
      return res
        .status(400)
        .send({ error: "Invalid function call format: arguments missing" });
    }

    // Parse arguments (received as a JSON string)
    const args = JSON.parse(functionDetails.arguments);

    // Extract data from arguments
    const { Name, DateofBirth, Request, Transcript } = args;

    // Validate required fields
    if (!Name || !DateofBirth || !Request || !Transcript) {
      console.error("Missing required fields in arguments");
      return res
        .status(400)
        .send({ error: "Missing required fields in arguments" });
    }

    // Add data to Firestore
    const docRef = await db.collection("Calls").add({
      Name,
      "Date of Birth": DateofBirth,
      Request,
      Transcript,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Document successfully written with ID:", docRef.id);
    res.status(200).send({ message: "Call added successfully", id: docRef.id });
  } catch (error) {
    console.error("Error adding call:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
