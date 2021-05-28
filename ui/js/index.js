const webSocketOutput = document.querySelector('.output');
const inputBox = document.querySelector('.input-box');

inputBox.addEventListener('keyup', function (event) {
  if (event.key === 'Enter') handleEnterPressed(event);
});

let webSocket;
const DEV_URL = 'ws://localhost:3000';
const PROD_URL = 'wss://yuqiis.xyz';
try {
  initWebSocket();
} catch (e) {
  console.log('Web socket init error', e);
}

webSocket.onmessage = function ({ data }) {
  try {
    data = JSON.parse(data);
    const { payload } = data;
    prependResponseHtmlElement(payload);
  } catch (e) {
    console.log('Websocket error', e);
  }
};

function handleEnterPressed(event) {
  const query = event.target.value;
  event.target.value = '';
  sendQuery(query);
}

function sendQuery(query) {
  webSocket.send(JSON.stringify({ type: 'query', payload: query }));
}

function initWebSocket() {
  if (isDevServer()) webSocket = new WebSocket(`ws://localhost:3000`);
  else webSocket = new WebSocket(`wss://test.yuqiis.xyz`);
}

function isDevServer() {
  return ['localhost', '127.0.0.1', ''].includes(location.hostname);
}

function prependResponseHtmlElement(payload) {
  const msg = document.createElement('div');
  msg.innerHTML = payload;
  webSocketOutput.prepend(msg);
}
