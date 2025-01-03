import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import userroutes from "./routes/user.js"
import questionroutes from "./routes/question.js"
import answerroutes from "./routes/answer.js"
import userInfoRoutes from "./routes/user.js";

const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }))
app.use(cors({
    origin: ['http://localhost:3000','https://codequest-xi.vercel.app/'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

app.use("/user", userroutes);
app.use('/questions', questionroutes)
app.use('/answer',answerroutes)
app.get('/', (req, res) => {
    res.send("Codequest is running perfect")
})
app.use('/userinfo', userInfoRoutes);

const PORT = process.env.PORT || 5000
const database_url = "mongodb+srv://admin:test@codequest.oigrd.mongodb.net/?retryWrites=true&w=majority&appName=codequest"

mongoose.connect(database_url)
.then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => { 
        console.log(`Server running on port ${PORT}`) 
    });
})
.catch((err) => {
    console.error('MongoDB Connection Error:', err);
});

// Optional: Add error handling for mongoose connection
// mongoose.connection.on('error', (err) => {
//     console.error('Mongoose connection error:', err);
// });