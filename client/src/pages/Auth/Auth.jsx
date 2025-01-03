import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";
import icon from "../../assets/icon.png";
import Aboutauth from "./Aboutauth";
import { signup, login, verifyOTP } from "../../action/auth";
import google from "../../assets/google.png";

const Auth = () => {
  const [issignup, setissignup] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get time restriction state from Redux
  const authState = useSelector((state) => state.auth || {});
  const timeRestriction = authState.timeRestriction || {
    isRestricted: false,
    message: "",
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("edg")) {
      return "Edge";
    } else if (userAgent.includes("chrome")) {
      return "Chrome";
    }
    return "Other";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userData = {
          result: {
            _id: decodedToken.id,
            name: decodedToken.name || decodedToken.email.split("@")[0],
            email: decodedToken.email,
          },
          token: token,
        };

        dispatch({ type: "AUTH", data: userData });
        localStorage.setItem("Profile", JSON.stringify(userData));
        navigate("/");
      } catch (error) {
        console.error("Google login error:", error);
        alert("Error logging in with Google. Please try again.");
      }
    }
  }, [navigate, dispatch]);

  const handlesubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    if (issignup) {
      if (!name) {
        alert("Enter a name to continue");
        return;
      }
      const response = await dispatch(
        signup({ name, email, password }, navigate)
      );
      if (response?.payload?.timeRestricted) {
        alert(response.payload.message);
        return;
      }
    } else {
      try {
        const browserName = getBrowserName();
        console.log("Detected browser:", browserName);

        const response = await dispatch(
          login({ email, password, browserName })
        );
        console.log("Login response:", response);

        if (response?.payload?.timeRestricted) {
          alert(response.payload.message);
          return;
        }

        if (response?.payload?.requiresOTP) {
          setShowOTPInput(true);
          alert("OTP has been sent to your email");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Something went wrong");
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter OTP");
      return;
    }
    try {
      await dispatch(verifyOTP({ email, otp }, navigate));
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleswitch = () => {
    setissignup(!issignup);
    setname("");
    setemail("");
    setpassword("");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/user/auth/google";
  };

  // Show time restriction message if access is restricted
  if (timeRestriction?.isRestricted) {
    return (
      <section className="auth-section">
        <div className="auth-container-2">
          <img src={icon} alt="icon" className="login-logo" />
          <div
            className="time-restriction-message"
            style={{
              textAlign: "center",
              padding: "20px",
              marginTop: "20px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeeba",
              borderRadius: "4px",
            }}
          >
            <h4 style={{ color: "#856404", marginBottom: "10px" }}>
              Access Restricted
            </h4>
            <p style={{ color: "#856404" }}>{timeRestriction.message}</p>
            <p style={{ color: "#856404", marginTop: "10px" }}>
              Please try again during allowed hours (10 AM to 1 PM)
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-section">
      {issignup && <Aboutauth />}
      <div className="auth-container-2">
        <img src={icon} alt="icon" className="login-logo" />

        {showOTPInput ? (
          <form onSubmit={handleOTPSubmit}>
            <div className="otp-container">
              <label htmlFor="otp">
                <h4>Enter OTP</h4>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
              </label>
              <button type="submit" className="auth-btn">
                Verify OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlesubmit}>
            {issignup && (
              <label htmlFor="name">
                <h4>Display Name</h4>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                />
              </label>
            )}
            <label htmlFor="email">
              <h4>Email</h4>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />
            </label>
            <label htmlFor="password">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4>Password</h4>
                {!issignup && (
                  <p style={{ color: "#007ac6", fontSize: "13px" }}>
                    Forgot Password?
                  </p>
                )}
              </div>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
              />
            </label>
            <button type="submit" className="auth-btn">
              {issignup ? "Sign up" : "Log in"}
            </button>
          </form>
        )}

        {!showOTPInput && (
          <p>
            {issignup ? "Already have an account?" : "Don't have an account"}
            <button
              type="button"
              className="handle-switch-btn"
              onClick={handleswitch}
            >
              {issignup ? "Log in" : "Sign up"}
            </button>
          </p>
        )}

        {!showOTPInput && (
          <div className="mt-4">
            <button onClick={handleGoogleLogin} className="google-auth-btn">
              <img src={google} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Auth;
