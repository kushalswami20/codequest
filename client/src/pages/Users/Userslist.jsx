import React, { useEffect } from 'react';
import './Users.css';
import User from './User';
import { useSelector, useDispatch } from "react-redux";
import { fetchallusers } from '../../action/users'; // adjust path as needed

const Userslist = () => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.usersreducer);
    
    useEffect(() => {
        dispatch(fetchallusers());
    }, [dispatch]);

    // Add loading state
    if (!users) return <div>Loading...</div>;
    
    // Ensure users is an array
    const userArray = Array.isArray(users) ? users : [];

    return (
        <div className="user-list-container">
            {userArray.length === 0 ? (
                <div>No users found</div>
            ) : (
                userArray.map((user) => (
                    <User user={user} key={user?._id}/>
                ))
            )}
        </div>
    );
};

export default Userslist;