import mongoose from "mongoose"
import users from '../models/auth.js'
import UserInfo from '../models/userinfo.js'; 

export const getallusers = async (req, res) => {
    try {
        const allusers = await users.find()
        const alluserdetails = [];
        allusers.forEach((user) => {
            alluserdetails.push({_id:user._id,
                name:user.name,
                about:user.about,
                tags:user.tags,
                joinedon:user.joinedon,
            });     
        });
        res.status(200).json(alluserdetails)
    } catch (error) {
        res.status(404).json({message:error.message})
        return
    }
}
export const updateprofile=async(req,res)=>{
    const{id:_id}=req.params;
    const {name,about,tags}=req.body;
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(404).send("user unavailable");
    }
    try {
        const updateprofile=await users.findByIdAndUpdate(_id,{$set:{name:name,about:about,tags:tags}},
            {new:true}
        );
        res.status(200).json(updateprofile)
    } catch (error) {
        res.status(404).json({message:error.message})
        return
    }
}

export const createUserInfo = async (req, res) => {
    try {
        // Check if an entry with this IP already exists from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingEntry = await UserInfo.findOne({
            ip: req.body.ip,
            createdAt: { $gte: today }
        });

        // If entry already exists, don't create a new one
        if (existingEntry) {
            return res.status(200).json({ message: 'Entry already exists for today' });
        }

        // Create new entry
        const userInfo = new UserInfo({
            browsername: req.body.browsername,
            browserversion: req.body.browserversion,
            os: req.body.os,
            device: req.body.device,
            ip: req.body.ip
        });

        await userInfo.save();
        res.status(201).json({ message: 'User info saved successfully' });

    } catch (error) {
        console.error('Error saving user info:', error);
        res.status(500).json({ message: 'Error saving user information' });
    }
};

// Get all user info records
export const getAllUserInfo = async (req, res) => {
    try {
        const userInfos = await UserInfo.find();
        res.status(200).json(userInfos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user info by IP
export const getUserInfoByIp = async (req, res) => {
    try {
        const userInfo = await UserInfo.find({ ip: req.params.ip });
        if (userInfo.length === 0) {
            return res.status(404).json({ message: 'No records found for this IP' });
        }
        res.status(200).json(userInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};