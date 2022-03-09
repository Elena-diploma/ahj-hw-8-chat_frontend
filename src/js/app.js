import Widget from "./widget";

const widget = new Widget(document.querySelector('.chat-container'), 'wss://ahj-hw-sse-chat-backend.herokuapp.com/ws');
widget.init();
