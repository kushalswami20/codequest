import * as api from "../api";
import { setcurrentuser } from "./currentuser";
import { fetchallusers } from "./users";

export const ActionTypes = {
  AUTH_START: "AUTH_START",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAIL: "AUTH_FAIL",
  LOGOUT: "LOGOUT",
  REQUIRE_OTP: "REQUIRE_OTP",
  TIME_RESTRICTION: "TIME_RESTRICTION", // New action type
};

// Helper function to check if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper function to check if current time is within allowed hours
const isWithinAllowedHours = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 10 && currentHour < 13; // 10 AM to 1 PM
};

export const signup = (authdata, navigate) => async (dispatch) => {
  try {
    // Check mobile time restriction
    if (isMobileDevice()) {
      if (!isWithinAllowedHours()) {
        dispatch({
          type: ActionTypes.TIME_RESTRICTION,
          payload: {
            message: "Mobile access is only allowed between 10 AM and 1 PM",
          },
        });
        return;
      }
    }

    const { data } = await api.signup(authdata);
    dispatch({ type: "AUTH", data });
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
    dispatch(fetchallusers());
    navigate("/");
  } catch (error) {
    console.log(error);
    dispatch({
      type: ActionTypes.AUTH_FAIL,
      payload: error.response?.data?.message || "Signup failed",
    });
  }
};

export const login = (formData) => async (dispatch) => {
  try {
    // Check mobile time restriction
    if (isMobileDevice()) {
      if (!isWithinAllowedHours()) {
        dispatch({
          type: ActionTypes.TIME_RESTRICTION,
          payload: {
            message: "Mobile access is only allowed between 10 AM and 1 PM",
          },
        });
        return {
          payload: {
            timeRestricted: true,
            message: "Mobile access is only allowed between 10 AM and 1 PM",
          },
        };
      }
    }

    console.log("Login request data:", formData);
    const { data } = await api.login(formData);
    console.log("Login response data:", data);

    if (data.requiresOTP) {
      dispatch({
        type: ActionTypes.REQUIRE_OTP,
        payload: {
          email: formData.email,
          requiresOTP: true,
        },
      });
      return {
        payload: data,
      };
    }

    dispatch({ type: "AUTH", data });
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
    return {
      payload: data,
    };
  } catch (error) {
    console.error("Login error in action:", error);
    dispatch({
      type: ActionTypes.AUTH_FAIL,
      payload: error.response?.data?.message || "Login failed",
    });
    throw error;
  }
};

export const verifyOTP = (otpData, navigate) => async (dispatch) => {
  try {
    // Check mobile time restriction
    if (isMobileDevice()) {
      if (!isWithinAllowedHours()) {
        dispatch({
          type: ActionTypes.TIME_RESTRICTION,
          payload: {
            message: "Mobile access is only allowed between 10 AM and 1 PM",
          },
        });
        return;
      }
    }

    dispatch({ type: ActionTypes.AUTH_START });

    const { data } = await api.verifyOTP({
      email: otpData.email,
      otp: otpData.otp,
    });

    dispatch({
      type: ActionTypes.AUTH_SUCCESS,
      payload: data,
    });

    localStorage.setItem("Profile", JSON.stringify(data));
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
    navigate("/");
  } catch (error) {
    dispatch({
      type: ActionTypes.AUTH_FAIL,
      payload: error.response?.data?.message || "Invalid OTP",
    });
    throw error;
  }
};

// Optional: Add action creator for handling time restriction explicitly
export const checkTimeRestriction = () => {
  if (isMobileDevice() && !isWithinAllowedHours()) {
    return {
      type: ActionTypes.TIME_RESTRICTION,
      payload: {
        message: "Mobile access is only allowed between 10 AM and 1 PM",
      },
    };
  }
  return null;
};
