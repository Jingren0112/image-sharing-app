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
        img.src=URL.createObjectURL(e.target.files[i]);
        img.classList.add("col-3");
        document.getElementById("preview").appendChild(img);
    }
 
}

function loadImages(){
    $.ajax({
        url:"/getImages",
        type:"POST",
        data: null
    }).done(function(result){
        if(result!=null){
            for(var i=0; i<result.length; i++){
                if(i%4==0&&i!=0){
                    document.getElementById("imageset").appendChild(document.createElement("br"));
                    document.getElementById("imageset").appendChild(document.createElement("br"));
                }
                var username = result[i].username;
                var imageBlock = document.createElement("DIV");
                imageBlock.classList.add("col-3");
                var img=document.createElement("IMG");
                var date = document.createElement("a");
                var username = document.createElement("a");
                img.src=result[i].src;
                date.innerHTML= result[i].date;
                username.innerHTML=result[i].username;
                imageBlock.appendChild(username);
                imageBlock.appendChild(date);
                imageBlock.appendChild(img);
                document.getElementById("imageset").appendChild(imageBlock);
            }
        }
    });
}

function send(){
    console.log(dataTrans);
    var data ={"data": JSON.stringify(dataTrans),"imageName":JSON.stringify(imageName)};
    $.ajax({
        url:"/upload",
        type: "POST",
        data: data
    }).done(function(result){
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


var imageName = [];
var data=[];
var dataTrans=[];
var j=0;