import express from "express"
import { Askquestion,getallquestion,deletequestion,votequestion,sendotp ,verifyotp} from "../controller/Question.js"

import auth from '../middleware/auth.js';
import upload from "../middleware/upload.js"

const router=express.Router();

router.post('/Ask', auth, upload.single('questionVideo'), Askquestion);
router.get('/get',getallquestion);
router.delete("/delete/:id",auth,deletequestion);
router.patch("/vote/:id",auth,votequestion)
router.post("/sendotp",sendotp);
router.post("/verifyotp",verifyotp);


export default router;