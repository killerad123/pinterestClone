var express = require('express');
const userModel = require('../models/users');
const passport = require('passport');
var router = express.Router();
const localStratergy = require("passport-local")
const upload = require("./multer")
const postModel = require("../models/post")

passport.use(new localStratergy(userModel.authenticate()))

router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});
router.get('/login', function(req, res, next) {
  res.render('loginpage',{nav:false});
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  const currentUser = await userModel
  .findOne({username:req.session.passport.user})
  .populate("posts")
  res.render('profile',{currentUser,nav:true});
});

router.get('/post',isLoggedIn,async function(req, res, next) {
  const currentUser = await userModel.findOne({username:req.session.passport.user})

  res.render('post',{currentUser,nav:true});
});

router.get('/showpins',isLoggedIn,async(req,res)=>{
  const currentUser = await userModel
  .findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("showuserpins",{nav:true,currentUser})
})

router.get('/feed',isLoggedIn,async (req,res)=>{
  const currentUser = await userModel
  .findOne({username:req.session.passport.user})
  const allposts = await postModel.find().populate("user")
  res.render("feed",{nav:true,currentUser,allposts})
})

router.get("/feed/:id/pinshow",isLoggedIn,async(req,res)=>{
  // const
  const pinid = req.params.id
  const pindata =await postModel.findOne({_id:pinid})
  .populate("user")
  res.render("pinshow",{nav:true,pindata})
})

router.post('/createpost',upload.single("postimage"),isLoggedIn,async function(req, res, next) {
  const currentUser = await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:currentUser._id,
    title:req.body.title,
    desc:req.body.desc,
    image:req.file.filename
  })
  currentUser.posts.push(post._id)
  await currentUser.save()
  res.redirect("/profile")
});

router.post("/register",async(req,res)=>{
const data =await new userModel({
  username:req.body.username,
  email:req.body.email,
  desc:req.body.desc,
  contact:req.body.contact,
  profilename:req.body.profilename

})
userModel.register(data,req.body.password)
.then(function () {
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile")
  })
})
})

router.post("/upload",isLoggedIn,upload.single('image'),async (req,res)=>{
  try{
    const currentUser = await userModel.findOne({username:req.session.passport.user})
    currentUser.profileImage = req.file.filename
    await currentUser.save()
  }
  catch(e){
    if(!req.file){
    return res.status(400).send("No files were uploaded")
  }
}
  res.redirect("/profile")
})

router.get("/updateprofile",isLoggedIn,async (req,res)=>{
  const currentUser = await userModel.findOne({username:req.session.passport.user})
  res.render("updateprofile",{nav:true,currentUser})
})
router.post("/updateprofile",isLoggedIn,upload.single('updateimage'),async (req,res)=>{
  try{
    const currentUser = await userModel.findOne({username:req.session.passport.user})
    currentUser.profileImage = req.file.filename
    currentUser.desc = req.body.desc
    await currentUser.save()
  }
  catch(e){
    if(!req.file){
    return res.status(400).send("No files were uploaded")
  }
}
  res.redirect("/profile")
})

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/"
}),function(req,res,next){
})

router.get("/logout",(req,res)=>{
  req.logOut(function(err){
    if(err){return next(err)}
    res.redirect("/")
  })
})

function isLoggedIn(req,res,next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect("/")
  }
}

module.exports = router;
