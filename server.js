import express from "express";
import { connectDB } from "./db.js";
import bodyParser from "body-parser";
import personRoute from "./routes/personRoutes.js";
import menuRoute from './routes/menuRoutes.js'
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000
connectDB();

app.use(express.json());
app.use('/person',personRoute);
app.use('/menu',menuRoute);

app.get("/", (req, res) => {
  res.send("Welcome on the server");
});
  



app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);

});
