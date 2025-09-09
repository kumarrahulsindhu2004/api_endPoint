import express from "express";
import { connectDB } from "./db.js";
import bodyParser from "body-parser";
import personRoute from "./routes/personRoutes.js";
import menuRoute from './routes/menuRoutes.js'
const app = express();
connectDB();

app.use(bodyParser.json())// 
app.use('/person',personRoute);
app.use('/menu',menuRoute);

app.get("/", (req, res) => {
  res.send("Welcome on the server");
});
  



app.listen(3000, () => {
  console.log("Server is running on 3000");
});
