var canvas;
var context;
// Shorthand for $( document ).ready()
$(function () {
    canvas = document.createElement('canvas'); //Create a canvas element
    //Set canvas width/height
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    //Set canvas drawing area width/height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //Position canvas
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.zIndex = 100000;
    canvas.style.pointerEvents = 'none'; //Make sure you can click 'through' the canvas
    document.body.appendChild(canvas); //Append canvas to body element
    context = canvas.getContext('2d');
});

function take_snapshot() {
    Webcam.snap(function (data_uri) {
        document.getElementById('results').innerHTML = '<img id="base64image" src="' + data_uri + '"/><button onclick="SaveSnap();">Analyze</button>';
        updateCanvas();
    });
}

function updateCanvas() {
    canvas.style.left = $('#base64image').position().left + "px";
    canvas.style.top = $('#base64image').position().top + "px";
    canvas.width = $('#base64image').width();
    canvas.height = $('#base64image').height();
    canvas.style.width = $('#base64image').width() + "px";
    canvas.style.height = $('#base64image').height() + "px";
}

function ShowCam() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 100
    });
    Webcam.attach('#my_camera');
}
function SaveSnap() {
    var file = document.getElementById("base64image").src.substring(23).replace(' ', '+');
    var img = Base64Binary.decodeArrayBuffer(file);
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", function (event) { uploadcomplete(event); }, false);
    ajax.open("POST", "https://api.projectoxford.ai/emotion/v1.0/recognize", "image/jpg");
    ajax.setRequestHeader("Content-Type", "application/octet-stream");
    //ajax.setRequestHeader("Accept-Encoding","gzip, deflate");
    // ajax.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml");
    ajax.setRequestHeader("Ocp-Apim-Subscription-Key", "15a177756b344c26b7796e2bede721ba");
    ajax.send(img);
}

function uploadcomplete(event) {
    updateCanvas();
    var faces = JSON.parse(event.target.response);
    var resultString = "<ol>";
    for (var face of faces) {
        var x = face.faceRectangle.left;
        var y = face.faceRectangle.top;
        var width = face.faceRectangle.width;
        var height = face.faceRectangle.height;
        var sortable = [];
        for (var emotion in face.scores) {
            sortable.push([emotion, Number(face.scores[emotion])]);
        }
        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });

        sortable.forEach(function(a) {
            resultString += "<li>" + a[0] + " : " + Number(a[1] * 100).toFixed(2) + "%";
        });
        context.rect(x, y, width, height);
        context.stroke();
        context.font = "15px sans-serif";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(sortable[0][0], x + (width * 0.5), y + height + 15);
    }
    resultString += "</ol>";
    $("#Saved").html(resultString);
}
window.onload = ShowCam;