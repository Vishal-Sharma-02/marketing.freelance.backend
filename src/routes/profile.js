import express from "express";
import userAuth from "../middleware/auth.js";

const profileRouter = express.Router();

profileRouter.get("/profile/view",userAuth,async (req,res)=>{
    try{
        const user = req.user;

        const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      emailId: user.emailId,
      mobile: user.mobile,
      state: user.state,
      createdAt: user.createdAt,
    };
        
        res.send(safeUser); 
    }catch(err){ 
        res.status(400).send("ERROR : " + err.message);
    }
})

export default profileRouter;