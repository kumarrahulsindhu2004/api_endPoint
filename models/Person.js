import mongoose, { model } from "mongoose";
// define the Person
const personSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    age:{type:Number},
    work:{type:String,enum:['chef','waiter','manager'],require:true},
    mobile:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    address:{type:String,require:true},
    salary:{type:Number,require:true}
})

// Create Person Model

export const Person = mongoose.model('Person',personSchema);
