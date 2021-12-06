

const socket = io('/');
let myVideoStream;
const videoGrid = document.getElementById("video-grid");
// console.log(videoGrid);
const myVideo = document.createElement("video");
myVideo.muted = true; 

const peer = new Peer(undefined, {
    host:"/",
    port:"3000",
    path:"/peerjs"
    })
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


//this code will take permission to give access to video and audio from cleint/browser
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
.then((stream) => {
    //promise are the events that might occur or rejected in near future
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        console.log("call function running ");
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                //console.log('connectToNewUser','on','stream')
                addVideoStream(video, userVideoStream)
              });      
            
          })
    //When peer connects to the server it sends the "join-room" event, which emits the "user-connected" event and 
    //then the host tries to call the new user in connectToNewUser before the user even has their stream available.  


    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000)
    })
});

socket.on('user-disconnected',userId=>{
    handlePeerDisconnect();
})

peer.on('open',id=>{
    console.log(id);
    socket.emit('join-room',ROOM_ID,id);
})

// socket.on('user-connected',(userId)=>{   
//     connectToNewUser(userId,stream);
// });
function handlePeerDisconnect() {
    // manually close the peer connections
    for (let conns in peer.connections) {
      peer.connections[conns].forEach((conn, index, array) => {
        console.log(`closing ${conn.connectionId} peerConnection (${index + 1}/${array.length})`, conn.peerConnection);
        conn.peerConnection.close();
  
        // close it using peerjs methods
        if (conn.close)
          conn.close();
      });
    }
  }
function connectToNewUser(userId,stream){
    console.log("cnuser");
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        //console.log('connectToNewUser','on','stream')
        addVideoStream(video, userVideoStream)
      });  
    call.on('close', () => {
    video.remove();
    
    })
}

const addVideoStream = (video, stream)=>{
    //just assignming the stream from chrome to our <video> element that we created;
    video.srcObject = stream;
    //on loadedmetadata event occur and it plays video stream 
    video.addEventListener("loadedmetadata", () => {
       video.play();
       //we are appending oour video stream to our division in html having id ==  video-grid
       videoGrid.append(video);
    });
};


let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

function scrollToBottom () {
    var div = document.querySelector(".main__chat_window");
    div.scrollTop = div.scrollHeight - div.clientHeight;
 }

socket.on("createMessage", (msg,userId) => {
    messages.innerHTML =
      messages.innerHTML +
      `<div class="message">
            <b><i class="far fa-user-circle"></i> <span>${userId}</span> </b>
            <span>${msg}</span>
      </div>`;
      scrollToBottom();
  });

send.addEventListener('click',(e)=>{
    if(text.value.length !=0)
    {
        socket.emit('message',text.value);
        text.value = '';
    }
});

text.addEventListener('keydown',(e)=>{
    if(e.key=="Enter"&&text.value.length!=0)
    {
        socket.emit('message',text.value);
        text.value = '';
    }
})

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");


inviteButton.addEventListener("click",(e)=>{
            // Fallback, Tries to use API only
            // if navigator.share function is
            // available
            if (navigator.share) {
                navigator.share({
  
                    // Title that occurs over
                    // web share dialog
                    title: 'Join Streamify using below url !!',
  
                    // URL to share
                    url: 'www.google.com'
                }).then(() => {
                    console.log('Thanks for sharing!');
                }).catch(err => {
  
                    // Handle errors, if occured
                    console.log(
                    "Error while using Web share API:");
                    console.log(err);
                });
            } else {
  
                // Alerts user if API not available 
                alert("Browser doesn't support this API !");
            }
        
})

muteButton.addEventListener("click", () => {
  
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  //console.log(enabled);
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    //console.log(enabled);
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      html = `<i class="fas fa-video-slash"></i>`;
      stopVideo.classList.toggle("background__red");
      stopVideo.innerHTML = html;
    } else {
      myVideoStream.getVideoTracks()[0].enabled = true;
      html = `<i class="fas fa-video"></i>`;
      stopVideo.classList.toggle("background__red");
      stopVideo.innerHTML = html;
    }
  });




  

