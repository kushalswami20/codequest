import React, { useState, useEffect } from 'react';
import Leftsidebar from '../../Comnponent/Leftsidebar/Leftsidebar';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Avatar from '../../Comnponent/Avatar/Avatar';
import Editprofileform from './Edirprofileform';
import Profilebio from './Profilebio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake, faPen } from '@fortawesome/free-solid-svg-icons';

const UserProfile = ({ slidein }) => {
  const { id } = useParams();
  const [Switch, setSwitch] = useState(false);
  const navigate = useNavigate();

  const users = useSelector((state) => state.usersreducer) || [];
  const currentuser = useSelector((state) => state.currentuserreducer);
  
  // Find the current profile with null check
  const currentprofile = users.find((user) => user?._id === id);

  // If no profile is found, you might want to show a loading state or redirect
  if (!currentprofile) {
    return (
      <div className="home-container-1">
        <Leftsidebar slidein={slidein} />
        <div className="home-container-2">
          <section>
            <div className="user-details-container">
              <h1>User not found</h1>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Helper function to safely get the first letter of name
  const getNameInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper function to safely format date
  const getJoinedDate = (date) => {
    return date ? moment(date).fromNow() : 'unknown date';
  };

  return (
    <div className="home-container-1">
      <Leftsidebar slidein={slidein} />
      <div className="home-container-2">
        <section>
          <div className="user-details-container">
            <div className="user-details">
              <Avatar 
                backgroundColor="purple" 
                color="white" 
                fontSize="50px" 
                px="40px" 
                py="30px"
              >
                {getNameInitial(currentprofile.name)}
              </Avatar>
              <div className="user-name">
                <h1>{currentprofile.name}</h1>
                <p>
                  <FontAwesomeIcon icon={faBirthdayCake} /> Joined{" "}
                  {getJoinedDate(currentprofile.joinedon)}
                </p>
              </div>
            </div>
            {currentuser?.result?._id === id && (
              <button 
                className="edit-profile-btn" 
                type="button" 
                onClick={() => setSwitch(true)}
              >
                <FontAwesomeIcon icon={faPen} /> Edit Profile
              </button>
            )}
          </div>
          <>
            {Switch ? (
              <Editprofileform 
                currentuser={currentuser} 
                setswitch={setSwitch}
              />
            ) : (
              <Profilebio currentprofile={currentprofile} />
            )}
          </>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;