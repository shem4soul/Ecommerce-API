const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');   
const CustomError = require('../errors');
const {createTokenUser, attachCookiesToResponse} = require('../utils')

const getAllUsers = async (req, res) => {
  console.log(req.user);
  
const users = await User.find({role:'user'}).select('-password'); 
  if (!users) {
    throw new CustomError.NotFoundError('No users found');
  }
  res.status(StatusCodes.OK).json({ users, count: users.length });
}

const getSingleUser = async (req, res) => {
 const user = await User.findOne({_id: req.params.id}).select('-password'); // Exclude password field
 if (!user) {
    throw new CustomError.NotFoundError(`No user found with id: ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ user });  
}

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user }); // Assuming req.user is set by authentication middleware
}   

const updateUser =  async (req, res) => {
const {email, name} = req.body
 if (!email || !name ) {
  throw new CustomError.BadRequestError('please provide all values')
 }
 const user = await User.findOneAndUpdate(
   {_id: req.user.userId},
   {email, name},
   {new: true, runValidators: true} 
  )
const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});
  res.status(StatusCodes.OK).json({ user: tokenUser });

};  
const updateUserPassword = async (req, res) => {
 const {oldPassword, newPassword} = req.body;
if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values')  
        }
 const user = await User.findOne({_id: req.user.userId});
 const isPasswordCorrect = await user.comparePassword(oldPassword);
 if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
}   

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
}   