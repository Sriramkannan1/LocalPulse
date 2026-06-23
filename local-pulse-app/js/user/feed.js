document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardUserRoute()) return;

  const feedContainer = document.querySelector('main');
  const searchInput = document.querySelector('input[type="text"]');
  
  // We need to setup filter chips, so we might need to inject them in the HTML later
  let currentCategoryFilter = 'All';

  function renderIssues(searchQuery = '', categoryFilter = 'All') {
    const issues = Storage.getIssues();
    
    // Sort descending by date
    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let filtered = issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            issue.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    if (!feedContainer) return;

    const user = Storage.getCurrentUser() || { name: 'Guest', reports: 0, reputation: 0, location: 'Unknown' };

    // Clear existing cards
    feedContainer.innerHTML = `
      <!-- Hero Card -->
      <div class="bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-3xl p-6 mb-6 shadow-lg shadow-green-200 text-white relative overflow-hidden">
        <div class="absolute -right-6 -top-6 text-green-400/30">
          <iconify-icon icon="lucide:leaf" width="120"></iconify-icon>
        </div>
        <div class="relative z-10">
          <h2 class="text-2xl font-extrabold mb-1 tracking-tight">Welcome Back, ${user.name} 👋</h2>
          <p class="text-green-50 text-sm font-medium flex items-center mb-6">
            <iconify-icon icon="lucide:map-pin" class="mr-1"></iconify-icon> ${user.location}
          </p>
          
          <div class="flex items-center justify-between bg-white/20 rounded-2xl p-4 backdrop-blur-md border border-white/20">
            <div class="text-center">
              <p class="text-xs font-bold text-green-50 uppercase tracking-wider mb-1">Impact</p>
              <p class="text-xl font-black">${user.reputation}</p>
            </div>
            <div class="w-px h-8 bg-white/30"></div>
            <div class="text-center">
              <p class="text-xs font-bold text-green-50 uppercase tracking-wider mb-1">Reports</p>
              <p class="text-xl font-black">${user.reports}</p>
            </div>
            <div class="w-px h-8 bg-white/30"></div>
            <div class="text-center">
              <p class="text-xs font-bold text-green-50 uppercase tracking-wider mb-1">Resolved</p>
              <p class="text-xl font-black">${Math.floor(user.reports * 0.4)}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Chips Container -->
      <div class="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-2" id="filter-chips">
        ${['All', 'Road Issue', 'Water Issue', 'Electricity', 'Garbage', 'Safety'].map(cat => `
          <button class="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border 
            ${currentCategoryFilter === cat 
              ? 'bg-[#16A34A] text-white border-[#16A34A]' 
              : 'bg-white text-slate-500 border-slate-200'} filter-chip" data-category="${cat}">
            ${cat}
          </button>
        `).join('')}
      </div>
    `;

    // Bind filter chip events
    feedContainer.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentCategoryFilter = e.target.dataset.category;
        renderIssues(searchInput ? searchInput.value : '', currentCategoryFilter);
      });
    });

    filtered.forEach(issue => {
      const timeAgo = Math.floor((new Date() - new Date(issue.createdAt)) / (1000 * 60 * 60)); // simple hours ago
      
      let badgeClass = 'bg-orange-50 text-[#F59E0B]';
      if (issue.status === 'In Progress') badgeClass = 'bg-blue-50 text-blue-500';
      if (issue.status === 'Resolved') badgeClass = 'bg-emerald-50 text-emerald-600';

      let categoryColor = 'bg-slate-50 text-slate-500';
      if (issue.category.includes('Electricity')) categoryColor = 'bg-orange-50 text-[#F59E0B]';
      if (issue.category.includes('Road')) categoryColor = 'bg-red-50 text-red-500';
      if (issue.category.includes('Garbage')) categoryColor = 'bg-emerald-50 text-emerald-600';
      if (issue.category.includes('Water')) categoryColor = 'bg-blue-50 text-blue-500';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-[20px] p-4 mb-4 shadow-sm border border-slate-50 active:scale-[0.98] transition-transform cursor-pointer';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-slate-900 font-bold text-[16px] leading-tight flex-1 mr-2">${issue.title}</h3>
          <span class="${categoryColor} text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">${issue.category}</span>
        </div>
        <p class="text-slate-500 text-[13px] leading-relaxed mb-4 line-clamp-2">
          ${issue.description}
        </p>
        <div class="flex items-center justify-between mb-3">
          <span class="${badgeClass} text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">${issue.status}</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-50 pt-3">
          <div class="flex items-center text-slate-400">
            <iconify-icon icon="lucide:map-pin" class="text-sm mr-1"></iconify-icon>
            <span class="text-[12px] font-medium truncate max-w-[150px]">${issue.location}</span>
          </div>
          <span class="text-slate-400 text-[11px] font-medium">${timeAgo}h ago</span>
        </div>
      `;

      card.addEventListener('click', () => {
        // Store selected issue ID in localStorage to pass data to details screen
        localStorage.setItem('selected_issue_id', issue.id);
        Router.navigate('06-localpulse-issue-details-screen.html');
      });

      feedContainer.appendChild(card);
    });

    if (filtered.length === 0) {
      feedContainer.innerHTML += `<div class="text-center text-slate-400 mt-10 text-sm">No issues found.</div>`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderIssues(e.target.value, currentCategoryFilter);
    });
  }

  // Initial render
  renderIssues('', 'All');

  const fab = document.getElementById('fab-add-issue');
  if (fab) {
    fab.addEventListener('click', () => {
      Router.navigate('05-localpulse-report-issue-screen.html');
    });
  }

  // --- Modals & Panels ---
  const userRole = Storage.getCurrentUser()?.role || 'user';

  function createModal(id, title, contentHtml) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 class="font-bold text-slate-800 text-lg">${title}</h3>
          <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 active:scale-90 transition-transform close-modal">
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <div class="p-4 text-slate-600 text-sm space-y-4 overflow-y-auto flex-1">
          ${contentHtml}
        </div>
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button class="px-6 py-2 bg-[#16A34A] text-white font-bold rounded-xl active:bg-[#15803d] transition-colors close-modal">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    });

    return modal;
  }

  function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  // Events Section
  document.getElementById('tab-events')?.addEventListener('click', () => {
    if (userRole === 'admin') {
      Router.navigate('09-localpulse-admin-events-screen.html');
    } else {
      Router.navigate('14-localpulse-events-viewer.html');
    }
  });

  // Providers Section
  document.getElementById('tab-providers')?.addEventListener('click', () => {
    if (userRole === 'admin') {
      Router.navigate('11-localpulse-admin-providers-management.html');
    } else {
      Router.navigate('15-localpulse-providers-viewer.html');
    }
  });

  // Slide Menu (Left)
  const menuHTML = `
    <div id="slide-menu" class="fixed inset-0 z-[200] hidden">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm menu-bg transition-opacity opacity-0"></div>
      <div class="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transition-transform -translate-x-full menu-panel">
        <div class="p-6 bg-green-50 border-b border-green-100 flex justify-between items-center shrink-0">
          <h2 class="text-xl font-bold text-green-700">LocalPulse</h2>
          <button class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 active:bg-green-200 menu-close">
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold transition-colors" onclick="window.Router.navigate('04-localpulse-feed-screen.html')">
            <iconify-icon icon="lucide:home" class="text-xl"></iconify-icon> Home
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold transition-colors" onclick="window.Router.navigate('12-localpulse-my-reports-dashboard.html')">
            <iconify-icon icon="lucide:clipboard-list" class="text-xl"></iconify-icon> My Reports
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold transition-colors" onclick="window.Router.navigate('07-localpulse-settings-screen.html')">
            <iconify-icon icon="lucide:settings" class="text-xl"></iconify-icon> Settings
          </button>
        </div>
        <div class="p-4 border-t border-slate-100 shrink-0">
          <button class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-bold active:bg-red-100 transition-colors menu-logout">
            <iconify-icon icon="lucide:log-out"></iconify-icon> Logout
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', menuHTML);

  const slideMenu = document.getElementById('slide-menu');
  const menuBg = slideMenu.querySelector('.menu-bg');
  const menuPanel = slideMenu.querySelector('.menu-panel');

  document.getElementById('header-menu-btn')?.addEventListener('click', () => {
    slideMenu.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => {
      menuBg.classList.remove('opacity-0');
      menuPanel.classList.remove('-translate-x-full');
    }, 10);
  });

  const closeMenu = () => {
    menuBg.classList.add('opacity-0');
    menuPanel.classList.add('-translate-x-full');
    setTimeout(() => slideMenu.classList.add('hidden'), 300);
  };

  slideMenu.querySelector('.menu-close').addEventListener('click', closeMenu);
  menuBg.addEventListener('click', closeMenu);

  slideMenu.querySelector('.menu-logout').addEventListener('click', () => {
    Storage.logout();
    Router.navigate('03-localpulse-mobile-login-screen.html');
  });

  // Notifications Panel (Right)
  const notifHTML = `
    <div id="notif-panel" class="fixed inset-0 z-[200] hidden">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm notif-bg transition-opacity opacity-0"></div>
      <div class="absolute top-0 right-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col transition-transform translate-x-full notif-drawer">
        <div class="p-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 class="text-lg font-bold text-slate-800">Notifications</h2>
          <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200 notif-close">
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 border-b border-slate-50 bg-green-50/50">
            <h4 class="font-bold text-slate-800 text-sm">Issue Status Updated</h4>
            <p class="text-xs text-slate-600 mt-1">Your report "Broken Street Light" is now In Progress.</p>
            <span class="text-[10px] text-slate-400 mt-2 block">10m ago</span>
          </div>
          <div class="p-4 border-b border-slate-50">
            <h4 class="font-bold text-slate-800 text-sm">New Community Event</h4>
            <p class="text-xs text-slate-600 mt-1">Join the Tree Plantation drive this Sunday!</p>
            <span class="text-[10px] text-slate-400 mt-2 block">2h ago</span>
          </div>
          <div class="p-4 border-b border-slate-50">
            <h4 class="font-bold text-slate-800 text-sm">Garbage Complaint Resolved</h4>
            <p class="text-xs text-slate-600 mt-1">The garbage overflow issue has been successfully resolved.</p>
            <span class="text-[10px] text-slate-400 mt-2 block">1d ago</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', notifHTML);

  // Add badge to notification icon
  const headerNotifBtn = document.getElementById('header-notif-btn');
  if (headerNotifBtn) {
    headerNotifBtn.classList.add('relative');
    headerNotifBtn.innerHTML += `<span class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>`;
  }

  const notifPanel = document.getElementById('notif-panel');
  const notifBg = notifPanel.querySelector('.notif-bg');
  const notifDrawer = notifPanel.querySelector('.notif-drawer');

  headerNotifBtn?.addEventListener('click', () => {
    notifPanel.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => {
      notifBg.classList.remove('opacity-0');
      notifDrawer.classList.remove('translate-x-full');
    }, 10);
  });

  const closeNotif = () => {
    notifBg.classList.add('opacity-0');
    notifDrawer.classList.add('translate-x-full');
    setTimeout(() => notifPanel.classList.add('hidden'), 300);
  };

  notifPanel.querySelector('.notif-close').addEventListener('click', closeNotif);
  notifBg.addEventListener('click', closeNotif);

});
