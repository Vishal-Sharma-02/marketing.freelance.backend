import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

const authRouter = express.Router();

authRouter.post("/auth/register", async(req,res)=>{
    try{
        
        const {fullName,sponserName,sponserId, emailId, password,mobile, state, packages} = req.body;
        
        if (!fullName || !emailId || !password || !mobile || !state || !packages) {
            return res.status(400).json({ message: "All * fields are required" });
        }

        const existingUser = await User.findOne({emailId:emailId});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        const passwordHash = await bcrypt.hash(password,10);
        const newUser = new User({
            fullName,
            sponserName,
            sponserId,
            emailId : emailId.toLowerCase(),
            password : passwordHash,
            mobile,
            state,
            packages
        });
        const savedUser = await newUser.save();
        
        const token =await savedUser.getJWT();
        res.cookie("token",token,{
            expires:new Date(Date.now()+  1*3600000),
        });

        return res.status(201).json({message:"User Registered Successfully", data:savedUser});

    }catch(err){
    return res.status(500).json({message:"Server Error", error: err.message});
}
})

authRouter.post("/auth/login", async(req,res)=>{
    try{
       const {emailId, password} = req.body;
        const isUser = await User.findOne({emailId:emailId});
        if(!isUser){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        
        
        const isPasswordValid =await isUser.validatePassword(password);

        if(isPasswordValid){ 
            const token = await isUser.getJWT();
            res.cookie("token",token,{
            expires:new Date(Date.now()+  1*3600000),
            }); 
            res.send(isUser);
        }
        else throw new Error("Invalid Credentials");
    }catch(err){
        return res.status(500).json({message:"Server Error", error: err.message});
    }
})

authRouter.get("/auth/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),    // cookie expires immediately
      httpOnly: true,
      sameSite: "lax"
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

export default authRouter;