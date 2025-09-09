import e from "express";
import { Person } from "../models/Person.js";
const route = e.Router();
route.post('/',async (req,res)=>{
    try {
        const data = req.body;
        const newPerson = new Person(data);
        const response = await newPerson.save();
        console.log('data saved');
        res.status(200).json(response)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal Server Error'});
    }
})

route.get('/',async (req,res)=>{
    try {
        const data = await Person.find();
        console.log('data fetched');
        res.status(200).json(data);        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal Server Error'})
    }
})

route.get('/:workType', async (req, res) => {
    try {
        const workType = req.params.workType;
        if (workType === 'chef' || workType === 'manager' || workType === 'waiter') {
            const people = await Person.find({ work: workType });
            console.log('response fetched');
            res.status(200).json(people);
        } else {
            res.status(400).json({ error: 'Invalid work type' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

route.put('/:id',async(req,res)=>{
    try {
        const personId = req.params.id;
        const updatedPersonData = req.body;

        const response = await Person.findByIdAndUpdate(personId,updatedPersonData,{
            new:true,
            runValidators:true
        })
        if(!response){
            return res.status(404).json({error:'Person not found'})
        }
        console.log('data updated');
        res.status(200).json(response)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal Server Error'})
    }
})


route.delete('/:id', async (req, res) => {
  try {
    const personId = req.params.id;
    const response = await Person.findByIdAndDelete(personId);

    if (!response) {
      return res.status(404).json({ error: 'Person not found' });
    }

    console.log('Data deleted:', response);
    return res.status(200).json({ message: 'Person deleted successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default route;
