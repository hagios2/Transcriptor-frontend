import React from "react";
import profileImage from '../assets/profile.png'

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.profileContainer}>
        <img
          src={profileImage}
          alt="User Profile"
          style={styles.profileImage}
        />
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#fff",
    height: "64px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "0 20px",
  },
  profileContainer: {
    borderRadius: "50%",
    overflow: "hidden",
    width: "45px",
    height: "40px",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

export default Navbar;
