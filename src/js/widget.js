import Login from './Login';

export default class Widget {
  constructor(parentEl, url) {
    this.url = url;
    this.parentEl = parentEl;
    this.login = new Login(this.parentEl, this.url);
    this.messagesContainer = document.querySelector('.messages');
    this.msgForm = document.querySelector('.msg-form');
    this.userListEl = document.querySelector('.user-list');
    this.text = document.querySelector('.chat-text');
    this.chatWidget = this.chatWidget.bind(this);
    this.send = this.send.bind(this);
  }

  init() {
    this.login.init();
    this.parentEl.addEventListener('connect', this.chatWidget);
  }

  chatWidget() {
    this.nickname = this.login.nameInput.value;
    console.log(this.nickname);
    this.users = this.login.userList;
    this.getUserList();
    console.log(this.login.userList);
    this.login.ws.addEventListener('message', (event) => {
      const request = JSON.parse(event.data);
      if (request.event === 'chat') {
        let userMessage;
        console.log(this.nickname);
        console.log(request.message.name);
        if (this.nickname === request.message.name) {
          request.message.name = 'You';
          //userMessage.classList.add('you');
        }
        userMessage = this.getMessage(request.message.name, request.message.created, request.message.text);
        this.messagesContainer.append(userMessage);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight - this.messagesContainer.getBoundingClientRect().height;
      }
      if (request.event === 'system') {
        this.logout(request);
      }
    });
    this.msgForm.addEventListener('submit', this.send);
  }

  getUserList() {
    this.userListEl.classList.remove('hidden');
    this.userListEl.innerHTML = '';
    this.users.forEach((item) => {
      const userEl = document.createElement('div');
      userEl.className = 'user';
      userEl.innerText = item;
      this.userListEl.append(userEl);
    });
    const youEl = document.createElement('div');
    youEl.className = 'user';
    youEl.classList.add('you');
    youEl.innerText = 'You';
    this.userListEl.append(youEl);
  }

  getMessage(name, created, text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    if (name === 'You') {
      messageEl.classList.add('you');
    }
    const date = new Date(created).toLocaleString('ru');
    messageEl.innerHTML = `
       <div class="message-info">${name}, ${date}</div>
       <div class="message-content">${text}</div>
       `;
    return messageEl;
  }

  send(event) {
    event.preventDefault();

    const data = JSON.stringify({
      event: 'chat',
      message: this.text.value,
    });
    this.login.ws.send(data);
    this.text.value = '';
  }

  logout(msg) {
    if (msg.message.action === 'logout') {
      const index = this.users.indexOf(msg.message.name);
      this.users.splice(index, 1);
    } else if (msg.message.action === 'login') {
      if (this.nickname !== msg.message.name) {
        this.users.push(msg.message.name);
      }
    }
    this.getUserList();
  }
}
