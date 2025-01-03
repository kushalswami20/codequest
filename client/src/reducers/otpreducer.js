export const otpReducer = (state = { loading: false, error: null, verified: false }, action) => {
    switch (action.type) {
        case 'OTP_LOADING':
            return { ...state, loading: true, error: null };
        case 'SEND_OTP_SUCCESS':
            return { ...state, loading: false, error: null };
        case 'SEND_OTP_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'VERIFY_OTP_SUCCESS':
            return { ...state, loading: false, error: null, verified: true };
        case 'VERIFY_OTP_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
export default otpReducer;