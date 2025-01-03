import axios from "axios";

const API = axios.create({
  baseURL: "https://codequest-backend-qv7j.onrender.com",
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("Profile")) {
    req.headers.Authorization = `Bearer ${
      JSON.parse(localStorage.getItem("Profile")).token
    }`;
  }
  return req;
});

export const login = (authData) => API.post("/user/login", authData);
export const signup = (authdata) => API.post("user/signup", authdata);
export const getallusers = () => API.get("/user/getallusers");
export const updateprofile = (id, updatedata) =>
  API.patch(`user/update/${id}`, updatedata);

export const postquestion = (formData) => {
  console.log("Sending FormData with entries:");
  for (let [key, value] of formData.entries()) {
    console.log(key, ":", value);
  }

  console.log("API call data:", formData); // Debug log
  return API.post("/questions/Ask", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // Don't set any other headers for multipart/form-data
    },
  });
};
export const getallquestions = () => API.get("/questions/get");
export const deletequestion = (id) => API.delete(`/questions/delete/${id}`);
export const votequestion = (id, value) =>
  API.patch(`/questions/vote/${id}`, { value });
export const sendotp = (email) => API.post("/questions/sendotp", { email });
export const verifyotp = (email, otp) => {
  console.log("API call data:", { email, otp }); // Debug log
  return API.post("/questions/verifyotp", { email, otp });
};

export const postanswer = (id, noofanswers, answerbody, useranswered) =>
  API.patch(`/answer/post/${id}`, { noofanswers, answerbody, useranswered });
export const deleteanswer = (id, answerid, noofanswers) =>
  API.patch(`/answer/delete/${id}`, { answerid, noofanswers });

export const saveUserInfo = async (userData) => {
  try {
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    const completeUserData = {
      ...userData,
      ip: ipResponse.data.ip,
    };
    // Changed to match your API structure
    return await API.post("/userinfo", completeUserData);
  } catch (error) {
    throw error;
  }
};
// api/index.js
export const verifyOTP = (otpData) => API.post("/user/verify-otp", otpData);
