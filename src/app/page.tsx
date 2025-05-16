"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Home() {
  const [urls, setUrls] = useState<string>("");
  const [fields, setFields] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setResultUrl("");
  setCsvData([]);
  setHeaders([]);

  try {
    // if input empty set as name and price
    let fieldsToSend = fields.trim() === "" ? "name, price" : fields.trim();

    // check for "description" input
    if (fieldsToSend.toLowerCase().includes("description")) {
      alert(
        "Please enter a specific information needed, such as category, origin, washing instructions, etc."
      );
      return; 
    }

    const response = await axios.post("/api/process", { urls, fields: fieldsToSend });
    const { csvData, headers: csvHeaders, rows } = response.data;

    //  Store CSV data for preview
    setHeaders(csvHeaders);
    setCsvData(rows);
    setResultUrl(csvData);
  } catch (error) {
    console.error("Error processing data:", error);
    alert("Error processing your request. Please try again.");
  } finally {
    setLoading(false);
  }
};


//  Function to trigger CSV download
const downloadCsv = () => {
  if (resultUrl) {
    const blob = new Blob([resultUrl], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "processed_data.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};



  //  CSV Parsing Function (Enhanced)
  const parseCSV = (csvText: string) => {
    const rows = csvText.split("\n").filter((row) => row.trim().length > 0);

    if (rows.length > 0) {
      const parsedHeaders = rows[0].split(",").map((h) => h.replace(/"/g, "").trim());
      const parsedData = rows.slice(1).map((row) =>
        row.split(",").map((cell) => cell.replace(/"/g, "").trim())
      );

      setHeaders(parsedHeaders);
      setCsvData(parsedData);
    } else {
      console.error("CSV file is empty or invalid.");
      alert("Error processing your request. Please try again.");
    }
  };

  return (
    <div>
    {/* Supported Websites List */}
    <motion.div 
      className="fixed top-4 right-4 bg-grey bg-opacity-90 text-grey p-3 rounded-lg shadow-lg max-w-xs z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-bold mb-2">Supported Websites:</h3>
      <ul className="text-sm list-disc list-inside space-y-1">
        <li>✅ Coles</li>
        <li>✅ Target</li>
        <li>✅ Kmart</li>
        <li>⚠️ Woolworths (Price not accessible)</li>
        <li>✅ IKEA</li>
      </ul>
    </motion.div>

    {/* Status Indicator */}
    <motion.div 
      className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>Ready</span>
        </div>
      )}
    </motion.div>

<main className="relative min-h-screen flex items-center justify-center bg-gray-900">
  <video
    className="absolute inset-0 w-full h-full object-cover -z-1"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/background.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <motion.div 
    className="relative bg-black bg-opacity-70 p-8 rounded-3xl shadow-2xl max-w-3xl space-y-6 text-white backdrop-blur-md z-10"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <h2 className="text-5xl font-extrabold text-center mb-6">🌐 Data Processing Portal</h2>
    <p className="text-center text-gray-300 mb-4">
      Quickly extract data from multiple URLs with precision.
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        rows={4}
        placeholder="Enter URLs (one per line)"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
      />
      <textarea
        className="w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        rows={2}
        placeholder="Enter fields (e.g. name, price, category)"
        value={fields}
        onChange={(e) => setFields(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        ) : (
          "🚀 Start Processing"
        )}
      </button>
    </form>

    {resultUrl && (
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          onClick={downloadCsv} 
          className="text-blue-400 underline hover:text-blue-600"
        >
          📥 Download Processed CSV
        </button>
      </motion.div>
    )}

    {csvData.length > 0 && (
      <motion.div 
        className="mt-4 w-full overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="w-full text-white border border-gray-600">
          <thead className="bg-blue-600">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-gray-800 even:bg-gray-700">
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="p-2">
                    {row[header] ?? "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    )}
  </motion.div>
</main>
 </div>
  );
}
