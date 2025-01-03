import mongoose from "mongoose";

const userschema = mongoose.Schema({
    browsername: { type: String, required: true },
    browserversion: { type: String, required: true },
    os: { type: String, required: true },
    device: { type: String, required: true },
    ip: { type: String, required: true },
}, {
    timestamps: true
});

export default mongoose.model("UserInfo", userschema)