const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username:String,
  password:String
})

userSchema.statics.validate = async function(username, password){
  const foundUser = await this.findOne({username});
  if(foundUser){
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
  }
  return false
}

module.exports = mongoose.model("User",userSchema);
