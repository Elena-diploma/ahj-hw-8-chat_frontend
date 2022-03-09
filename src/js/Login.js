export default class Login {
  constructor(parentEL, url) {
    this.parentEL = parentEL;
    this.url = url;
    this.modal = document.querySelector('.modal');
    this.form = document.querySelector('.login-form');
    this.nameInput = document.querySelector('.nickname');
    this.login = this.login.bind(this);
    this.errModal = this.errModal.bind(this);
    this.hideError = this.hideError.bind(this);
  }

  init() {
    this.form.addEventListener('submit', this.login);
  }

  login(event) {
    event.preventDefault();
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('open', () => {
      const data = JSON.stringify({event: 'login', message: this.nameInput.value});
      this.ws.send(data);
      this.modal.classList.add('hidden');
      this.parentEL.classList.remove('hidden');
    });

    this.ws.addEventListener('message', (evt) => {
      const request = JSON.parse(evt.data);
      console.log(request);
      if (request.event === 'connect') {
        this.userList = request.message;
        this.parentEL.dispatchEvent(new Event('connect'));
      }
    });

    this.ws.addEventListener('close', (event) => {
      console.log(event.code);
      if (event.code === 1000) {
        this.modal.classList.remove('hidden');
        this.modal.style.opacity = 0.5;
        this.parentEL.classList.add('hidden');
        this.errModal(event);
      }
    });
  }

  errModal(event) {
    this.error = document.createElement('div');
    this.error.className = 'error-modal';
    this.error.innerText = 'Данный псевдоним уже занят.';
    console.log(event.code);
    document.body.append(this.error);
    this.nameInput.addEventListener('focus', this.hideError);
  }

  hideError() {
    this.nameInput.value = '';
    if (this.error) {
      this.error.remove();
      this.modal.style.opacity = 1;
    }
  }
}
