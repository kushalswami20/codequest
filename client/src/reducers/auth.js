const authReducer = (state = { authData: null }, action) => {
    switch (action.type) {
        case "AUTH_START":
            return { ...state, loading: true, error: null };
            
        case "AUTH_SUCCESS":
            localStorage.setItem('Profile', JSON.stringify(action?.payload));
            return { 
                ...state, 
                authData: action.payload, 
                loading: false, 
                error: null,
                timeRestriction: null 
            };
            
        case "AUTH_FAIL":
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };
            
        case "LOGOUT":
            localStorage.clear();
            return { 
                ...state, 
                authData: null, 
                loading: false, 
                error: null,
                timeRestriction: null 
            };
            
        case "REQUIRE_OTP":
            return {
                ...state,
                requiresOTP: true,
                email: action.payload.email
            };
            
        case "TIME_RESTRICTION":
            return {
                ...state,
                timeRestriction: {
                    isRestricted: true,
                    message: action.payload.message
                }
            };
            
        case "AUTH":
            localStorage.setItem('Profile', JSON.stringify({ ...action?.data }));
            return { ...state, authData: action?.data };
            
        default:
            return state;
    }
};

export default authReducer;