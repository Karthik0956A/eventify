document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const success = document.getElementById('toast-success');
    const error = document.getElementById('toast-error');
    if (success) success.style.display = 'none';
    if (error) error.style.display = 'none';
  }, 3000);
});
