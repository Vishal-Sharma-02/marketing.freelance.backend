import jwt from 'jsonwebtoken';
import User  from "../models/user.js";

const userAuth = async (req,res,next)=>{
    
  try{    
    const {token} = req.cookies;
    if(!token){
      return res.status(401).send("Login !!")
    }
    const decodeObj = await jwt.verify(token, process.env.JWT_SECRET);
    const {_id} = decodeObj;
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User does not exit");
   } 
   req.user = user;
   next();
}catch(err){
    res.status(400).send("ERROR : " + err.message);
}}

export default userAuth;