const initialState = {
    data: null,
    isLoading: false,
    error: null,
    otp: {
        loading: false,
        sent: false,
        verified: false,
        error: null
    },
    uploadProgress: 0
};

const questionReducer = (state = initialState, action) => {
    switch (action.type) {
        // OTP Related Cases
        case 'OTP_LOADING':
            return {
                ...state,
                otp: {
                    ...state.otp,
                    loading: true,
                    error: null
                }
            };

        case 'SEND_OTP_SUCCESS':
            return {
                ...state,
                otp: {
                    ...state.otp,
                    loading: false,
                    sent: true,
                    error: null
                }
            };

        case 'SEND_OTP_ERROR':
            return {
                ...state,
                otp: {
                    ...state.otp,
                    loading: false,
                    sent: false,
                    error: action.payload
                }
            };

        case 'VERIFY_OTP_SUCCESS':
            return {
                ...state,
                otp: {
                    ...state.otp,
                    loading: false,
                    verified: true,
                    error: null
                }
            };

        case 'VERIFY_OTP_ERROR':
            return {
                ...state,
                otp: {
                    ...state.otp,
                    loading: false,
                    verified: false,
                    error: action.payload
                }
            };

        // Question Related Cases
        case "POST_QUESTION_START":
            return {
                ...state,
                isLoading: true,
                error: null
            };
            
        case "POST_QUESTION_SUCCESS":
            return {
                ...state,
                isLoading: false,
                data: state.data ? [action.payload, ...state.data] : [action.payload],
                error: null
            };
            
        case "POST_QUESTION_ERROR":
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };

        case "FETCH_ALL_QUESTIONS":
            return {
                ...state,
                data: action.payload,
                isLoading: false,
                error: null
            };

        case "POST_ANSWER":
            return {
                ...state,
                data: state.data.map(question => 
                    question._id === action.payload._id ? action.payload : question
                )
            };

        case "DELETE_QUESTION":
            return {
                ...state,
                data: state.data.filter(question => question._id !== action.payload)
            };

        case "UPLOAD_VIDEO_PROGRESS":
            return {
                ...state,
                uploadProgress: action.payload
            };

        // Reset OTP State
        case "RESET_OTP_STATE":
            return {
                ...state,
                otp: initialState.otp
            };

        default:
            return state;
    }
};

export default questionReducer;