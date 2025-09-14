import mongoose, { model } from "mongoose";
import passport from "passport";
// define the Person
const personSchema = new mongoose.Schema({
    name: { type:String, required:true },
  age: { type:Number },
  work: { type:String, enum:['chef','waiter','manager'], required:true },
  mobile: { type:String, required:true },
  email: { type:String, required:true, unique:true },
  address: { type:String, required:true },
  salary: { type:Number, required:true },
  username: { type:String, required:true },
  password: { type:String, required:true }   // ✅ fix he
})

// Create Person Model

export const Person = mongoose.model('Person',personSchema);
