import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';
import { configDotenv } from 'dotenv';
configDotenv() 

const signup = async (req, res) => {
    try {
        console.log("in sugnup");
        
        const { name, email, password, role } = req.body;
        console.log(req.body);
        
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User already exists, you can login', success: false });
        }
        const userModel = new UserModel({ name, email, password ,role });
        userModel.password = await bcrypt.hash(password, 10);
        
        await userModel.save();
        res.status(201)
            .json({ 
                message: 'Signup successful',
                success: true
            });
    } catch (err) {
        console.log(err);
        
        res.status(500)
            .json({
                message: 'Internal server error',
                success: false
            });
    }
};

const login = async (req, res) => {
    console.log(req.body)
    try {
      
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
    
        const errorMsg = 'Auth failed, email or password is incorrect';
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403)
            
                .json({ message: errorMsg, success: false });
        }
  

        const payload = { email: user.email, _id: user._id };
        const jwtToken = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: '24h' });
     
        
        res.status(200)
            .json({
                message: 'Login successful',
                success: true,
                jwtToken,
                user
            });
    } catch (err) {
        console.log(err)
        res.status(500)
            .json({
                message: 'Internal server error',
                success: false
            });
    }
};

export { signup, login };
