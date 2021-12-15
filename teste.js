const bcrypt = require("bcrypt");
const saltRounds = 10;

bcrypt.hash("Carlsagan2",saltRounds,function(err, hash){
  const newUser = {
    username: "eduardo",
    password:hash
  };
  console.log(newUser);
  if(err){console.log(err);};
})
