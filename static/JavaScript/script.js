

/*load preview */
function imageUpload(e){                                        //preview image but reject the image that exceed 1MB to avoid connection issue
    var imageLength = e.target.files.length;
    for(var i=0; i<imageLength; i++){
        if(e.target.files[i].size<1000000){                     //bool for check file size
            if(x%3==0&&x!=0){
                document.getElementById("preview").appendChild(document.createElement("br"));
                document.getElementById("preview").appendChild(document.createElement("br"));
            }
            setReader(e.target.files[i]);                           //convert images to base64 code and store in array
            imageName[x] = e.target.files[i].name;                  // store corresponding name to array
            var img=document.createElement("IMG");
            var deleteImages = document.createElement("BUTTON");
            deleteImages.className="btn btn-sm bgColor";
            deleteImages.innerHTML="delete image";
            deleteImages.type="button";
            deleteImages.addEventListener('click',function(){
                deleteIMG(this.id);
            });
            deleteImages.id=x;                                              //sync button id with array index
            img.src=URL.createObjectURL(e.target.files[i]);
            img.classList.add("col-2");
            img.classList.add(x);                                               //add class name of current image index for delete
            document.getElementById("preview").appendChild(img);
            document.getElementById("preview").appendChild(deleteImages);
            x++;
        }else{
            var message=document.createElement("p");
            message.innerHTML="The file that exceed 1MB will not be upload.";
            document.getElementById("errorMessage").appendChild(message);
        }
    }
 
}

/*like button clicked */
function like(){
    var idimages = document.getElementsByClassName("image")[0].id;              //use tag's id as the image id which can be used to search databse
    var dataToTransfer = {"idimages":idimages};                                 //set data to transfer to server.
    $.ajax({
        url:"/like",
        type:"POST",
        data: dataToTransfer
    }).done(function(result){                                                   //after server finished, do things. I didn't use success/faild because i want to customize it later.
        if(result=="failed"){
            window.location.href='/login';                                      //not login will redirect to login page.
        }else{
            document.getElementById("likebtn").disabled = true;                 // disable comment button after the user already commented.
            var currentValue=document.getElementById("count").innerHTML;
            document.getElementById("count").innerHTML = parseInt(currentValue,10)+1;       //add add the number of like by 1
        }
    });
}

/*comment posted */
function comment(){                                                                 
    var data=document.getElementById("commentInput");                               //get comment data
    var idimages = document.getElementsByClassName("image")[0].id;                  //get image id
    var dataToTransfer={"data":data.value,"idimages":idimages};                     //create data to be transfer in json type
    $.ajax({
        url:"/comment",
        type:"POST",
        data: dataToTransfer
    }).done(function(result){
        if(result=="failed"){                                                       //if not login then user will be redirect to login
            window.location.href='/login';
        }else{                                                                      //post the new comment to the comment area
            var commentBox=document.createElement("div");              
            commentBox.className="d-flex justify-content-center py-2";
            var commentBox2 = document.createElement("div");
            commentBox2.className="second py-2 px-2";
            var comment = document.createElement("span");
            comment.className="text1";
            comment.innerHTML=result.comment;
            var commentUserAndDate = document.createElement("div");            
            commentUserAndDate.className="d-flex justify-content-between py-1 pt-2";
            var userDiv = document.createElement("div");
            var user = document.createElement("span")
            user.className="text2";
            user.innerHTML=result.username;
            var dateDiv = document.createElement("div");
            var date = document.createElement("span");
            date.className="text3";
            date.innerHTML=result.date;
            dateDiv.appendChild(date);
            userDiv.appendChild(user);
            commentUserAndDate.appendChild(userDiv);
            commentUserAndDate.appendChild(dateDiv);
            commentBox2.appendChild(comment);
            commentBox2.appendChild(commentUserAndDate);
            commentBox.appendChild(commentBox2);
            var area = document.getElementById("commentArea");
            if(document.getElementById("nocomment")!=null){             //check if there's a nocomment string.
                area.innerHTML="";
            }
            area.appendChild(commentBox);
        }
    });
}

/*submit button clicked from upload */
function send(){                            
    var data ={"data": JSON.stringify(dataTrans),"imageName":JSON.stringify(imageName)};       //use stringfy to compress all data into a single json object fo transfer
    $.ajax({
        url:"/upload",
        type: "POST",
        data: data
    }).done(function(){
            window.location.reload();                            //reload the page to display the result using flash module.
    });
}

/*read image to dataurl */
function setReader(file){                                           
    const reader = new FileReader();
    reader.onload=function(){
        dataTrans[j]=reader.result;
        j++;
    }
    reader.readAsDataURL(file);
}

/*delete unwanted image */
function deleteIMG(btnID){                                          
    var image = document.getElementsByClassName(btnID)[0];
    var button = document.getElementById(btnID);
    image.remove();
    button.remove();
    imageName[btnID]="";
    dataTrans[btnID]="";

}

/*global variable */
var imageName = [];                 //user uploaded image name array
var data=[];                        //user uploaded image data array
var dataTrans=[];                   //user uploaded image data in url form array
var j=0;                            //index for the data arrays above
var x=0;                            //index for other array