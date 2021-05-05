
/*module define */
var express = require('express');
var mysql = require('mysql');
var flash = require('express-flash');           //flash error/success
var session = require('express-session');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var fs = require('fs');                         //file write
var async = require('async');                   //async for async loop
const {complie} = require('ejs');
var port = 8000;
var app = express();
var con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'12345678',
    database:'imagesharingapp',
    port:3306,
    multipleStatements:true,                    //allow multiple statements
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
    cookie:{maxAge:6000000}                                   //set cookie expire time for 100 mins: 1000*60*100
}))
app.use(flash());
app.set("view_engine","ejs");
app.set("views","view");
app.listen(port);
console.log("App running on http://localhost:"+port);

var previousRoute='/';          //Global variable to check previous route for login route

/*route handling for homepage */
app.route("/")
    .get(function(req,res){
        con.query('SELECT idimages,src, date, likes, username FROM images JOIN users WHERE users.idusers=images.idusers;',function(err, result){
            if(err){
                throw err;
            }
            res.render('index.ejs',{
                sessionUsername: req.session.username,  //this might be undefined but if undefined, the navigation will display login instead of logout.
                images: result                          //render home page with the thumbnails of the image with likes, date, publish user. Label each image with image id
            });
        });    
    });

/*login route */
app.route('/login')
    .get(function(req,res){                             //display login page along with signup
        if(req.headers.referer!='http://localhost:8000/login'&&previousRoute!='/upload'){               //check if previous route is login, if not then update it. Upload need an extra exception
            previousRoute=req.headers.referer;
        }
        res.render('login.ejs',{sessionUsername: req.session.username});                                //render login page.
    })
    .post(function(req,res){
        var sql="SELECT username FROM users WHERE username='"+req.body.loginusername+"' AND password='"+req.body.loginpassword+"';";
        con.query(sql,function(err,result){
            if(err){
                throw err;
            }
            if(result.length>0){                                    //veryfied user. If select return result, it means user with that password exisit in the db
                req.session.username = req.body.loginusername;      //create session data
                res.redirect(previousRoute);                        //redirect to previous route to handle whatever user is doing previously. If nothing then redirect to homepage as default.
            }
            else{
                req.flash("errorLogin","Please enter valid username/password.");        //flash the login error
                res.redirect('/login');                                                 //refresh login page to display flash error
            }
        });
    });

/*logout route */
app.route('/logout')
    .get(function(req,res){
        req.session.destroy();                                  //destory session to revoke login
        res.redirect('/');                                      //send back to homepage
    });

    /*handle signup route */
app.route('/signup')
    .post(function(req,res){
        if(checkAlphaNumeric(req.body.signupusername)){                         //check if username contain special character to prevent sql injection. (ATTACK!)
            con.query("INSERT INTO users(username, password, email) VALUES('"+req.body.signupusername+"','"+req.body.password+"','"+req.body.email+"')",function(err){
                if(err){
                    if(err.errno==1062){                                            //1062 is duplicate key. This means username exist
                        req.flash("errorSignup","Username already exisit.");        
                        res.redirect('/login');
                    }else{
                        throw err;
                    }
                }else{
                    req.flash("successSignup","Signup successfull, please login."); //successfully registered and it will flash the success 
                    res.redirect('/login');                                         //redirect to login for user to login
                }
            });
        } else{
            req.flash("errorUsername","Your username should only contain numbers and letters");     //return error of special character for username.
            res.redirect('/login');
        }
        
    });

/*upload route */
app.route('/upload')
    /*get to render the page */
    .get(function(req,res){                                                         //display login page
        if(req.session.username){                                                   //if logged in
            res.render('upload.ejs',{"sessionUsername":req.session.username});      //render upload page
        } else{
            previousRoute=req.url;                                                  //not login, manully save previousRoute to upload
            res.redirect('/login');                                                 //redirect to login page
        }
    })


    /*post from ajax to handle upload */
    .post(function(req,res){                                                        //handle upload request from ajax.
        var image = req.body;                                                       //get info from ajax
        if(image.data!='[]'){                                                       //check data is not empty
            var imageData = JSON.parse(image.data);                                 //get image data (base64) array
            var imageName = JSON.parse(image.imageName);                            //get image name array
            var time = getTime();                                                   //get current time
            async.forEach(imageData, function(data){
                if(data!=""){                                                                               //check if that image was deleted on client side.
                    var buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/,""),'base64');         //convert the base 64 code to buffer
                    fs.writeFileSync('static/uploads/'+imageName[imageData.indexOf(data)],buffer);          //create local file in upload folder
                    var mysql = "INSERT INTO images(src, date, likes, idusers) VALUES ('"+data+"', '"+time+"', 0, (select idusers from users where username='"+req.session.username+"'));";
                    con.query(mysql,function(err){
                        if(err){
                            throw err;
                        }
                    });
                } else{                                                             //if deleted, do nothing and go to next image.

                }
            });
            req.flash("successUpload", "You have uploaded your image");             //flash success by reloading page
            res.send("You have successfully uploaded your image");
        }else{                                                                      //if empty data
            req.flash("faildUpload","You didn't select any image!");                //flash error
            res.send("error");
        }
    });

