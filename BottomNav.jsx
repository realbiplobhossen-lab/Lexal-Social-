import React from "react";

export default function BottomNav({ setPage, currentPage }) {
  return (
    <div className="bottom-nav" style={styles.navContainer}>
      <button 
        onClick={() => setPage("home")} 
        style={currentPage === "home" ? styles.activeBtn : styles.btn}
      >
        Home
      </button>
      <button 
        onClick={() => setPage("create")} 
        style={currentPage === "create" ? styles.activeBtn : styles.btn}
      >
        Create
      </button>
      <button 
        onClick={() => setPage("profile")} 
        style={currentPage === "profile" ? styles.activeBtn : styles.btn}
      >
        Profile
      </button>
    </div>
  );
}

const styles = {
  navContainer: { display: "flex", justifyContent: "space-around", padding: "10px", background: "#eee", position: "fixed", bottom: 0, width: "100%" },
  btn: { padding: "10px", background: "none", border: "none", cursor: "pointer" },
  activeBtn: { padding: "10px", background: "none", border: "none", fontWeight: "bold", color: "#007bff", cursor: "pointer" }
};
