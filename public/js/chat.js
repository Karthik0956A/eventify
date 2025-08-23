const socket = io();
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const eventId = chatForm ? chatForm.dataset.eventId : null;
const user = window.currentUser || { name: 'Guest' };

if (eventId && chatForm) {
  socket.emit('joinRoom', { eventId, user });
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      socket.emit('chatMessage', { eventId, user, text });
      chatInput.value = '';
    }
  });
  socket.on('chatMessage', ({ user, text }) => {
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${user}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
