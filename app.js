if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path=require("path");
const bodyParser = require("body-parser")
const $ = require("jquery");
const mongoose = require("mongoose");
const _ = require("lodash");
const Mensagem = require("./models/contatos.js")
const Post = require("./models/posts.js")
const User = require("./models/users.js")
const methodOverride = require("method-override")
const bcrypt = require("bcrypt");
const session = require("express-session");
const saltRounds = 10;
app.use(express.static(path.join(__dirname,"public")))
// app.use(express.static("public"))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }))
const secret = process.env.SECRET || "segredo";
app.use(session({secret}))
app.set("view engine", "ejs")
app.set("views",path.join(__dirname,'/views'))

let subject = "";
//let logged =false;

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/eduardo-tangara";

mongoose.connect(dbUrl,{
  useNewUrlParser:true,
  // useCreateIndex:true,
  useUnifiedTopology:true
})

mongoose.connection.on("error",console.error.bind(console,"connection error:"));
mongoose.connection.once("open", ()=>{
  console.log("Database connected");
});




app.get("/", (req, res)=>{
  res.render("index")
})


// livros /////////////////////
app.route("/livros")

.get((req,res)=>{
  res.render("livros");
})
.post((req,res)=>{
  subject=req.body.assunto;
  res.redirect("/contato");
});


// contato //////////////////////////
app.route("/contato")

.get((req, res)=>{
  const assunto = subject;
  subject="";
  res.render("contato", {subject: assunto});
})
.post(async(req,res)=>{
      const {nome} = req.body;
      const {email} = req.body;
      const {assunto} = req.body;
      const {msg} = req.body;
      const contato = new Mensagem(
        {
          nome:nome,
          email: email,
          assunto:assunto,
          mensagem:msg
        })
      await contato.save();
      res.render("enviado", {nome:nome});//melhorar a pagina de enviados
});



// lambe /////////////////
app.route("/lambe")

.get((req,res)=>{
  res.render("lambe");
})
.post((req,res)=>{
  subject=req.body.assunto;
  res.redirect("/contato");
});


// contacao /////////
app.route("/contacao")

.get((req,res)=>{
  res.render("contacao");
})
.post((req,res)=>{
  subject=req.body.assunto;
  res.redirect("/contato");
});


// definindo a parte do blog ///////////////
// rotas: /posts , /posts/:title

app.route("/posts")
.get(async(req,res)=>{
  const posts = await Post.find({});
  res.render("posts", {posts:posts,_:_});
})
.post(async(req,res)=>{
  if(req.session.user_id){
    const titulo = req.body.postTitle
    const subtitulo = req.body.subTitle
    const postagem = req.body.postContent
    const keywords = req.body.keywords
    const data = Date()
    const newPost = new Post({
      titulo:titulo,
      subtitulo:subtitulo,
      postagem: postagem,
      data:data,
      keywords:keywords
    })
    await newPost.save()
  // res.send("post com sucesso")
    res.redirect("/posts/"+_.kebabCase(titulo));
  }
  else{res.redirect("/login")};
})

app.post("/new",(req,res)=>{
  if(req.session.user_id){
    res.render("new");
  }
  else{res.redirect("/login")};
})

app.route("/posts/:postTitle")

.get(async(req,res)=>{
  const postTitle = req.params.postTitle;
  // console.log(postTitle);
  const postagens = await Post.find({});
  const posts= postagens.reverse();
  // console.log(await Post.find({titulo:postTitle}));
  posts.forEach(async(post) => {
    if(_.kebabCase(post.titulo)===postTitle){
      const postProximo = await Post.findOne({_id:{$gt:post.id}}).limit(1);
      const postAnterior = await Post.findOne({_id:{$lt:post.id}}).sort({_id:-1}).limit(1);
      if(postProximo && postAnterior){
      const texto = post.postagem.replace(/(\r\n|\r|\n)/g, '<br>');
      res.render("post",{postagem:post, texto:texto, postProximo:postProximo.titulo,postAnterior:postAnterior.titulo, _:_});
      }
      else if(postProximo && !postAnterior){
      const texto = post.postagem.replace(/(\r\n|\r|\n)/g, '<br>');
      res.render("post",{postagem:post, texto:texto, postProximo:postProximo.titulo,postAnterior:"",_:_});
      }
      else if(!postProximo && postAnterior){
      const texto = post.postagem.replace(/(\r\n|\r|\n)/g, '<br>');
      res.render("post",{postagem:post, texto:texto, postProximo:"",postAnterior:postAnterior.titulo, _:_});
      }
      else{
        const texto = post.postagem.replace(/(\r\n|\r|\n)/g, '<br>');
        res.render("post",{postagem:post, texto:texto, postProximo:"", postAnterior:""});
      }
    }
  })
})
.put(async(req,res)=>{
  if(req.session.user_id){
  const id =req.params.postTitle;
  await Post.findByIdAndUpdate(id,{
    titulo : req.body.postTitle,
    subtitulo:req.body.subTitle,
    postagem : req.body.postContent,
    data : req.body.dia,
    keywords : req.body.keywords
  },{new:true});
  res.redirect("/posts/"+_.kebabCase(req.body.postTitle));
  }
  else{res.redirect("/login")}
})
.delete(async(req,res)=>{
  if(req.session.user_id){
  const id =req.params.postTitle;
  await Post.findByIdAndDelete(id);
  res.redirect("/admin");
  }
  else{res.redirect("/login")}
})

app.get("/posts/:id/edit",async (req,res)=>{
  if(req.session.user_id){
    const{id} =req.params;
    const post = await Post.findById(id);
    res.render("edit",{post:post});
  }
  else{res.redirect("/login")}
})



// ///autenticacao/////////////

app.get("/login",(req,res)=>{
  res.render("login");
})


app.get("/admin", async(req,res)=>{
  if(req.session.user_id){
  const posts = await Post.find({});
  res.render("admin",{posts:posts, _:_});}
  else{res.redirect("/login")}
})

app.post("/login", async(req,res)=>{
  const {username, password} = req.body;
  //const password =req.body.password;
  //const foundUser = await User.findOne({username:username});
  const foundUser = await User.validate(username, password);
  if(foundUser){
    // bcrypt.compare(password, foundUser.password, function(err,result){
    //   if(result){
        // const posts = await Post.find({});
        // res.render("edit-criar",{posts:posts, _:_});
        //logged=true;
        req.session.user_id = foundUser._id;
        res.redirect('/admin');
      }
    else res.send("Usuário ou senha incorreta");
})
//   }else res.send("Usuário ou senha incorreta")
// })

app.post("/logout",(req,res)=>{
  //logged =false;
  req.session.destroy((err)=>{
    if(err){ console.log(err);}
    else  res.redirect("/");
  })
})


app.get("*",(req,res)=>{
  res.render("not-found");
})

// Pensar bem essa parte, se não é melhor mandar para uma pagina de compra com um qr code ou coisa parecida
// app.post("/contato",(req,res)=>{
//   const assunto = req.body.assunto;
//   console.log(assunto);
//   res.render("contato",{assunto:assunto})
// })

const port = process.env.PORT || 3000
app.listen(port,()=>{
  console.log(`Server up and running on port ${port}`);
})
