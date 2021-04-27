
/*module define */
var express = require('express');
var mysql = require('mysql');
var flash = require('express-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var async = require('async');
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
app.use(express.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));
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
    con.query('SELECT src, date, likes, username FROM images JOIN users WHERE users.idusers=images.idusers;',function(err, result){
        if(err){
            throw err;
        }
        res.render('index.ejs',{
            sessionUsername: req.session.username,
            images: result
        });
    });    
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
                res.redirect('/upload');
            }
            else{
                req.flash("errorLogin","Please enter valid username/password.");
                res.redirect('/login');
            }
        });
    });


app.route('/logout')
    .get(function(req,res){
        req.session.destroy();
        res.redirect('/');
    });

app.route('/signup')
    .post(function(req,res){
        if(checkAlphaNumeric(req.body.signupusername)){
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
        } else{
            req.flash("errorUsername","Your username should only contain numbers and letters");
            res.redirect('/login');
        }
        
    });


app.route('/upload')
    .get(function(req,res){
        if(req.session.username){
            res.render('upload.ejs',{"sessionUsername":req.session.username});
        } else{
            res.redirect('/login');
        }
    })
    .post(function(req,res){
        var image = req.body;
        if(image!=null){
            var imageData = JSON.parse(image.data);
            var imageName = JSON.parse(image.imageName);
            var time = getTime();
            async.forEach(imageData, function(data){
                var buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/,""),'base64');
                fs.writeFileSync('static/uploads/'+imageName[imageData.indexOf(data)],buffer);
                var mysql = "INSERT INTO images(src, date, likes, idusers) VALUES ('"+data+"', '"+time+"', 0, (select idusers from users where username='"+req.session.username+"'))";
                con.query(mysql,function(err){
                    if(err){
                        throw err;
                    }
                });
            });
            /*here is the part to combine time with it*/
            req.flash("successUpload", "You have uploaded your image");
            res.send("You have successfully uploaded your image");
        }else{
            req.flash("faildUpload","You didn't select any image!");
            res.send("error");
        }
    });

app.route('/like')
    .post(function(req,res){

    });

app.route('/comment')
    .post(function(req,res){

    });

app.route('/getImages')
    .post(function(req,res){
      
    });


function getTime(){
    var year = new Date().getFullYear();
    var month = new Date().getMonth()+1;
    var day = new Date().getDate();
    var hour = new Date().getHours();
    var mins = new Date().getMinutes();
    var second = new Date().getSeconds();
    var time = timeToString(year)+"-"+timeToString(month)+'-'+timeToString(day)+' '+timeToString(hour)+':'+timeToString(mins)+':'+timeToString(second);
    console.log(time);
    return time;
}

function timeToString(data){
    if(data<10){
        data="0"+data.toString();
    } else{
        data=data.toString();
    }
    return data
}

function checkAlphaNumeric(data){
    for(var i=0; i<data.length;i++){
        var temp = data.charCodeAt(i);
        if (!(temp > 47 && temp < 58) &&        // numeric (0-9)
            !(temp > 64 && temp < 91) &&        // upper alpha (A-Z)
            !(temp > 96 && temp < 123))         // lower alpha (a-z)
        {       
            return false;
        }
    }
    return true
}