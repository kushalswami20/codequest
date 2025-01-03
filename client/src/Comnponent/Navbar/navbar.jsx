import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import bars from '../../assets/bars-solid.svg';
import logo from '../../assets/logo.png';
import search from '../../assets/search-solid.svg';
import Avatar from '../Avatar/Avatar';
import './navbar.css';
import { setcurrentuser } from '../../action/currentuser';

function Navbar({ handleslidein }) {
    const User = useSelector((state) => state.currentuserreducer);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handlelogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/");
        dispatch(setcurrentuser(null));
    };

    useEffect(() => {
        const token = User?.token;
        if (token) {
            try {
                const decodedtoken = jwtDecode(token);
                if (decodedtoken.exp * 1000 < new Date().getTime()) {
                    handlelogout();
                }
            } catch (error) {
                console.error("Token decode error:", error);
                handlelogout();
            }
        }
        
        // Get profile from localStorage
        const profileData = localStorage.getItem("Profile");
        if (profileData) {
            try {
                const parsedProfile = JSON.parse(profileData);
                dispatch(setcurrentuser(parsedProfile));
            } catch (error) {
                console.error("Profile parse error:", error);
                localStorage.removeItem("Profile");
            }
        }
    }, [User?.token, dispatch]);

    // Get display name with proper null checks
    const getDisplayName = () => {
        if (!User?.result?.name) return '?';
        return User.result.name.charAt(0).toUpperCase();
    };

    return (
        <nav className="main-nav">
            <div className="navbar">
                <button className="slide-in-icon" onClick={() => handleslidein()}>
                    <img src={bars} alt="bars" width='15' />
                </button>
                <div className="navbar-1">
                    <Link to='/' className='nav-item nav-logo'>
                        <img src={logo} alt="logo" />
                    </Link>
                    <Link to="/" className="nav-item nav-btn res-nav">About</Link>
                    <Link to="/" className="nav-item nav-btn res-nav">Products</Link>
                    <Link to="/" className="nav-item nav-btn res-nav">For Teams</Link>
                    <form>
                        <input type="text" placeholder='Search...' />
                        <img src={search} alt="search" width='18' className='search-icon' />
                    </form>
                </div>
                <div className="navbar-2">
                    {!User?.result ? (
                        <Link to='/Auth' className='nav-item nav-links'>Log in</Link>
                    ) : (
                        <>
                            <Avatar 
                                backgroundColor='#009dff' 
                                px='10px' 
                                py='7px' 
                                borderRadius='50%' 
                                color="white"
                            >
                                <Link 
                                    to={`/Users/${User.result._id}`} 
                                    style={{ color: "white", textDecoration: "none" }}
                                >
                                    {getDisplayName()}
                                </Link>
                            </Avatar>
                            <button className="nav-tem nav-links" onClick={handlelogout}>
                                Log out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;