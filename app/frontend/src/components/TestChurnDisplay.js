import React, { useState } from "react";

const TestChurnDisplay = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTestChurn = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/test-churn/calculate?owner=facebook&repo=react&startDate=2012-02-01&endDate=2025-03-01"
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching test churn data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <button
        onClick={fetchTestChurn}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Loading..." : "Fetch Test Churn Data"}
      </button>
      {data && (
        <div className="w-96 shadow-lg p-4 bg-white rounded-2xl mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Test Churn Report
          </h2>
          <div className="text-gray-600 text-lg text-center">
            <p><strong>Modified Tests:</strong> {data.modified_tests}</p>
            <p><strong>Added Tests:</strong> {data.added_tests}</p>
            <p><strong>Deleted Tests:</strong> {data.deleted_tests}</p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestChurnDisplay;
