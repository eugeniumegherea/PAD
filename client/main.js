var socket = io('localhost:3000');

Promise.resolve()
.then(() => getName())
.then((name) => {

  if (!name) return Promise.reject();

  return request('init', {
    id: getId(),
    name: name
  })
  .then(() => request('archive'))
  .then((data) => {
    console.log('archive', data);
  })
  .then(() => Promise.all([
    request('getParticipants'),
    request('getRooms')
  ]))
}).then((arr) => {
  const participants = arr[0];
  const rooms = arr[1];
  console.log('Successfuly connected');
  console.log('[Participants]', participants);
  console.log('[Rooms]', rooms);
  updateView(participants);

  socket.on('update', (obj) => {
    obj = toJSON(obj);
    if (obj.participants) {
      console.log('[Participants updated]', obj.participants);

      participants = obj.participants;
      updateView(participants);
    }
  });

  socket.on('inviteRoom', (json) => {
    json = toJSON(json);
    console.log('[inviteRoom]', json);
  });

  socket.on('message', (data) => {
    var msg = toJSON(data);
    console.log('[PRIVATE CHAT]', msg);
  });

  socket.on('roommessage', (data) => {
    var msg = toJSON(data);
    console.log('[GROUP CHAT]', msg);
  });

}).catch((err) => {
  console.warn(err);
  
  alert('Aborting connection');
});

document.getElementById('createroom').addEventListener('click', () => {
  const roomName = document.getElementById('roomname').value;
  socket.emit('createroom', toBinary({
    name: roomName,
    participants: ['1', '2', '3', '4']
  }));
});


const request = (type, data) => {
  return new Promise((resolve) => {
    socket.once(type + ':res', (data) => {
      if (!data) return resolve();
      resolve(toJSON(data));
    });
    socket.emit(type, toBinary(data));
  });
}

const send = (type, data) => {
  socket.emit(type, toBinary(data));
}


const updateView = (participants) => {
  var content = document.getElementById('content');
  content.innerHTML = '';
  for (let i = 0; i < participants.length; i++) {
    var div = document.createElement('div');
    div.innerHTML = '<div>' + participants[i].name + '</div>' +
      '<input type="text">';
    div.querySelector('input').addEventListener('keyup', (ev) => {
      if (ev.keyCode !== 13) {
        return;
      }
      send('message', {
        from: getId(),
        to: participants[i].id,
        body: ev.target.value
      });
      ev.target.value = '';
    });
    content.appendChild(div);
  }
}

const getId = () => {
  var id = localStorage.getItem('id');
  if (!id) {
    id = Math.floor(Math.random() * 1000000) + '';
    localStorage.setItem('id', id);
  }
  return id;
};

const getName = () => {
  const input = document.querySelector('input');
  return new Promise((resolve, reject) => {
    input.addEventListener('keyup', (ev) => {
      if (ev.keyCode === 13) {
        resolve(input.value);
        input.parentElement.parentElement.removeChild(input.parentElement);
      }
    });
  });
}

function toBinary (data) {
  data = JSON.stringify(data);
  var string = btoa(unescape(encodeURIComponent(data))),
    charList = string.split(''),
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