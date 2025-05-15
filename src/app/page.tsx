"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Home() {
  const [urls, setUrls] = useState("");
  const [fields, setFields] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultUrl("");
    setCsvData([]);
    setHeaders([]);

    try {
      const response = await axios.post("/api/process", { urls, fields });
      setResultUrl(response.data.downloadUrl);

      const csvResponse = await axios.get(response.data.downloadUrl);
      const csvText = csvResponse.data;
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
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
};


  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative bg-black bg-opacity-60 p-8 rounded-3xl shadow-2xl max-w-3xl space-y-6 text-white backdrop-blur-md z-10">
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {loading ? "Processing..." : "🚀 Start Processing"}
          </button>
        </form>

        {resultUrl && (
          <motion.div 
            className="mt-4 text-center" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <a href={resultUrl} className="text-blue-400 underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">
              📥 Download Processed CSV
            </a>
          </motion.div>
        )}

        {csvData.length > 0 && (
          <motion.table className="mt-4 w-full text-white border border-gray-600">
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
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </motion.table>
        )}
      </div>
    </main>
  );
}
