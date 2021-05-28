const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;
app.use('/js', express.static(path.join(__dirname, 'ui/js/')));
app.use('/css', express.static(path.join(__dirname, 'ui/css/')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/ui/html/index.html'));
});
const server = app.listen(port, () =>
  console.log(`App listening on port ${port}!`)
);

const webSocketServer = new WebSocket.Server({ server });

let clientCounter = 0;
let pingInterval = setInterval(() => {
  webSocketServer.pingEverySocket();
}, 1 * 5000);

webSocketServer.on('connection', handleConnection);

function handleConnection(webSocket) {
  console.log('client connections: ', ++clientCounter);
  if (webSocket.readyState === webSocket.OPEN) {
    sendConnectionMessage('Welcome!');
  }

  webSocket.on('message', handleIncomingMessage);
  webSocket.on('close', handleConnectionClose);
  webSocket.on('error', handleError);

  function handleIncomingMessage(message) {
    try {
      const { payload, type } = JSON.parse(message);
      if (type === 'query') {
        handleQuery(payload, sendQueryResponse);
        return;
      } else console.log(message);
    } catch (e) {
      console.error('Error from message: ', e);
    }
  }

  function sendConnectionMessage(message) {
    webSocket.send(JSON.stringify({ type: 'connected', payload: message }));
  }

  function sendQueryResponse(response) {
    webSocket.send(
      JSON.stringify({ type: 'queryResponse', payload: response })
    );
  }

  function handleConnectionClose() {
    --clientCounter;
    if (clientCounter === 0) {
      clearInterval(pingInterval);
    }
    console.log('disconnected');
  }

  function handleError(err) {
    --clientCounter;
    console.log('error:', err);
  }
}

function handleQuery(query, handleResult) {
  handleResult(query.toUpperCase() + '?');
}

webSocketServer.pingEverySocket = function pingEverySocket() {
  webSocketServer.clients.forEach(function ping(socket) {
    socket.send('ping');
  });
};
