const mongoose=require('mongoose');
const bcrypt=require('bcrypt')
const Schema=mongoose.Schema;
const userSchema=new Schema({
    username:String,
    password:String,
})
// Hash the password before saving the user
userSchema.pre('save', function (next) {
    const user = this;
  
    // Generate a salt to hash the password
    //salt is basically a random value added before hashing
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
  
      // Hash the password with the generated salt
      //It is taking password as well as salt 
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
         //Storing password as a hash password
        // Replace the plain password with the hashed password
        user.password = hash;
        next();
      });
    });
  });
  
module.exports=mongoose.model('user',userSchema)