/*handle individual image route. Added getImages to avoid loading this while homepage is loaded */
app.route('/getImages/:imageID')                                                    //route for individual image. It was /:imageID but this will cause the homepage to load along with this being execute. That's why it's being changed to this route.
    .get(function(req,res){
        var imageID = req.params['imageID'];                  //get imageID from the url
        var query1 = "SELECT src, date, likes, username, idimages, users.idusers FROM users JOIN images ON users.idusers=images.idusers WHERE images.idimages="+imageID+"; ";
        var query2 = "SELECT comment, username,date FROM comments JOIN users ON users.idusers = comments.idusers WHERE idimages="+imageID+";";
        var query3 = "SELECT likes.idusers FROM likes JOIN users ON likes.idusers=users.idusers WHERE idimages="+imageID+" AND username='"+req.session.username+"';";
        con.query(query1+query2+query3, function(err,result){                   //triple query to get the data
            if(err){
                throw err;
            }
            res.render("imagePage.ejs",{
                sessionUsername : req.session.username,
                data:result                                                     //render the page, it's a 2d json object array which can be accessed via result[i][j].arribute
            })
        })
        
    });

    /*handle like route */
app.route('/like')
    .post(function(req,res){
        var logged = typeof req.session.username==='undefined';             //check if login
        if(logged==false){                                                  //logged in
            var idusers = req.session.username;
            var idimages = req.body.idimages;
            var query1 = "INSERT INTO likes(idusers, idimages) VALUES ((SELECT idusers FROM users WHERE username='"+idusers+"'),"+idimages+"); ";
            var query2 = "UPDATE images SET likes=likes+1 WHERE idimages="+idimages+";";
            con.query(query1+query2,function(err){                          //double query statement that update the like on both table.
                if(err){
                    throw err;
                }
                res.send("success!");                                       //send message to ajax
            });
        } else{
            previousRoute="/getImages/"+idimages+"?"                                                             //not logged in save the previous path because windows.location won't set header
            res.send("failed");                                             //send message to ajax
        }
    });


    /*handle post comment route*/
app.route('/comment')
    .post(function(req,res){
        if(typeof req.session.username!=='undefined'){                      //check if login
            var idimages=req.body.idimages;                                 //get image id
            var comment = req.body.data;                                    //get user comment
            var username=req.session.username;                              //get current login user
            var time = getTime();                                           //get time
            var query = 'INSERT INTO comments(comment, idimages,idusers,date) VALUES ("'+comment+'",'+idimages+',(SELECT idusers FROM users WHERE username="'+username+'"),"'+time+'");'
            con.query(query,function(err){
                if(err){
                    throw err;
                }
                res.send({"username":username,"comment":comment,"date":time});          //send data to update
            });
        }else{              
            previousRoute="/getImages/"+idimages+"?"                         //not login incase of session being destroied, log the previous path
            res.send("failed");                                             //send message to ajax
        }
    });


/*get current server/website time*/
function getTime(){                                                                 
    var year = new Date().getFullYear();
    var month = new Date().getMonth()+1;
    var day = new Date().getDate();
    var hour = new Date().getHours();
    var mins = new Date().getMinutes();
    var second = new Date().getSeconds();
    var time = timeToString(year)+"-"+timeToString(month)+'-'+timeToString(day)+' '+timeToString(hour)+':'+timeToString(mins)+':'+timeToString(second);
    return time;
}

/*convert time to string*/
function timeToString(data){                                                      
    if(data<10){
        data="0"+data.toString();
    } else{
        data=data.toString();
    }
    return data
}

 //check if string contains special character*/
function checkAlphaNumeric(data){                                                  
    for(var i=0; i<data.length;i++){
        var temp = data.charCodeAt(i);
        if (!(temp > 47 && temp < 58) &&                                            // numeric (0-9)
            !(temp > 64 && temp < 91) &&                                            // upper alpha (A-Z)
            !(temp > 96 && temp < 123))                                             // lower alpha (a-z)
        {       
            return false;
        }
    }
    return true
}