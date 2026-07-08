/**
 * Shared session gate (single shared login — swap for server session/JWT later).
 */
var PortalAuth = {
  SESSION_KEY: 'portal_session_v1',

  isAuthed: function () {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  login: function () {
    sessionStorage.setItem(this.SESSION_KEY, '1');
  },

  logout: function () {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  guard: function () {
    if (!this.isAuthed()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  verifyDemoPassword: function (password) {
    return String(password) === 'portal-demo';
  }
};

function portalSidebarHTML() {
  return (
    '<aside class="portal-sidebar">' +
    '<div class="portal-brand">Blvck Sapphire<span>Recruiting portal</span></div>' +
    '<nav class="portal-nav">' +
    '<a href="dashboard.html" data-nav>Dashboard</a>' +
    '<a href="postings.html" data-nav>Job postings</a>' +
    '<a href="posting-edit.html" data-nav>New posting</a>' +
    '<a href="applications.html" data-nav>Applications inbox</a>' +
    '</nav>' +
    '<div class="portal-sidebar-footer">' +
    '<p>Prototype: data saves in this browser. Connect your API when ready.</p>' +
    '<button type="button" class="btn btn-ghost btn-sm" id="portal-logout" style="margin-top:0.75rem;width:100%;">Sign out</button>' +
    '</div>' +
    '</aside>'
  );
}

function portalInjectSidebar(mountId) {
  var el = document.getElementById(mountId);
  if (el) el.innerHTML = portalSidebarHTML();
}

function portalInitNav() {
  var path = window.location.pathname.split(/[/\\]/).pop() || 'dashboard.html';
  var activeFile =
    path === 'application-detail.html' ? 'applications.html' : path;

  document.querySelectorAll('.portal-nav a[data-nav]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var file = href.split(/[/\\]/).pop();
    a.classList.toggle('is-active', file === activeFile);
  });

  var logoutBtn = document.getElementById('portal-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      PortalAuth.logout();
    });
  }
}

function portalBootstrap() {
  portalInjectSidebar('portal-sidebar-mount');
  portalInitNav();
}

/** Label for CSV + UI badges */
window.PortalStages = window.PortalStages || {
  labels: {
    new: 'New',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
    declined: 'Not a fit'
  },
  tagClassByStatus: {
    new: 'tag-stage-new',
    screening: 'tag-stage-screening',
    interview: 'tag-stage-interview',
    offer: 'tag-stage-offer',
    hired: 'tag-stage-hired',
    declined: 'tag-stage-declined'
  }
};
