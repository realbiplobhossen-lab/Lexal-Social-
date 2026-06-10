import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // এক্সটেনশন সহ পাথ ফিক্স করা হয়েছে

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
