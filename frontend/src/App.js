import React from "react";
import Home from "./pages/Home";
import { TotalsProvider } from "./context/TotalsContext"; // Context'i import ettik

function App() {
  return (
    <TotalsProvider>
      <div className="App">
        <Home />
      </div>
    </TotalsProvider>
  );
}

export default App;
