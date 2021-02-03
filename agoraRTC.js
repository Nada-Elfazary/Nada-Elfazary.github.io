
function handleFail(error) {
    console.log(error);
}

let appId = "20fc27f50162422ba71af828a10f105c";
let remoteId = document.getElementById("nameTag");

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

let globalStream;
let audioMuted = false;
let videoMuted = false;

client.init(appId,() => console.log("AgoraRTC Client Connected"),handleFail
)

function removeMyVideoStream(StreamId) {
    globalStream.stop();
    remoteId.textContent = "";
}

function removeVideoStream(evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    remoteId.textContent = "";
    
}

function addVideoStream(streamId){
    console.log()
    let remoteTab = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.style.transform = "rotateY(180deg)";
    streamDiv.style.height = "50vh";
    streamDiv.style.width = "50vw";
    streamDiv.className = "styledBorder";
    remoteTab.appendChild(streamDiv)
    remoteId.textContent += streamId + " has joined the channel";
} 

document.getElementById("leaveButton").onclick = function() {
    client.leave(function() {
        console.log("Successfully left chat!")
    }, handleFail); 
    removeMyVideoStream();
}
document.getElementById("joinButton").onclick = function () {
    let username = document.getElementById("userName").value;
    let channelName = document.getElementById("channelName").value;   
    
    client.join(
        null,
        channelName,
        username,
        () =>{
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function(){
                localStream.play("localStream")
                console.log(`App id: ${appId}\nChannel id: ${channelName}`)
                client.publish(localStream)
            })

            globalStream = localStream; 
        }
    )
    client.on("stream-added", function (event){
        console.log("Stream is Added");
        client.subscribe(event.stream,handleFail)
    })

    client.on("stream-subscribed", function(event){
        console.log("Stream is subscribed");
        let stream = event.stream;
        addVideoStream(stream.getId());
        stream.play(stream.getId());
    })

    client.on("peer-leave", function (evt) {
        console.log("Peer has left the chat")
        removeVideoStream(evt)
    })
}
document.getElementById("videoMute").onclick = function() {
    if(!videoMuted){
        globalStream.muteVideo();
        videoMuted = true;
    }else{
        globalStream.unmuteVideo();
        videoMuted=false;
    }
}

document.getElementById("audioMute").onclick = function() {
    if(!audioMuted){
        globalStream.muteAudio();
        audioMuted = true;
    }else{
        globalStream.unmuteAudio();
        audioMuted=false;
    }
}

document.getElementById("pianoDisplay").onclick = function() {
    let piano = document.getElementById("piano");
    if(piano.style.display === "none") {
        piano.style.display = "flex";
    }
    else {
        piano.style.display = "none";
    }
}

for (let i = 1; i < 25; i++) {
    document.getElementById("note" + i).onclick = function () {
        document.getElementById("pitch"+i).play();
    }
}