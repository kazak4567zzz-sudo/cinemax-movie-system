function getUser() {
  return JSON.parse(localStorage.getItem('cinemax_user') || 'null');
}

function logout() {
  localStorage.removeItem('cinemax_user');
  window.location.href = 'index.html';
}

function escapeUserText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function renderUserNav() {
  const container = document.getElementById('userNavArea');
  if (!container) return;
  const user = getUser();
  if (user) {
    const username = escapeUserText(user.username || 'User');
    const email = escapeUserText(user.email || '');
    const initial = escapeUserText((user.username || 'U')[0].toUpperCase());
    container.innerHTML = `
      <div class="user-nav-wrap" style="position:relative;">
        <button class="user-avatar-btn" onclick="document.getElementById('userDropdown').classList.toggle('show')" title="${username}">
          <span class="user-avatar">${initial}</span>
          <span class="user-name">${username}</span>
          <i class="bi bi-chevron-down" style="font-size:10px;"></i>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <div class="user-avatar large">${initial}</div>
            <div>
              <div style="font-weight:700;font-size:14px;">${username}</div>
              <div style="font-size:11px;color:#666;">${email}</div>
            </div>
          </div>
          <div class="user-dropdown-divider"></div>
          <a href="favorites.html" class="user-dropdown-item"><i class="bi bi-heart me-2"></i>My Favorites</a>
          <a href="reviews.html" class="user-dropdown-item"><i class="bi bi-chat-square-text me-2"></i>Write a Review</a>
          <div class="user-dropdown-divider"></div>
          <button class="user-dropdown-item danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button>
        </div>
      </div>`;
    document.addEventListener('click', e => {
      if (!e.target.closest('.user-nav-wrap')) {
        const dd = document.getElementById('userDropdown');
        if (dd) dd.classList.remove('show');
      }
    });
  } else {
    container.innerHTML = `<a href="auth.html" class="btn-signin"><i class="bi bi-person me-1"></i><span data-i18n="signin">Sign In</span></a>`;
  }
  if (typeof applyLang === 'function') applyLang();
}

document.addEventListener('DOMContentLoaded', renderUserNav);
