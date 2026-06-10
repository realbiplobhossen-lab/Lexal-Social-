import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx.txt"; // এক্সটেনশন সহ সম্পূর্ণ পাথ সুনির্দিষ্ট করে দেওয়া হলো

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
