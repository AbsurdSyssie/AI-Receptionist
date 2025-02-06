import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import "./CallDetailsPage.css"; // Modern styles for the details page

const CallDetailsPage = () => {
  const { id } = useParams(); // Get call ID from URL params
  const [call, setCall] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        const callDocRef = doc(db, "Calls", id);
        const callSnapshot = await getDoc(callDocRef);
        if (callSnapshot.exists()) {
          setCall(callSnapshot.data());
        } else {
          console.error("No such call found!");
        }
      } catch (error) {
        console.error("Error fetching call details:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchActions = async () => {
      try {
        const actionsCollectionRef = collection(db, "Actions");
        const actionsSnapshot = await getDocs(actionsCollectionRef);
        const actionsData = actionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActions(actionsData);
      } catch (error) {
        console.error("Error fetching actions:", error.message);
      }
    };

    fetchCallDetails();
    fetchActions();
  }, [id]);

  const handleActionClick = async (actionId, actionName) => {
    try {
      const callDocRef = doc(db, "Calls", id);
      await updateDoc(callDocRef, { tag: "sorted", action: actionName });
      console.log(`Action ${actionId} applied to call ${id}`);
      setCall((prevCall) => ({
        ...prevCall,
        tag: "sorted",
        action: actionName,
      }));
    } catch (error) {
      console.error("Error updating call tag and action:", error.message);
    }
  };

  const renderTranscript = (transcript) => {
    if (!transcript) return "N/A";
    const messages = transcript.split(/(?=AI:|User:)/g);
    return messages.map((message, index) => {
      const isAI = message.startsWith("AI:");
      return (
        <div
          key={index}
          className={`message ${isAI ? "ai-message" : "user-message"}`}
        >
          {message.trim()}
        </div>
      );
    });
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "Life Threatening":
        return "life-threatening";
      case "Urgent":
        return "urgent";
      case "Same Day":
        return "same-day";
      case "Routine":
        return "routine";
      default:
        return "default";
    }
  };

  if (loading) {
    return <p>Loading call details...</p>;
  }

  if (!call) {
    return <p>Call not found!</p>;
  }

  return (
    <div className="call-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="call-card">
        <div className="header-with-urgency">
          <h1>Call Details</h1>
          {call.Urgency && (
            <button
              className={`urgency-button ${getUrgencyClass(
                call.Urgency.replace(/\s*\(.*?\)/, "")
              )}`}
            >
              {call.Urgency.replace(/\s*\(.*?\)/, "")}
            </button>
          )}
        </div>
        <p>
          <strong>Date:</strong> {call["Call Date"] || "N/A"}
        </p>
        <p>
          <strong>Name:</strong> {call.Name || "N/A"}
        </p>
        <p>
          <strong>Date of Birth:</strong> {call["Date of Birth"] || "N/A"}
        </p>
        <p>
          <strong>Request:</strong> {call.Request || "N/A"}
        </p>
        {/* New Summary section */}
        <p>
          <strong>Summary:</strong> {call.Summary || "N/A"}
        </p>
        <div className="transcript-section">
          <h2>Transcript</h2>
          <div className="transcript-container">
            {renderTranscript(call.Transcript)}
          </div>
        </div>
        {call.action && (
          <div className="action-applied">
            <p>
              <strong>Action Applied:</strong> {call.action}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallDetailsPage;
