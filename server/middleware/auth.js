import express from 'express';
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from 'path';



// Auth middleware
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);
            req.userid = decodedData?.id;
            
            if (!req.userid) {
                return res.status(401).json({ message: "Invalid token payload" });
            }

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" });
            }
            throw jwtError;
        }

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ message: "Server error during authentication" });
    }
};

// Export both middleware functions
export default auth;