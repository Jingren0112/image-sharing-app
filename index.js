/*module define */
var express = require('express');
var mysql = require('mysql');
var flash = require('express-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
const {complie} = require('ejs');
var port = 8000;
var app = express();
var con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'12345678',
    database:'imagesharingapp',
    port:3306,
    multipleStatements:true,
});

/*module initialization */
app.use(express.static("static"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());
app.use(session({
    secret:'c9fab6de6998e720216099b5871209b9588cea69',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:60000}
}))
app.use(flash());
app.set("view_engine","ejs");
app.set("views","view");
app.listen(port);
console.log("App running on http://localhost:"+port);

/*route handling method */
app.route("/").get(function(req,res){
        res.render('index.ejs',{sessionUsername: req.session.Username});
    });
  
app.route('/login')
    .get(function(req,res){
        res.render('login.ejs',{sessionUsername: req.session.username});
    })
    .post(function(req,res){
        var sql="SELECT username FROM users WHERE username='"+req.body.loginusername+"' AND password='"+req.body.loginpassword+"';";
        con.query(sql,function(err,result){
            if(err){
                throw err;
            }
            if(result.length>0){
                req.session.username = req.body.loginusername;
                res.redirect('/profile');
            }
            else{
                req.flash("errorLogin","Please enter valid username/password.");
                res.redirect('/login');
            }
        });
    });

app.route('/signup')
    .post(function(req,res){
        con.query("INSERT INTO users(username, password, email) VALUES('"+req.body.signupusername+"','"+req.body.password+"','"+req.body.email+"')",function(err){
            if(err){
                if(err.errno==1062){
                    req.flash("errorSignup","Username already exisit.");
                    console.log("error, flashed!");
                    res.redirect('/login');
                }else{
                    throw err;
                }
            }else{
                req.flash("successSignup","Signup successfull, please login.");
                res.redirect('/login');
            }
        });
    });

app.route('/profile')
    .get(function(req,res){
        res.render('profile.ejs',{"sessionUsername":req.session.username});
    })
    .post(function(req,res){

    });

app.route('/upload')
    .post(function(req,res){

    });

app.route('/like')
    .post(function(req,res){

    });

app.route('/comment')
    .post(function(req,res){

    });
