const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  titulo: String,
  subtitulo: String,
  postagem: String,
  data:String,
  keywords: [{type:String}]
})

module.exports = mongoose.model("Post", postSchema);
