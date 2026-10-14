const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN || '7d'
    });
};

exports.register = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(409).json({success : false, message : "Email already registered"});
        }

        const user = await User.create({email, password});
        const token = generateToken(user._id);

        res.status(201).json({
            success : true,
            token,
            user : {id: user._id, email : user.email}
        });
    } catch(error){
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({success : false, message : 'Provide email and password'});
        }

        const user = await User.findOne({email}).select('+password');
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({success : false, message : 'Invalid credentials'});
        }

        const token = generateToken(user._id);
        res.status(200).json({
            success : true,
            token,
            user : {id: user._id, email : user.email}
        });
    } catch(error){
        next(error);
    }
};