const Router = {
  navigate: function(page) {
    window.location.href = page;
  },

  guardUserRoute: function() {
    const user = Storage.getCurrentUser();
    if (!user) {
      this.navigate('03-localpulse-mobile-login-screen.html');
      return false;
    }
    return true;
  },

  guardAdminRoute: function() {
    const user = Storage.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.navigate('03-localpulse-mobile-login-screen.html');
      return false;
    }
    return true;
  },

  handleBottomNav: function() {
    const links = {
      'nav-feed-link': '04-localpulse-feed-screen.html',
      'nav-reports-link': '12-localpulse-my-reports-dashboard.html',
      'nav-report-link': '05-localpulse-report-issue-screen.html',
      'nav-profile-link': '07-localpulse-settings-screen.html',
      
      'nav-admin-dash': '08-localpulse-admin-dashboard.html',
      'nav-admin-issues': '10-localpulse-admin-issues-management.html',
      'nav-admin-events': '09-localpulse-admin-events-screen.html',
      'nav-admin-providers': '11-localpulse-admin-providers-management.html'
    };

    for (const [id, url] of Object.entries(links)) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate(url);
        });
      }
    }
  }
};

window.Router = Router;
