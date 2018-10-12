function toBinary(data) {
  data = JSON.stringify(data);
  var string = btoa(unescape(encodeURIComponent(data))),
    charList = string.split(""),
    uintArray = [];
  for (var i = 0; i < charList.length; i++) {
    uintArray.push(charList[i].charCodeAt(0));
  }
  return new Uint8Array(uintArray);
}

function toJSON(uintArray) {
  uintArray = new Uint8Array(uintArray);
  var encodedString = String.fromCharCode.apply(null, uintArray);
  return JSON.parse(encodedString);
}

var message = {};

function sendMessage() {
  /*    for (i = 0; i < el.length; i++) {
            if (el[i].checked) {
              socket.emit('message', toBinary({
                to: el[i].id,
                from: user,
                body: bodymessege.value
              }));
            }
          }  */

  if (chatRoom != 0) {
    socket.emit(
      "roommessage",
      toBinary({
        to: chatRoom,
        from: user_id,
        body: bodymessege.value
      })
    );

    bodymessege.value = null;
  }
}
var chatRoom = 0;
var btn = document.getElementById("btn");
var el = document.getElementsByName("userschek");
var bodymessege = document.getElementById("message");
var areamessage = document.getElementById("areamessage");
var listonline = document.getElementById("users");
var btnCreate = document.getElementById("btnCreate");
var chatGroup = document.getElementById("chats");
var nameGroupChat = document.getElementById("GroupChatName");

//  var socket = io('localhost:3000');
var socket = io("10.35.1.172:3000");

user = prompt("Introdu numele");

var user_id = localStorage.getItem("id");
if (!user_id) {
  user_id = Math.floor(Math.random() * 1000);
  localStorage.setItem("id", user_id);
}

socket.emit(
  "init",
  toBinary({
    id: user_id,
    name: user
  })
);

//console.log("mu id: " + user_id);
var arrPart = {};
socket.on("init:res", function() {
  socket.emit("getParticipants");
  socket.on("getParticipants:res", function(data) {
    listonline.innerHTML = "";

    var participant = toJSON(data);

    for (i = 0; i < participant.length; i++) {
      arrPart[participant[i].id] = participant[i].name;
      var li = document.createElement("li");
      if (participant[i].id != user_id) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = participant[i].id;
        checkbox.value = participant[i].name;
        checkbox.className = "form-check-input";
        checkbox.name = "userschek";
        li.appendChild(checkbox);
      }
      li.appendChild(document.createTextNode(participant[i].name));
      li.setAttribute("class", "list-group-item");
      var circl = document.createElement("span");
      if (participant[i].online) {
        circl.className = "dot_green";
      } else circl.className = "dot_red";
      li.appendChild(circl);
      listonline.appendChild(li);
    }
  });
  socket.emit("archive");
  socket.on("archive:res", function(data) {
    var ar = toJSON(data);
    for (i = 0; i < ar.length; i++) {
      areamessage.value += ar[i].from + ": " + ar[i].body + "\n";
    }
  });
});

bodymessege.addEventListener("keyup", function(ev) {
  if (ev.keyCode == 13) {
    sendMessage();
  }
});

btn.onclick = function() {
  sendMessage();
};

socket.on("roommessage", function(data) {
  var msg = toJSON(data);
  // var chat_id = localStorage.getItem('chat_id');
  //console.log('store: ', chat_id);
  //   console.log('name: ', arrPart[msg.from]);

  if (msg.to === chatRoom) {
    areamessage.value = areamessage.value || "";
    areamessage.value += arrPart[msg.from] + ": " + msg.body + "\n";
  } else {
    message[msg.to] = message[msg.to] || "";
    message[msg.to] += arrPart[msg.from] + ": " + msg.body + "\n";
  }
});

socket.on("update", function(data) {
  while (listonline.hasChildNodes()) {
    listonline.removeChild(listonline.firstChild);
  }
  socket.emit("getParticipants");
  socket.emit("getRooms");
});

var chatname = document.getElementById("namechat");

btnCreate.onclick = function() {
  var partMasiv = [];
  var nr = 0;

  for (i = 0; i < el.length; i++) {
    if (el[i].checked) {
      partMasiv[nr++] = el[i].id;
    }
  }
  console.log("name: " + chatname.value);
  for (i = 0; i < partMasiv.length; i++) {
    console.log("id: " + partMasiv[i]);
  }

  socket.emit(
    "createroom",
    toBinary({
      name: chatname.value,
      participants: partMasiv
    })
  );

  chatname.value = "";
  socket.emit("getRooms");
};

// socket.emit('getRooms');
socket.on("getRooms:res", function(data) {
  chatGroup.innerHTML = "";

  var rooms = toJSON(data);
  for (i = 0; i < rooms.length; i++) {
    var li = document.createElement("li");

    var spanDisplay = document.createElement("span");

    spanDisplay.className = "mySpan glyphicon glyphicon-plus";

    li.appendChild(spanDisplay);

    var button = document.createElement("input");
    button.type = "button";
    button.value = "Open";
    button.name = rooms[i].name;
    button.id = rooms[i].id;
    button.className = "myButton btn tn-secondary btn-sm";
    li.appendChild(button);

    li.appendChild(document.createTextNode(" " + rooms[i].name));
    li.setAttribute("class", "groupName list-group-item");

    var spanUser = document.createElement("span");
    spanUser.className = "badge badge-primary badge-pill";
    spanUser.appendChild(document.createTextNode(rooms[i].participants.length));

    li.appendChild(spanUser);
    for (j = 0; j < rooms[i].participants.length; j++) {
      var li1 = document.createElement("li");
      li1.appendChild(document.createTextNode(rooms[i].participants[j].name));
      li1.setAttribute("class", "list-group-item");
      li1.id = rooms[i].id;
      li1.style.display = "none";
      li.appendChild(li1);
      chatGroup.appendChild(li);
    }
  }
});

var spanClick = document.getElementById("chats");
var checkview = true;
spanClick.addEventListener("click", function(event) {
  if (!event.target.classList.contains("mySpan")) return;
  else {
    if (checkview == true) {
      event.target.className = "mySpan glyphicon glyphicon-minus";
      var need = event.target.parentNode.getElementsByTagName("li");
      for (var j = 0; j < need.length; j++) need[j].style.display = "block";
      checkview = false;
    } else {
      event.target.className = "mySpan glyphicon glyphicon-plus";
      var need = event.target.parentNode.getElementsByTagName("li");
      for (var j = 0; j < need.length; j++) need[j].style.display = "none";
      checkview = true;
    }
  }
});

spanClick.addEventListener("click", function(event) {
  if (!event.target.classList.contains("myButton")) return;
  areamessage.value = "";
  nameGroupChat.innerHTML = "Chat: " + event.target.name;

  chatRoom = event.target.id;
  areamessage.value = message[chatRoom] || "";
  console.log("id: ", +chatRoom);

  localStorage.setItem("chat_id", chatRoom);
});
