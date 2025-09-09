import mongoose from "mongoose";
const mongourl = 'mongodb://localhost:27017/hotels'
export   async function connectDB() {
    try {
        await mongoose.connect(mongourl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
        console.log("MongoDB connected");
        
    } catch (error) {
        console.log("Error found", error);
        
    }
}