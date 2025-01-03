import express from "express"
import  {googleCallback, login,signup,googleInit,verifyOTP,resendOTP } from '../controller/auth.js'
import { getallusers,updateprofile,createUserInfo, getAllUserInfo, getUserInfoByIp } from "../controller/users.js";
import auth from "../middleware/auth.js"


const router=express.Router();

router.post("/signup",signup);
router.post('/login', login);
router.get("/auth/google",googleInit);
router.get("/auth/google/callback",googleCallback);
router.get("/getallusers",getallusers)
router.patch("/update/:id",auth,updateprofile)
// routes/users.js
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);


router.post('/', createUserInfo);
router.get('/', getAllUserInfo);
router.get('/:ip', getUserInfoByIp);


export default router