document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const issues = Storage.getIssues();
  const providers = Storage.getProviders();

  // 1. Populate Action Alerts
  let awaiting = 0;
  let rejected = 0;
  let reassignNeeded = 0;
  let resolvedToday = 0;
  let verifPending = 0;
  let verifiedToday = 0;
  let rejectedVerif = 0;

  const today = new Date().toDateString();

  issues.forEach(issue => {
    if (issue.providerResponse === 'Pending') awaiting++;
    if (issue.providerResponse === 'Rejected') rejected++;
    if (issue.status === 'Reassign Needed') reassignNeeded++;
    
    // Quick resolved check for today
    if (issue.status === 'Resolved' || issue.status === 'Closed') {
      resolvedToday++;
      verifiedToday++; // Same as resolved in this workflow
    }

    if (issue.status === 'Verification Pending') verifPending++;
    if (issue.verificationStatus === 'Rejected Verification') rejectedVerif++;
  });

  document.getElementById('alert-awaiting').textContent = awaiting;
  document.getElementById('alert-rejected').textContent = rejected;
  document.getElementById('alert-reassign').textContent = reassignNeeded;
  document.getElementById('alert-resolved').textContent = resolvedToday;

  const alertVerifPending = document.getElementById('alert-verif-pending');
  const alertVerifiedToday = document.getElementById('alert-verified-today');
  const alertRejectedVerif = document.getElementById('alert-rejected-verif');
  
  if (alertVerifPending) alertVerifPending.textContent = verifPending;
  if (alertVerifiedToday) alertVerifiedToday.textContent = verifiedToday;
  if (alertRejectedVerif) alertRejectedVerif.textContent = rejectedVerif;

  // 2. Provider Performance Widget
  const providerListEl = document.getElementById('provider-performance-list');
  if (providerListEl) {
    const activeProviders = providers.filter(p => p.status === 'Active');
    
    // Sort by most assigned tasks
    activeProviders.sort((a, b) => (b.assignedIssues || 0) - (a.assignedIssues || 0));
    
    const top5 = activeProviders.slice(0, 5);
    providerListEl.innerHTML = '';

    top5.forEach(p => {
      const metrics = Storage.getProviderMetrics(p.id);
      
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 bg-slate-50 rounded-xl';
      item.innerHTML = `
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-slate-800 truncate">${p.name}</p>
          <div class="flex gap-3 text-[10px] font-semibold text-slate-500 mt-1">
            <span class="text-blue-500">Assigned: ${metrics.assigned}</span>
            <span class="text-emerald-500">Resolved: ${metrics.resolved}</span>
          </div>
        </div>
        <div class="flex flex-col items-end pl-2 shrink-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Accept Rate</span>
          <span class="text-sm font-black text-slate-800">${metrics.acceptanceRate}%</span>
        </div>
      `;
      providerListEl.appendChild(item);
    });
  }

  // 3. Render Recent Issues
  const recentListEl = document.getElementById('recent-issues-list');
  if (recentListEl) {
    recentListEl.innerHTML = '';
    const recent = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    
    recent.forEach(issue => {
      let badgeClass = 'bg-[#F59E0B]/10 text-[#F59E0B]';
      if (issue.status === 'In Progress') badgeClass = 'bg-[#3B82F6]/10 text-[#3B82F6]';
      if (issue.status === 'Resolved' || issue.status === 'Closed') badgeClass = 'bg-[#10B981]/10 text-[#10B981]';
      if (issue.status === 'Reassign Needed') badgeClass = 'bg-red-100 text-red-600';

      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded-2xl border border-slate-100 card-shadow';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h4 class="text-base font-bold text-slate-800 leading-tight">${issue.title}</h4>
          <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">${issue.category}</span>
        </div>
        <div class="flex items-center text-[#6B7280] text-xs mb-3">
          <iconify-icon icon="lucide:map-pin" class="mr-1"></iconify-icon>
          <span>${issue.location}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="px-2 py-1 ${badgeClass} text-[10px] font-bold rounded-full uppercase tracking-wide">${issue.status}</span>
          <span class="text-[#6B7280] text-[10px]">${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
      `;
      recentListEl.appendChild(card);
    });
  }

  // --- Drawer & Notification Logic ---
  const overlay = document.getElementById('drawer-overlay');
  const navDrawer = document.getElementById('nav-drawer');
  const notifDrawer = document.getElementById('notif-drawer');
  
  const btnOpenNav = document.getElementById('btn-open-nav');
  const btnOpenNotif = document.getElementById('btn-open-notifications');
  const btnCloseNotif = document.getElementById('btn-close-notif');

  function openDrawer(drawer) {
    overlay.classList.remove('hidden');
    // small delay to allow display block to apply before opacity transition
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      if (drawer === navDrawer) {
        navDrawer.classList.remove('-translate-x-full');
      } else if (drawer === notifDrawer) {
        notifDrawer.classList.remove('translate-x-full');
        renderNotifications();
      }
    }, 10);
  }

  function closeDrawers() {
    navDrawer?.classList.add('-translate-x-full');
    notifDrawer?.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  }

  btnOpenNav?.addEventListener('click', () => openDrawer(navDrawer));
  btnOpenNotif?.addEventListener('click', () => openDrawer(notifDrawer));
  btnCloseNotif?.addEventListener('click', closeDrawers);
  overlay?.addEventListener('click', closeDrawers);

  // Logout Logic
  document.getElementById('btn-drawer-logout')?.addEventListener('click', () => {
    Storage.logout();
    window.location.replace('03-localpulse-mobile-login-screen.html');
  });

  // Notification Rendering
  const notifList = document.getElementById('notif-list');
  const notifBadge = document.getElementById('notification-badge');
  const notifCountText = document.getElementById('notif-count-text');

  function updateNotificationBadge() {
    if (!notifBadge) return;
    const notifications = Storage.getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    if (unread > 0) {
      notifBadge.textContent = unread;
      notifBadge.classList.remove('hidden');
    } else {
      notifBadge.classList.add('hidden');
    }
  }

  // Initial badge update
  updateNotificationBadge();

  // Make functions global for inline handlers
  window.markRead = function(id) {
    Storage.markNotificationRead(id);
    updateNotificationBadge();
    renderNotifications();
  };

  window.deleteNotif = function(id) {
    Storage.deleteNotification(id);
    updateNotificationBadge();
    renderNotifications();
  };

  document.getElementById('btn-mark-all-read')?.addEventListener('click', () => {
    Storage.markAllNotificationsRead();
    updateNotificationBadge();
    renderNotifications();
  });

  function renderNotifications() {
    if (!notifList) return;
    const notifications = Storage.getNotifications();
    
    // Update header text
    const unread = notifications.filter(n => !n.read).length;
    if (notifCountText) notifCountText.textContent = `${unread} Unread`;

    if (notifications.length === 0) {
      notifList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-slate-400">
          <iconify-icon icon="lucide:bell-off" class="text-4xl mb-2 text-slate-200"></iconify-icon>
          <p class="text-sm font-semibold">No notifications yet</p>
        </div>
      `;
      return;
    }

    notifList.innerHTML = notifications.map(n => {
      let icon = 'lucide:bell';
      let iconColor = 'text-slate-500';
      let iconBg = 'bg-slate-100';
      
      if (n.type === 'issue') {
        icon = 'lucide:alert-circle'; iconColor = 'text-orange-500'; iconBg = 'bg-orange-100';
      } else if (n.type === 'provider') {
        icon = 'lucide:user-check'; iconColor = 'text-blue-500'; iconBg = 'bg-blue-100';
      } else if (n.type === 'system') {
        icon = 'lucide:info'; iconColor = 'text-purple-500'; iconBg = 'bg-purple-100';
      }

      // Format relative time (mock simple string for display)
      const date = new Date(n.timestamp);
      const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const dateStr = date.toLocaleDateString();

      return `
        <div class="bg-white p-3 rounded-xl border ${n.read ? 'border-slate-100 opacity-60' : 'border-blue-200 shadow-sm'} relative group transition-all">
          ${!n.read ? '<div class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
          <div class="flex gap-3 items-start">
            <div class="w-8 h-8 rounded-full ${iconBg} ${iconColor} flex items-center justify-center shrink-0">
              <iconify-icon icon="${icon}" class="text-sm"></iconify-icon>
            </div>
            <div class="flex-1 pr-6">
              <h4 class="text-xs font-bold text-slate-900">${n.title}</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-snug">${n.message}</p>
              <p class="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">${dateStr} ${timeStr}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
            ${!n.read ? `<button onclick="markRead('${n.id}')" class="text-[10px] font-bold text-[#16A34A] hover:underline px-1 py-0.5">Mark Read</button>` : ''}
            <button onclick="deleteNotif('${n.id}')" class="text-[10px] font-bold text-red-500 hover:underline px-1 py-0.5">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

});
