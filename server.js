import express from "express";
import { connectDB } from "./db.js";
import bodyParser from "body-parser";
import personRoute from "./routes/personRoutes.js";
import menuRoute from './routes/menuRoutes.js'
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import { Person } from "./models/Person.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

// middleware funcation
const logRequest = (req,res,next)=>{
  console.log(`[${new Date().toLocaleDateString()}] Request Made to : ${req.originalUrl}`);
  next();
  
}

// dataBase Connection
connectDB();

// executive middleware 
app.use(express.json());
app.use(logRequest)

// implement auth
passport.use(new LocalStrategy (async (username,password,done)=>{
  try {
    console.log('Received credentials: ',username,password);
    const user = await Person.findOne({username:username})
    if(!user)
      return done(null, false,{message:'Incorrent username'})
    
    const isPasswordMatch = user.password === password? true:false;
     if (!isPasswordMatch) {
        return done(null, false, { message: "Incorrect password" });
      } 
      return done(null, user);
  } catch (error) {
    // console.log(error);
    return done(error)
  }
}))
//app routres 
app.use(passport.initialize())



app.post("/", 
  passport.authenticate("local", { session: false }), 
  (req, res) => {
    res.send("Welcome on the server");
  }
);

app.use('/person',personRoute);
app.use('/menu',menuRoute);
  


// server create 
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);

});
