/*load preview */
function imageUpload(e){
    var imageLength = e.target.files.length;
    for(var i=0; i<imageLength; i++){
        if(i%4==0&&i!=0){
            document.getElementById("preview").appendChild(document.createElement("br"));
            document.getElementById("preview").appendChild(document.createElement("br"));
        }
        setReader(e.target.files[i]);
        imageName[i] = e.target.files[i].name;
        var img=document.createElement("IMG");
        var deleteImages = document.createElement("BUTTON");
        deleteImages.classList.add("btn");
        deleteImages.classList.add("btn-sm");
        deleteImages.classList.add("bgColor");
        img.src=URL.createObjectURL(e.target.files[i]);
        img.classList.add("col-3");
        document.getElementById("preview").appendChild(img);
    }
 
}

function like(){
    var idimages = document.getElementsByClassName("image")[0].id;
    var dataToTransfer = {"idimages":idimages};
    $.ajax({
        url:"/like",
        type:"POST",
        data: dataToTransfer
    }).done(function(result){
        if(result=="failed"){
            window.location.href='/login';
        }else{
            document.getElementById("likebtn").disabled = true;
            var currentValue=document.getElementById("count").innerHTML;
            console.log(currentValue);
            document.getElementById("count").innerHTML = parseInt(currentValue,10)+1;
        }
    });
}

function comment(){
    var data=document.getElementById("commentInput");
    var idimages = document.getElementsByClassName("image")[0].id;
    var dataToTransfer={"data":data.value,"idimages":idimages};
    $.ajax({
        url:"/comment",
        type:"POST",
        data: dataToTransfer
    }).done(function(result){
        if(result=="failed"){
            window.location.href='/login';
        }else{
            var comment=document.createElement("div");
            comment.classList.add("row");
            comment.classList.add("justify-content-center");
            var commentData=document.createElement("p");
            commentData.innerHTML="Comment: "+result.comment;
            comment.appendChild(commentData);
            var commentUser=document.createElement("div");
            commentUser.classList.add("row");
            commentUser.classList.add("justify-content-center");
            var commentUsername=document.createElement("p");
            commentUsername.innerHTML="From "+result.username;
            commentUser.appendChild(commentUsername);
            var area = document.getElementById("commentArea");
            if(document.getElementById("nocomment")!=null){
                area.innerHTML="";
            }
            area.appendChild(comment);
            area.appendChild(commentUser);
        }
    });
}


function send(){
    var data ={"data": JSON.stringify(dataTrans),"imageName":JSON.stringify(imageName)};
    $.ajax({
        url:"/upload",
        type: "POST",
        data: data
    }).done(function(){
            window.location.reload();
    });
}


function setReader(file){
    const reader = new FileReader();
    reader.onload=function(){
        dataTrans[j]=reader.result;
        j++;
    }
    reader.readAsDataURL(file);
}


function deleteImages(e){

}

var imageName = [];
var data=[];
var dataTrans=[];
var j=0;