/* ==========================================================================
   TINYWINS OS — TOAST NOTIFICATIONS
   ========================================================================== */
export function showToast(message, type = 'info', duration = 3000) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText =
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg =
    type === 'success' ? '#4fd1a1' : type === 'error' ? '#ff6fa8' : '#7b6cf0';
  toast.style.cssText = `
    background: ${bg};
    color: #fff;
    padding: 10px 20px;
    border-radius: 999px;
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(43,40,80,0.2);
    animation: slideup 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
  `;
  toast.innerText = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}
