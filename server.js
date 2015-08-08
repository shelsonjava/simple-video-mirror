var path = require("path");
var express = require("express");
var app = express();
var socket_io = require("socket.io");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

var server = app.listen(3000, function() {
    console.log("simple-video-mirror started");

    var io = socket_io(server);

    var cameraSocket = null;
    var viewerSocket = null;

    io.on("connection", function(socket) {
        console.log("new connection");

        socket.on("choose_type", function(data) {
            if (data.type === "camera") {
                cameraSocket = socket;

                socket.on("image", function(data) {
                    console.log(data.image);
                    if (data.image && viewerSocket) {
                        viewerSocket.emit("image", {
                            image: data.image
                        });
                    }
                });

                socket.on("disconnect", function(socket) {
                    cameraSocket = null;
                });
            } else if (data.type === "viewer") {
                viewerSocket = socket;

                socket.on("disconnect", function(socket) {
                    viewerSocket = null;
                });
            }

            console.log("chose type '" + data.type + "'");
        });

        socket.on("disconnect", function(socket) {
            console.log("disconnect");
        });
    });
});
