import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/index.css"; // Global styles
import "@fontsource/roboto"; // Defaults to weight 400
import "@fontsource/roboto/500.css"; // Medium weight
import "@fontsource/roboto/700.css"; // Bold weight

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Header */}
        <Header />
        {/* Main Content */}
        <main>
          <AppRoutes />
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
