import * as api from "../api";
import { USER_ACTIONS } from "../reducers/users"; //helper functions
// New user info tracking action
export const saveUserInfo = () => async (dispatch) => {
  try {
    dispatch({ type: USER_ACTIONS.SAVE_USER_INFO_REQUEST });

    const browserInfo = {
      browsername: getBrowserName(navigator.userAgent),
      browserversion: getBrowserVersion(navigator.userAgent),
      os: navigator.platform,
      device: /Mobile|Android|iPhone/i.test(navigator.userAgent)
        ? "Mobile"
        : "Desktop",
    };

    const { data } = await api.saveUserInfo(browserInfo);

    dispatch({
      type: USER_ACTIONS.SAVE_USER_INFO_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_ACTIONS.SAVE_USER_INFO_FAILURE,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

// Helper functions
const getBrowserName = (userAgent) => {
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  return "Unknown";
};

const getBrowserVersion = (userAgent) => {
  const match = userAgent.match(
    /(firefox|chrome|safari|opera|edge)[\/\s](\d+)/i
  );
  return match ? match[2] : "Unknown";
};

export const fetchallusers = () => async (dispatch) => {
  try {
    const { data } = await api.getallusers();
    dispatch({ type: "FETCH_USERS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const updateprofile = (id, updatedata) => async (dispatch) => {
  try {
    const { data } = await api.updateprofile(id, updatedata);
    dispatch({ type: "UPDATE_CURRENT_USER", payload: data });
  } catch (error) {
    console.log(error);
  }
};
