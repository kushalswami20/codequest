import Question from "../models/Question.js";
import Auth from "../models/auth.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.diskStorage({
  destination: "./uploads/videos/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: async (req, file, cb) => {
    // Allow only video formats
    const filetypes = /mp4|webm|ogg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (!mimetype || !extname) {
      return cb(new Error("Error: Videos Only!"));
    }

    // We'll check duration after upload since we can't check before
    cb(null, true);
  },
}).single("questionVideo");

// <--------------------------------------------------------otp verification start-------------------------------------------------------->

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    type: "login",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Don't fail on invalid certs
  },
  debug: true, // Enable debug logs
});

// Verify transporter configuration immediately
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send emails");
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "email is required",
      });
    }

    const user = await Auth.findOne({ email });
    if (!email) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    const otp = generateOTP();
    user.videoUploadOTP = otp;
    user.videoUploadOTPExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    console.log("Attempting to send email with following configuration:");
    console.log("Email User:", process.env.EMAIL_USER);
    console.log(
      "Email Pass Length:",
      process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 0
    );

    try {
      const mailOptions = {
        from: {
          name: "Your Company Name",
          address: process.env.EMAIL_USER,
        },
        to: user.email,
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
    } catch (emailError) {
      console.error("Detailed email error:", emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to email",
    });
  } catch (error) {
    console.error("Full error object:", error);
    res.status(500).json({
      error: "Error sending OTP",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const verifyotp = async (req, res) => {
  try {
    console.log("Received request to verify OTP", req.body);
    const { email, otp } = req.body;
    const userId = req.userid;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Email and OTP are required",
      });
    }

    const user = await Auth.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.videoUploadOTP || !user.videoUploadOTPExpiry) {
      return res.status(400).json({
        error: "No OTP found",
        details: "Please request a new OTP",
      });
    }

    if (Date.now() > user.videoUploadOTPExpiry) {
      return res.status(400).json({
        error: "OTP expired",
        details: "Please request a new OTP",
      });
    }

    if (user.videoUploadOTP !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // Clear OTP and set video upload permission
    user.videoUploadOTP = null;
    user.videoUploadOTPExpiry = null;
    user.isVideoVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Video upload verification successful",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error verifying OTP",
      details: error.message,
    });
  }
};

// Modified AskQuestion controller to handle video upload
export const Askquestion = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    // Check if there's a video file and validate upload time
    if (req.file && !isWithinUploadHours()) {
      return res.status(403).json({
        error: "Time restriction",
        message: "Video uploads are only allowed between 2 PM and 7 PM",
      });
    }

    // Rest of your existing validation logic...
    if (!req.body.questionData) {
      return res.status(400).json({
        error: "Missing question data",
        message: "Question data is required",
      });
    }

    let questionData;
    try {
      questionData = JSON.parse(req.body.questionData);
    } catch (error) {
      console.error("Error parsing questionData:", error);
      return res.status(400).json({
        error: "Invalid question data",
        message: "Could not parse question data",
      });
    }

    const newQuestion = new Question({
      questiontitle: questionData.title,
      questionbody: questionData.body,
      questiontags: questionData.tags,
      userposted: questionData.userposted,
      userid: req.userid,
      askedon: new Date(),
    });

    if (req.file) {
      newQuestion.questionVideo = {
        url: `/uploads/videos/${req.file.filename}`,
        filename: req.file.filename,
        contentType: req.file.mimetype,
        questionverified: true,
      };
    }

    await newQuestion.save();
    res.status(200).json({
      success: true,
      message: "Question posted successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        message: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
};

// Modified getAllQuestions to include video data
export const getallquestion = async (req, res) => {
  try {
    const questionList = await Question.find().sort({ askedon: -1 });
    res.status(200).json(questionList);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

// Modified deleteQuestion to also remove video file
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question unavailable...");
  }

  try {
    const question = await Question.findById(_id);

    // Delete video file if exists
    if (question.questionVideo && question.questionVideo.filename) {
      const filePath = path.join(
        "./uploads/videos/",
        question.questionVideo.filename
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting video file:", err);
      });
    }

    await Question.findByIdAndDelete(_id);
    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value } = req.body;
  const userid = req.userid;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }
  try {
    const question = await Question.findById(_id);
    const upindex = question.upvote.findIndex((id) => id === String(userid));
    const downindex = question.downvote.findIndex(
      (id) => id === String(userid)
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        question.downvote = question.downvote.filter(
          (id) => id !== String(userid)
        );
      }
      if (upindex === -1) {
        question.upvote.push(userid);
      } else {
        question.upvote = question.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        question.upvote = question.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        question.downvote.push(userid);
      } else {
        question.downvote = question.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }
    await Question.findByIdAndUpdate(_id, question);
    res.status(200).json({ message: "voted successfully.." });
  } catch (error) {
    res.status(404).json({ message: "id not found" });
    return;
  }
};
