import React from "react";
import "./adminLandingPage.css";
import Header from "../../header/header";
import AlpMain from "./components/alp-main";

function AdminLandingPage() {
  return (
    <div className="landMain">
      <Header />
      <div className="alp-content">
        <AlpMain />
      </div>
    </div>
  );
}

export default AdminLandingPage;
