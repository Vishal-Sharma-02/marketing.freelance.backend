import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:50,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Address");
            }
        }
    },
    password:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
        minLength:10,
        maxLength:15,
        trim:true,
        unique:true,
    },
    state:{
        type:String,
        required:true,
    }
},
{
    timestamps:true
})

userSchema.methods.getJWT =async function(){
    const user = this;
    
    const token =  await jwt.sign({_id: user._id}, process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    return token;
}

userSchema.methods.validatePassword = async function(passwordEnterByUser){
    const user = this;
    const passwordHash = user.password;    
    const isPasswordValid=  await bcrypt.compare(passwordEnterByUser,passwordHash);
    return isPasswordValid;
}

export default mongoose.model("User",userSchema);