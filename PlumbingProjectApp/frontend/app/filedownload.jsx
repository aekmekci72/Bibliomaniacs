import React, { useState } from "react";
import { View, Text, Pressable, Image, ScrollView } from "react-native";

export default function FileDownload() {
  const [csvData, setCsvData] = useState([]);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map((r) => r.split(","));
      setCsvData(rows);
      console.log("Imported CSV Data:", rows);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const exampleData = [
      ["Name", "Age", "City"],
      ["Alice", "17", "NY"],
      ["Bob", "18", "Chicago"],
    ];

    const csvString = exampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "example.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <div className="explorerContainer flex flex-col">
        {/* Page Title */}
        <h1 className="explorerH1">CSV Import & Export</h1>

        {/* Input Card */}
        <div className="inputCard flex flex-col gap-3">
            <h2 className="sectionTitle">Upload a CSV</h2>

            {/* Hidden file input */}
            <input
            id="csvInput"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImport}
            />

            {/* Button Row */}
            <div className="buttonRow">
            <button
                onClick={() => document.getElementById("csvInput").click()}
                className="primaryBtn"
            >
                <span className="primaryText">Import CSV</span>
            </button>

            <button onClick={handleExport} className="secondaryBtn">
                <span className="secondaryText">Download CSV</span>
            </button>
            </div>
        </div>

        {/* Display imported CSV (optional) */}
        <div className="listContainer">
            <h2 className="sectionTitle">Imported Data</h2>

            {csvData.length === 0 ? (
            <p className="emptyText">No CSV uploaded yet.</p>
            ) : (
            csvData.map((row, i) => (
                <div key={i} className="bookCard">
                <p className="bookTitle">{row.join(" • ")}</p>
                </div>
            ))
            )}
        </div>
        </div>
    </ScrollView>
  );
}
