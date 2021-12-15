//arquivo js para criar o esquema dos dados de contato

//banco em mongodb
const mongoose = require("mongoose");

//montando o modelo
const mensagemSchema = new mongoose.Schema({
  nome: {
    type: String,
    required:"Nome é obrigatório"
  },
  email: {
    type: String,
    required:"email é obrigatório",
    match:[/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Por favor coloque um email válido`]
  },
  assunto: {
    type: String,
    required:"assunto é obrigatório"
  },
  mensagem: {
    type: String,
    required:"escreva uma mensagem"
  }
});

//Definir banco de dados
module.exports = mongoose.model("Mensagem", mensagemSchema);
