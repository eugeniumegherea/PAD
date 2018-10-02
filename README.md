# Server API

## Prerequisites
- All clients should use socket.io for simplicity
- All requests should be sent in binary format
- ALl requests from server are in binary format
- Client should store unique id (localstorage for example)

## 0. Run server locally
`node dist/main.js`

## 1. Connect to the server
By default socket server runs on port 3000. If you run your server locally, you should initialize socket on client as:

`var client = io('localhost:3000');`

## 2. Request-response mechanism

A request-response mechanism using WebSockets is a mechanism where you send a piece of information to the server and listen for repsonse. When you send a request to the server, server responds with the same event name and appending `':res'` string to it. 

For instance:
```javascript
    client.on('init:res', function (data) {
        // here data contains response from server
    });
    client.emit('init', ConvertToBinary({
        id: 'mega-random-id',
        name: 'your name appearing in chat'
    }));
```
Note: not all requests will return a value in response, see later on

## 3. Events

### Client --> Server events:
|Event name|Data|Response value|
|----------|:---|--------------|
|`init`|An object with:<br> `name {string}` - username to appear in chat<br> `id {string}` - unique random id. | `null`
|`getParticipants`|`null`|An array of participants (including you). Each participant is an object with `id` and `name` fields.
|`message`|An object containing:<br>`to {string}` - to whom the message goes<br>`from {string}` - your unique id. If you provide another id, other user will never know from whom the message was<br>`body {string}` - the text message itself|`null`
|`roommessage`| same as `message` event | null
|`createroom`|`{ name: {string} - room name, participants: {string[]} - an array of participants id }`|null
|`getRooms`|null|An array of Rooms in which you are a member of. Each element is an object containing `id` {string}: room id, `name` {string} - room name, |`participants`: {string[]} - an array of participants id's which are members of this group

### Server --> Client events:
|Event name|Data|
|----------|----|
|`update`|An object which may contain fields which were updated. For now, update is only for notifiing about participant list change.<br>It will contain `participants` field, which is an array of participants (Exactly the same as in `getParticipants` event)|
|`message`|An object containing `from` and `body` fields.|
|`inviteRoom`|An object containing `id` {string}: room id, `name` {string} - room name, |`participants`: {string[]} - an array of participants id's which are members of this group|

#### General flow
1. When page loads, client will ask user to input his/her name.
2. App should generate/get id and send `init` request to the server.
3. Client should ask for participants list by sending `getParticipants` event and waiting for server to respond with an array of participants. Do not forget to filter yourself from that array. 
4. After client got the array, he/she should render in in page, using provided `name` field.
5. At this point client should add event listener for `update` and `message` event comming from the server.

## 4. Binary <-/-> JSON

Use this code to serialize/deserialize messages. You should call `toBinary` before sending anything. You should call `toJSON` to parse the binary message.
NOTE: There is no error handling whatsoever, be careful

```javascript
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
```

example:

```javascript
    socket.emit('message', toBinary({
        to: 'id',
        from: 'another id',
        body: 'hello world'
    }));

    socket.on('message', (data) => {
        var msg = toJSON(data);
        // here msg is an json object
    });
```