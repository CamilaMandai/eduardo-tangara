const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = process.env.SaltRounds || 10;

const userSchema = new mongoose.Schema({
  username: String,
  password: String
})

userSchema.statics.validate = async function(username, password){
  const foundUser = await this.findOne({username});
  if(foundUser){
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
  }
  return false
}

userSchema.methods.create = async function(username, password) {
  let hashedPass = ''
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      hashedPass = hash;
    });
  })
  await this.insert({username: username, password: hashedPass})
};

module.exports = mongoose.model("User", userSchema);
