import express from "express";
import { connectDB } from "./db.js";
import bodyParser from "body-parser";
import personRoute from "./routes/personRoutes.js";
import menuRoute from './routes/menuRoutes.js'
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000
// middleware funcation
const logRequest = (req,res,next)=>{
  console.log(`[${new Date().toLocaleDateString()}] Request Made to : ${req.originalUrl}`);
  next();
  
}
connectDB();
app.use(express.json());
app.use(logRequest)
app.get("/", (req, res) => {
  res.send("Welcome on the server");
});
app.use('/person',personRoute);
app.use('/menu',menuRoute);
  



app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);

});
