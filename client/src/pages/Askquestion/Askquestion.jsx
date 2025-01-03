import React, { useState, useEffect } from "react";
import "./Askquestion.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { askquestion, sendotp, verifyotp } from "../../action/question";

const Askquestion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentuserreducer);

  // Question form states
  const [questiontitle, setquestiontitle] = useState("");
  const [questionbody, setquestionbody] = useState("");
  const [questiontag, setquestiontags] = useState("");

  // Video states
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // OTP verification states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVideoVerified, setIsVideoVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isValidUploadTime, setIsValidUploadTime] = useState(false);

  const checkUploadTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 14 && hours < 19; // 2 PM to 7 PM
  };
  useEffect(() => {
    const updateTimeStatus = () => {
      setIsValidUploadTime(checkUploadTime());
    };

    // Initial check
    updateTimeStatus();

    // Set up interval to check time
    const interval = setInterval(updateTimeStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setStatusMessage("Sending OTP...");
      setError(""); // Clear any previous errors

      // Pass email directly as an object
      await dispatch(sendotp({ email }));

      setOtpSent(true);
      setShowOtpInput(true);
      setStatusMessage("OTP sent successfully! Please check your email.");
    } catch (err) {
      console.error("Frontend OTP Error:", err);
      setError(err.response?.data?.message || "Failed to send OTP");
      setStatusMessage("");
      setOtpSent(false);
      setShowOtpInput(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setStatusMessage("Verifying OTP...");
      setError(""); // Clear any previous errors

      const response = await dispatch(
        verifyotp({
          email: email,
          otp: otp,
        })
      );

      if (response) {
        setIsVideoVerified(true);
        setStatusMessage(
          "Email verified successfully! You can now upload a video."
        );
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(err.response?.data?.message || "Invalid OTP");
      setStatusMessage("");
    }
  };

  const handleVideoChange = (e) => {
    if (!isVideoVerified) {
      setError("Please verify your email before uploading a video");
      e.target.value = "";
      return;
    }

    if (!isValidUploadTime) {
      setError("Video uploads are only allowed between 2 PM and 7 PM");
      e.target.value = "";
      return;
    }

    const file = e.target.files[0];
    if (file) {
      const validTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid video file (MP4, WebM, or OGG)");
        e.target.value = "";
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("Video size should be less than 50MB");
        e.target.value = "";
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to ask a question");
      return;
    }

    if (!questiontitle || !questionbody || !questiontag) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setStatusMessage("Posting your question...");

      const formData = new FormData();

      // Create the question data object
      const questionData = {
        title: questiontitle,
        body: questionbody,
        tags: questiontag, // Make sure tags are split properly
        userposted: user.result.name,
      };

      // Append questionData as a string to FormData
      formData.append("questionData", JSON.stringify(questionData));

      // Add video if exists
      if (videoFile) {
        formData.append("questionVideo", videoFile);
      }

      // Debug logging
      console.log("Submitting question with data:", questionData);
      console.log("Form data entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await dispatch(askquestion(formData, navigate));
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);
      setError(error.response?.data?.message || "Error posting question");
      setStatusMessage("");
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    const fileInput = document.getElementById("question-video");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="ask-question">
      <div className="ask-ques-container">
        <h1>Ask a public Question</h1>
        {error && <div className="error-message">{error}</div>}
        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <form onSubmit={handlesubmit}>
          <div className="ask-form-container">
            {/* Title Input */}
            <label htmlFor="ask-ques-title">
              <h4>Title</h4>
              <p>
                Be specific and imagine you're asking a question to another
                person
              </p>
              <input
                type="text"
                id="ask-ques-title"
                value={questiontitle}
                onChange={(e) => setquestiontitle(e.target.value)}
                placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
              />
            </label>

            {/* Body Input */}
            <label htmlFor="ask-ques-body">
              <h4>Body</h4>
              <p>
                Include all the information someone would need to answer your
                question
              </p>
              <textarea
                id="ask-ques-body"
                value={questionbody}
                onChange={(e) => setquestionbody(e.target.value)}
                cols="30"
                rows="10"
              />
            </label>

            {/* Video Section */}
            <div className="video-section">
              <h4>Video Upload</h4>
              {!isVideoVerified ? (
                <div className="verification-section">
                  <p>Please verify your email to upload a video</p>
                  <p className="upload-time-info">
                    Video uploads are only allowed between 2 PM and 7 PM
                    {!isValidUploadTime && (
                      <span className="upload-time-warning">
                        (Currently outside upload hours)
                      </span>
                    )}
                  </p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="verify-btn"
                    >
                      Send OTP
                    </button>
                  )}

                  {showOtpInput && (
                    <div className="otp-input-section">
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        className="verify-btn"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="video-upload-section">
                  <input
                    type="file"
                    id="question-video"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleVideoChange}
                  />
                  {videoPreview && (
                    <div className="video-preview-container">
                      <video
                        controls
                        src={videoPreview}
                        className="video-preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          marginTop: "10px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="remove-video-btn"
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags Input */}
            <label htmlFor="ask-ques-tags">
              <h4>Tags</h4>
              <p>Add up to 5 tags to describe what your question is about</p>
              <input
                type="text"
                id="ask-ques-tags"
                onChange={(e) => setquestiontags(e.target.value.split(" "))}
                placeholder="e.g. xml typescript wordpress"
              />
            </label>
          </div>

          <input
            type="submit"
            value="Post your question"
            className="review-btn"
          />
        </form>
      </div>
    </div>
  );
};

export default Askquestion;
