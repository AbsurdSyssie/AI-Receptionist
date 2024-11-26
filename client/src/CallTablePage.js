import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./CallTablePage.css";

const CallTablePage = () => {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [activeTab, setActiveTab] = useState("new");
  const [sortConfig, setSortConfig] = useState({
    key: "callDateParsed",
    direction: "asc",
  });

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
        filterCalls(callsData, activeTab);
      } catch (error) {
        console.error("Error fetching calls:", error.message);
      }
    };

    fetchCalls();
  }, [activeTab]);

  const filterCalls = (callsData, tab) => {
    let filtered;
    switch (tab) {
      case "new":
        filtered = callsData.filter((call) => call.tag === "unsorted");
        break;
      case "triaged":
        filtered = callsData.filter((call) => call.tag === "sorted");
        break;
      case "completed":
        filtered = callsData.filter((call) => call.tag === "complete");
        break;
      default:
        filtered = callsData;
    }
    setFilteredCalls(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterCalls(calls, tab);
  };

  const handleDelete = async (id) => {
    try {
      const callDocRef = doc(db, "Calls", id);
      await deleteDoc(callDocRef);
      setCalls((prevCalls) => prevCalls.filter((call) => call.id !== id));
      setFilteredCalls((prevCalls) =>
        prevCalls.filter((call) => call.id !== id)
      );
    } catch (error) {
      console.error("Error deleting call:", error.message);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    setFilteredCalls((prevCalls) => {
      return [...prevCalls].sort((a, b) => {
        if (key === "callDateParsed") {
          const dateA = a[key] ? a[key].getTime() : 0;
          const dateB = b[key] ? b[key].getTime() : 0;
          return direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  return (
    <div className="table-container">
      <h1>Call Logs</h1>
      <div className="tabs">
        <button
          className={activeTab === "new" ? "active" : ""}
          onClick={() => handleTabChange("new")}
        >
          New Calls
        </button>
        <button
          className={activeTab === "triaged" ? "active" : ""}
          onClick={() => handleTabChange("triaged")}
        >
          Triaged Calls
        </button>
        <button
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => handleTabChange("completed")}
        >
          Completed Calls
        </button>
      </div>
      <table className="calls-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("callDateParsed")}>
              Date{" "}
              {sortConfig.key === "callDateParsed" &&
                (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("Name")}>
              Name{" "}
              {sortConfig.key === "Name" &&
                (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("Date of Birth")}>
              Date of Birth{" "}
              {sortConfig.key === "Date of Birth" &&
                (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("Request")}>
              Request{" "}
              {sortConfig.key === "Request" &&
                (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCalls.map((call) => (
            <tr key={call.id}>
              <Link to={`/calls/${call.id}`} className="clickable-row">
                <td>
                  {call.callDateParsed
                    ? call.callDateParsed.toLocaleString()
                    : "N/A"}
                </td>
                <td>{call.Name || "N/A"}</td>
                <td>{call["Date of Birth"] || "N/A"}</td>
                <td>{call.Request || "N/A"}</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent row click from triggering
                      handleDelete(call.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </Link>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CallTablePage;
