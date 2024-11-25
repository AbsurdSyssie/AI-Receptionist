import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./App.css"; // Import the CSS styles

function App() {
  const [calls, setCalls] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "callDateParsed",
    direction: "desc",
  });
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Calls"));
        const callsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            callDateParsed: data["Call Date"]
              ? new Date(data["Call Date"])
              : null,
          };
        });
        setCalls(callsData);
      } catch (error) {
        console.error("Error fetching calls:", error);
      }
    };

    fetchCalls();
  }, []);

  useEffect(() => {
    setCalls((prevCalls) => sortData(prevCalls, sortConfig));
  }, [sortConfig]);

  const sortData = (data, config) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      if (config.key === "callDateParsed") {
        if (!a.callDateParsed || !b.callDateParsed) {
          return !a.callDateParsed ? 1 : -1;
        }
        return config.direction === "asc"
          ? a.callDateParsed.getTime() - b.callDateParsed.getTime()
          : b.callDateParsed.getTime() - a.callDateParsed.getTime();
      }
      if (a[config.key] < b[config.key]) {
        return config.direction === "asc" ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortedData;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id) => {
    try {
      const callDocRef = doc(db, "Calls", id);
      await deleteDoc(callDocRef);
      setCalls((prevCalls) => prevCalls.filter((call) => call.id !== id));
    } catch (error) {
      console.error(
        "Error deleting call: Missing or insufficient permissions.",
        error
      );
    }
  };

  const handleOpenTranscript = (transcript) => {
    setSelectedTranscript(transcript);
  };

  const handleCloseModal = () => {
    setSelectedTranscript(null);
  };

  return (
    <div className="app-container">
      <h1>Calls Table</h1>
      <div className="table-container">
        <table className="calls-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("callDateParsed")}>
                Date{" "}
                {sortConfig.key === "callDateParsed" &&
                  (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")}
              </th>
              <th onClick={() => handleSort("Name")}>
                Name{" "}
                {sortConfig.key === "Name" &&
                  (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")}
              </th>
              <th onClick={() => handleSort("Date of Birth")}>
                Date of Birth{" "}
                {sortConfig.key === "Date of Birth" &&
                  (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")}
              </th>
              <th onClick={() => handleSort("Request")}>
                Request{" "}
                {sortConfig.key === "Request" &&
                  (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")}
              </th>
              <th onClick={() => handleSort("Transcript")}>
                Transcript{" "}
                {sortConfig.key === "Transcript" &&
                  (sortConfig.direction === "asc" ? "\u25B2" : "\u25BC")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id}>
                <td>
                  {call.callDateParsed
                    ? call.callDateParsed.toLocaleString()
                    : "N/A"}
                </td>
                <td>{call.Name || "N/A"}</td>
                <td>{call["Date of Birth"] || "N/A"}</td>
                <td>{call.Request || "N/A"}</td>
                <td>
                  {call.Transcript ? (
                    <>
                      {call.Transcript.substring(0, 30)}
                      {call.Transcript.length > 30 ? "..." : ""}
                      <button
                        onClick={() => handleOpenTranscript(call.Transcript)}
                      >
                        View
                      </button>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(call.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTranscript && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={handleCloseModal}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Transcript</h2>
              <button
                className="close-button"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div
              className="modal-body"
              style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}
            >
              <p>{selectedTranscript}</p>
            </div>
            <div
              className="modal-footer"
              style={{ marginTop: "20px", textAlign: "right" }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
