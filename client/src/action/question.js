import * as api from "../api/index";

export const sendotp = (emailData) => async (dispatch) => {
  try {
    dispatch({ type: "OTP_LOADING" });

    // Extract email string from the object
    const email = emailData.email;
    const { data } = await api.sendotp(email);

    dispatch({ type: "SEND_OTP_SUCCESS", payload: data });
    return data;
  } catch (error) {
    console.error("OTP Error:", error.response || error);
    const errorMessage = error.response?.data?.message || "Failed to send OTP";
    dispatch({
      type: "SEND_OTP_ERROR",
      payload: errorMessage,
    });
    throw error;
  }
};
export const verifyotp = (verificationData) => async (dispatch) => {
  try {
    dispatch({ type: "OTP_LOADING" });
    console.log("Verification data in action:", verificationData); // Debug log

    const { email, otp } = verificationData;
    const { data } = await api.verifyotp(email, otp);

    dispatch({ type: "VERIFY_OTP_SUCCESS", payload: data });
    return data;
  } catch (error) {
    console.error("Verification Error:", error.response?.data || error); // Enhanced error logging
    const errorMessage =
      error.response?.data?.details ||
      error.response?.data?.error ||
      "Failed to verify OTP";
    dispatch({
      type: "VERIFY_OTP_ERROR",
      payload: errorMessage,
    });
    throw error;
  }
};

export const askquestion = (formData, navigate) => async (dispatch) => {
  try {
    dispatch({ type: "QUESTION_LOADING" });

    // Verify FormData contents before sending
    console.log("Action: FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const { data } = await api.postquestion(formData);
    console.log("Action: Data received:", data);
    dispatch({ type: "POST_QUESTION_SUCCESS", payload: data });
    dispatch(fetchallquestion());
    navigate("/");
  } catch (error) {
    console.error("Question posting error:", error.response?.data || error);
    dispatch({
      type: "POST_QUESTION_ERROR",
      payload: error.response?.data?.message || "Error posting question",
    });
    throw error;
  }
};

export const fetchallquestion = () => async (dispatch) => {
  try {
    const { data } = await api.getallquestions();
    dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const deletequestion = (id, navigate) => async (dispatch) => {
  try {
    await api.deletequestion(id);
    dispatch(fetchallquestion());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const votequestion = (id, value) => async (dispatch) => {
  try {
    await api.votequestion(id, value);
    dispatch(fetchallquestion());
  } catch (error) {
    console.log(error);
  }
};

export const postanswer = (answerdata) => async (dispatch) => {
  try {
    const { id, noofanswers, answerbody, useranswered } = answerdata;
    const { data } = await api.postanswer(
      id,
      noofanswers,
      answerbody,
      useranswered
    );
    dispatch({ type: "POST_ANSWER", payload: data });
    dispatch(fetchallquestion());
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = (id, answerid, noofanswers) => async (dispatch) => {
  try {
    await api.deleteanswer(id, answerid, noofanswers);
    dispatch(fetchallquestion());
  } catch (error) {
    console.log(error);
  }
};
