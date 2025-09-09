import e from "express";
import { MenuItem } from "../models/Menu.js";
const router = e.Router();
router.post('/',async(req,res)=>{
    try {
        const data =req.body;
        const newMenu = new MenuItem(data);
        const response = await newMenu.save();
        console.log('menu item save');
        res.status(200).json(response)
        

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})        
    }
})

router.get('/',async(req,res)=>{
    try {
        const data = await MenuItem.find();
        console.log('data fetched');
        res.status(200).json(data);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal Server error'})
        
    }
})

router.get('/:taste',async(req,res)=>{
    try {
        const tasteof = req.params.taste;
        if(tasteof === 'sweet' || tasteof =='spicy' || tasteof =='sour'){
            const tasteIn = await MenuItem.find({taste:tasteof});
            console.log('data fetched');
            res.status(200).json(tasteIn)
        }else{
            res.status(400).json({error:'Invalid taste type'})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal server error'})
        
    }
})

export default router