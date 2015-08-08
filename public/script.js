var IMAGE_SEND_INTERVAL = 100;
var SCALE_FACTOR = 0.1;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (!HTMLCanvasElement.prototype.toBlob) { // polyfill from mdn
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        value: function(callback, type, quality) {

            var binStr = atob(this.toDataURL(type, quality).split(",")[1]),
            len = binStr.length,
            arr = new Uint8Array(len);

            for (var i=0; i<len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
            }

            var blob = new Blob([arr], {
                type: type || "image/png"
            });

            callback(blob);
        }
    });
}

var socket = io();

var typeSelect = document.querySelector("#type-select");
var connectButton = document.querySelector("#connect-button");
var videoElem = document.querySelector("#video");
var imgElem = document.querySelector("#img")

connectButton.onclick = function(e) {
    var type = typeSelect.value;

    socket.emit("choose_type", {
        type: type
    });

    if (type === "camera") {
        MediaStreamTrack.getSources(function(r){
            var videoSrcs = r.filter(function(v){
                return v.kind === "video"
            });

            var chosenSrc = videoSrcs[videoSrcs.length - 1];
            var chosenSrcId = chosenSrc.id;

            navigator.getUserMedia({
                video: {
                    optional: [{
                        sourceId: chosenSrcId
                    }]
                }
            }, function(stream) {
                var url = window.URL.createObjectURL(stream);
                console.log(url);

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");

                videoElem.addEventListener("loadedmetadata", function(e) {
                    canvas.width = video.offsetWidth * SCALE_FACTOR;
                    canvas.height = video.offsetHeight * SCALE_FACTOR;

                    setInterval(function() {
                        ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
                        // canvas.toBlob(function(blob) {
                        //     socket.emit("image", {
                        //         image: blob
                        //     });
                        // });
                        socket.emit("image", {
                            image: canvas.toDataURL()
                        });
                    }, IMAGE_SEND_INTERVAL);
                });

                videoElem.src = url;
            }, function(err) {
                console.log("getUserMedia error", err);
            });
        });
    } else if (type === "viewer") {
        socket.on("image", function(data) {
            // console.log(data.image);
            //
            // var blob = new Blob([data.image]);
            //
            // console.log(blob);

            // var url = window.URL.createObjectURL(blob);
            var url = data.image;
            imgElem.src = url;
        });
    }

    this.parentElement.style.display = "none";
    this.onclick = null;
};
