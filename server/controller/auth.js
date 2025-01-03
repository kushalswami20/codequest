import users from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID =process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://codequest-backend-qv7j.onrender.com/auth/google/callback";

// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    type: "login",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

// Verify transporter configuration immediately
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send emails");
  }
});

// Helper function to check if current time is within allowed hours (10 AM to 1 PM)
const isWithinAllowedHours = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 10 && currentHour < 13; // 10 AM to 1 PM
};

// Helper function to check if device is mobile
const isMobileDevice = (userAgent) => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (In production, use Redis or similar)
const otpStore = new Map();

// Send OTP via email
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: {
      name: "Your Company Name",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Account Verification OTP",
    text: `Your OTP for account verification is: ${otp}. Please use this OTP to verify both your email and phone number.`,
    html: `
          <h1>Account Verification OTP</h1>
          <p>Your OTP for account verification is: <strong>${otp}</strong></p>
          <p>Please use this OTP to verify both your email and phone number.</p>
        `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

export const login = async (req, res) => {
  const { email, password, browserName } = req.body;
  const userAgent = req.headers["user-agent"];
  console.log("Received login request:", { email, browserName });

  try {
    // Check for mobile device access restrictions
    if (isMobileDevice(userAgent)) {
      if (!isWithinAllowedHours()) {
        return res.status(403).json({
          message: "Mobile access is only allowed between 10 AM and 1 PM",
          restrictedAccess: true,
        });
      }
    }

    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // First verify password for all browsers
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // For Chrome browser - OTP verification required
    if (browserName === "Chrome" || browserName === "chrome") {
      // Generate and store OTP
      const otp = generateOTP();
      console.log("Generated OTP:", otp);
      otpStore.set(email, {
        otp,
        timestamp: Date.now(),
        userId: existingUser._id,
      });

      // Send OTP via email
      await sendOTP(email, otp);

      return res.status(200).json({
        message: "OTP sent successfully",
        requiresOTP: true,
      });
    }

    // For other browsers - direct login
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// Rest of the code remains the same...
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const userAgent = req.headers["user-agent"];

  try {
    // Check for mobile device access restrictions
    if (isMobileDevice(userAgent)) {
      if (!isWithinAllowedHours()) {
        return res.status(403).json({
          message: "Mobile access is only allowed between 10 AM and 1 PM",
          restrictedAccess: true,
        });
      }
    }

    const storedOTPData = otpStore.get(email);

    if (!storedOTPData) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOTPData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await users.findById(storedOTPData.userId);
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Clear OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const userAgent = req.headers["user-agent"];

  try {
    // Check for mobile device access restrictions
    if (isMobileDevice(userAgent)) {
      if (!isWithinAllowedHours()) {
        return res.status(403).json({
          message: "Mobile access is only allowed between 10 AM and 1 PM",
          restrictedAccess: true,
        });
      }
    }

    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Generate and store new OTP
    const otp = generateOTP();
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      userId: existingUser._id,
    });

    // Send new OTP via email
    await sendOTP(email, otp);

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// Google auth functions remain the same...
export const googleInit = async (req, res) => {
  const encodedRedirectUri = encodeURIComponent(REDIRECT_URI);
  const scope = encodeURIComponent("email profile");

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodedRedirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  const { code } = req.query;
  const userAgent = req.headers["user-agent"];

  try {
    // Check for mobile device access restrictions
    if (isMobileDevice(userAgent)) {
      if (!isWithinAllowedHours()) {
        return res.status(403).json({
          message: "Mobile access is only allowed between 10 AM and 1 PM",
          restrictedAccess: true,
        });
      }
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { name, email } = profileResponse.data;

    let user = await users.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await users.create({
        email,
        name,
        password: hashedPassword,
        googleId: profileResponse.data.id,
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.redirect(`hhttps://codequest-xi.vercel.app/Auth?token=${token}`);
  } catch (error) {
    console.error("Google OAuth Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error during Google login",
      details: error.response?.data || error.message,
    });
  }
};
