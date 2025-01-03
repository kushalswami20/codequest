

// Action Types
export const USER_ACTIONS = {
    FETCH_USERS: 'FETCH_USERS',
    UPDATE_CURRENT_USER: 'UPDATE_CURRENT_USER',
    SAVE_USER_INFO_REQUEST: 'SAVE_USER_INFO_REQUEST',
    SAVE_USER_INFO_SUCCESS: 'SAVE_USER_INFO_SUCCESS',
    SAVE_USER_INFO_FAILURE: 'SAVE_USER_INFO_FAILURE'
};

const initialState = {
    users: [],
    userInfo: {
        loading: false,
        error: null,
        success: false
    }
};

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_USERS":
            return {
                ...state,
                users: action.payload
            };

        case "UPDATE_CURRENT_USER":
            return {
                ...state,
                users: state.users.map((user) =>
                    user._id === action.payload._id ? action.payload : user
                )
            };

        case USER_ACTIONS.SAVE_USER_INFO_REQUEST:
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    loading: true,
                    error: null,
                    success: false
                }
            };

        case USER_ACTIONS.SAVE_USER_INFO_SUCCESS:
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    loading: false,
                    success: true
                }
            };

        case USER_ACTIONS.SAVE_USER_INFO_FAILURE:
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    loading: false,
                    error: action.payload,
                    success: false
                }
            };

        default:
            return state;
    }
};

export default usersReducer;