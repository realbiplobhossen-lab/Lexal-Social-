import React from "react";

export default function BottomNav({ setPage, currentPage }) {
  return (
    <div className="bottom-nav" style={styles.navContainer}>
      <button 
        onClick={() => setPage("home")} 
        style={currentPage === "home" ? styles.activeBtn : styles.btn}
      >
        <span>🏠</span><br/>Home
      </button>
      <button 
        onClick={() => setPage("messages")} 
        style={currentPage === "messages" ? styles.activeBtn : styles.btn}
      >
        <span>💬</span><br/>Chats
      </button>
      <button 
        onClick={() => setPage("create")} 
        style={currentPage === "create" ? styles.activeBtn : styles.btn}
      >
        <span>➕</span><br/>Studio
      </button>
      <button 
        onClick={() => setPage("profile")} 
        style={currentPage === "profile" ? styles.activeBtn : styles.btn}
      >
        <span>👤</span><br/>Profile
      </button>
    </div>
  );
}

const styles = {
  navContainer: { 
    display: "flex", 
    justifyContent: "space-around", 
    padding: "10px 0", 
    background: "#161B22", 
    position: "fixed", 
    bottom: 0, 
    width: "100%",
    borderTop: "1px solid #30363D",
    zIndex: 999
  },
  btn: { 
    padding: "6px", 
    background: "none", 
    border: "none", 
    cursor: "pointer",
    color: "#8B949E",
    fontSize: "12px",
    fontWeight: "600"
  },
  activeBtn: { 
    padding: "6px", 
    background: "none", 
    border: "none", 
    fontWeight: "bold", 
    color: "#58A6FF", 
    cursor: "pointer",
    fontSize: "12px"
  }
};
