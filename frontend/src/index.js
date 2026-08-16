import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TotalsProvider } from "./context/TotalsContext";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TotalsProvider>
        <App />
      </TotalsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Service worker yalnızca üretim derlemesinde etkinleştirilir. Böylece
// geliştirme sunucusundaki dosyalar eski önbellekten okunmaz.
if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .catch((error) => {
        console.error("PWA service worker kaydedilemedi:", error);
      });
  });
}
