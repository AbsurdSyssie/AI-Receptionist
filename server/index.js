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

    // Validate message structure
    if (!message || message.type !== "end-of-call-report") {
      console.error("Invalid message type or missing message object");
      return res.status(400).send({ error: "Invalid message format" });
    }

    const { analysis, artifact } = message;

    // Validate presence of analysis and artifact
    if (!analysis || !artifact) {
      console.error("Missing analysis or artifact in message");
      return res.status(400).send({ error: "Missing analysis or artifact" });
    }

    // Extract structuredData and transcript
    const { structuredData } = analysis;
    const { transcript } = artifact;
    const { summary } = analysis.summary;

    if (!structuredData) {
      console.error("Missing structuredData in analysis");
      return res
        .status(400)
        .send({ error: "Missing structuredData in analysis" });
    }

    // Extract required fields from structuredData
    const { Name, DateOfBirth, Request, Urgency } = structuredData;

    if (!Name || !DateOfBirth || !Request) {
      console.error("Missing required fields in structuredData");
      return res
        .status(400)
        .send({ error: "Missing required fields in structuredData" });
    }

    if (!transcript) {
      console.warn("Missing transcript in artifact");
    }
    if (!summary) console.warn("Missing summary in analysis.summary");

    // Parse call date from 'message.timestamp' or use current timestamp as fallback
    const callDate = message.timestamp
      ? new Date(message.timestamp).toISOString()
      : new Date().toISOString();

    // Log the extracted details
    console.log("Extracted Details:");
    console.log(`Name: ${Name}`);
    console.log(`Date of Birth: ${DateOfBirth}`);
    console.log(`Request: ${Request}`);
    console.log(`Call Date: ${callDate}`);
    console.log(`Transcript: ${transcript || "Transcript not available"}`);
    console.log(`Urgency: ${Urgency || "Transcript not available"}`);
    console.log(`Summary: ${summary || "Summary not available"}`);

    // Add data to Firestore
    const docRef = await db.collection("Calls").add({
      Name,
      "Date of Birth": DateOfBirth,
      Request,
      Transcript: transcript || "Transcript not available",
      "Call Date": callDate,
      tag: "unsorted",
      Urgency: Urgency || "Not specified",
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
