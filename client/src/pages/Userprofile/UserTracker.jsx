import { useEffect , useState } from 'react';
import { useDispatch ,useSelector} from 'react-redux';
import { saveUserInfo,fetchallusers } from '../../action/users';

const UserTracker = () => {
const { users, userInfo } = useSelector(state => state);
const dispatch = useDispatch();

// Track user info
useEffect(() => {
    dispatch(saveUserInfo());
}, [dispatch]);

// Use existing functionality
useEffect(() => {
    dispatch(fetchallusers());
}, [dispatch]);
return null;
};

export default UserTracker;
