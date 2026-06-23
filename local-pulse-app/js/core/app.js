document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mock DB
  if (window.MockDB) {
    MockDB.initialize();
  }

  // Handle common bottom navigation bindings
  if (window.Router) {
    Router.handleBottomNav();
  }
});
