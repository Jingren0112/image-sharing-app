/*load preview */
function imageUpload(e){
    var imageLength = e.target.files.length;
    for(var i=0; i<imageLength; i++){
        if(i%4==0&&i!=0){
            document.getElementById("preview").appendChild(document.createElement("br"));
            document.getElementById("preview").appendChild(document.createElement("br"));
        }
        setReader(e.target.files[i]);
        var img=document.createElement("IMG");
        img.src=URL.createObjectURL(e.target.files[i]);
        img.classList.add("col-3");
        document.getElementById("preview").appendChild(img);
    }
}

function onload(){
    $.ajax({
        url:"/getImages",
        type:"POST",
        data: null
    }).done(function(result){
        for(var i=0; i<result.length;i++){

        }
    });
}

function send(){
    $.ajax({
        url:"/upload",
        type: "POST",
        data: {"data":JSON.stringify(dataTrans)}
    }).done(function(result){
        result=JSON.parse(result);
        for(var i=0; i<result.length;i++){
            var img=document.createElement("IMG");
            img.src=result[i];
            img.classList.add("col-3");
            document.getElementById("preview").appendChild(img);
        }
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


    

var commentButton = document.createElement("a");
var data=[];
var dataTrans=[];
var j=0;