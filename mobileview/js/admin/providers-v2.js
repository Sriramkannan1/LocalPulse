document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const GLOBAL_CAPACITY = 10;
  
  const locations = [
    'Peelamedu', 'Singanallur', 'RS Puram', 'Gandhipuram', 
    'Saibaba Colony', 'Saravanampatti'
  ];

  const categories = [
    'Electrician', 'Plumber', 'Water Department', 
    'Road Maintenance', 'Safety Officer', 'Community Volunteer'
  ];

  let searchQuery = '';
  document.getElementById('provider-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderDashboard();
  });

  // Export functions to global for inline onclick handlers
  window.approveProvider = function(id) {
    const p = Storage.getProviders().find(x => x.id === id);
    if(p) {
      p.status = 'Active';
      Storage.updateProvider(p);
      renderDashboard();
    }
  };

  window.rejectProvider = function(id) {
    const p = Storage.getProviders().find(x => x.id === id);
    if(p) {
      p.status = 'Rejected';
      Storage.updateProvider(p);
      renderDashboard();
    }
  };

  function renderDashboard() {
    const allProviders = Storage.getProviders();
    const providers = allProviders.filter(p => p.status !== 'Rejected');
    
    const active = providers.filter(p => p.status === 'Active');
    const inactive = providers.filter(p => p.status === 'Inactive');
    const onLeave = providers.filter(p => p.status === 'On Leave');
    const pending = providers.filter(p => p.status === 'Pending Approval');
    
    let totalAssigned = 0;
    let totalResolved = 0;
    
    // Process Metrics
    const providerMetricsMap = {};
    providers.forEach(p => {
      // Mock tracking if no actual assignments logic:
      const pMetrics = Storage.getProviderMetrics ? Storage.getProviderMetrics(p.id) : { assigned: p.assignedIssues || 0, resolved: 0, rejected: 0, acceptanceRate: 100 };
      
      // If we don't have actual task linking, we fake resolved for the UI
      if (!Storage.getProviderMetrics) {
         pMetrics.resolved = Math.floor(pMetrics.assigned * 0.8); // mock 80% resolved
         pMetrics.acceptanceRate = 90 + Math.floor(Math.random() * 10);
      }
      
      providerMetricsMap[p.id] = pMetrics;
      totalAssigned += pMetrics.assigned;
      totalResolved += pMetrics.resolved;
    });

    // 1. Network Score (0-100)
    let locsWithProviders = 0;
    locations.forEach(loc => {
      const count = providers.filter(p => (p.location === loc) || (p.coverageArea && p.coverageArea.includes(loc))).length;
      if (count > 0) locsWithProviders++;
    });
    const coverageScore = (locsWithProviders / locations.length) * 100;
    
    const availabilityScore = providers.length > 0 ? (active.length / providers.length) * 100 : 0;
    const assignmentSuccess = 85 + Math.random() * 10; 
    const resolutionSuccess = totalAssigned > 0 ? (totalResolved / totalAssigned) * 100 : 100;

    const networkScore = Math.round((coverageScore * 0.25) + (availabilityScore * 0.25) + (assignmentSuccess * 0.25) + (resolutionSuccess * 0.25));
    
    let scoreColor = 'text-red-500';
    let scoreBg = 'bg-red-50';
    let scoreStatus = 'Critical';
    if (networkScore >= 90) { scoreColor = 'text-green-500'; scoreBg = 'bg-green-50'; scoreStatus = 'Excellent'; }
    else if (networkScore >= 75) { scoreColor = 'text-blue-500'; scoreBg = 'bg-blue-50'; scoreStatus = 'Healthy'; }
    else if (networkScore >= 50) { scoreColor = 'text-orange-500'; scoreBg = 'bg-orange-50'; scoreStatus = 'Needs Attention'; }

    const nsCard = document.getElementById('network-score-card');
    if (nsCard) {
      nsCard.innerHTML = `
        <div class="flex items-center justify-between z-10 relative">
          <div>
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Provider Network Score</h2>
            <p class="text-xs font-bold ${scoreColor} mb-2">${scoreStatus}</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-black text-slate-900">${networkScore || 0}</span>
              <span class="text-lg font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <div class="w-16 h-16 rounded-full flex items-center justify-center ${scoreBg} ${scoreColor}">
            <iconify-icon icon="lucide:activity" class="text-3xl"></iconify-icon>
          </div>
        </div>
      `;
    }

    // 2. Network Health Grid
    const healthGrid = document.getElementById('health-grid');
    if (healthGrid) {
      healthGrid.innerHTML = `
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">Total</p>
          <p class="text-xl font-black text-slate-900">${providers.length}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">Active</p>
          <p class="text-xl font-black text-emerald-600">${active.length}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">Inactive</p>
          <p class="text-xl font-black text-slate-400">${inactive.length}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">On Leave</p>
          <p class="text-xl font-black text-amber-500">${onLeave.length}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">Assigned</p>
          <p class="text-xl font-black text-blue-600">${totalAssigned}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase">Resolved</p>
          <p class="text-xl font-black text-purple-600">${totalResolved}</p>
        </div>
      `;
    }

    // 3. Status Badges Breakdown
    let availableCount = 0;
    let busyCount = 0;
    active.forEach(p => {
      const assigned = providerMetricsMap[p.id]?.assigned || 0;
      if (assigned >= 5) busyCount++;
      else availableCount++;
    });

    const statusBadges = document.getElementById('status-badges');
    if (statusBadges) {
      statusBadges.innerHTML = `
        <span class="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">Available: ${availableCount}</span>
        <span class="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200">Busy: ${busyCount}</span>
        <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">On Leave: ${onLeave.length}</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">Inactive: ${inactive.length}</span>
      `;
    }

    // 4. Alerts
    const alertsContainer = document.getElementById('alerts-section');
    if (alertsContainer) {
      alertsContainer.innerHTML = '';
      const generateAlert = (icon, colorClass, bgClass, title, subtitle) => `
        <div class="flex items-start gap-3 p-3 rounded-xl border ${bgClass} border-${colorClass.split('-')[1]}-200 mb-2">
          <iconify-icon icon="${icon}" class="text-xl mt-0.5 ${colorClass}"></iconify-icon>
          <div>
            <p class="text-sm font-bold text-slate-800">${title}</p>
            <p class="text-xs font-medium text-slate-600">${subtitle}</p>
          </div>
        </div>
      `;
      let alertsHTML = '';
      
      active.forEach(p => {
        if ((providerMetricsMap[p.id]?.assigned || 0) >= 10) {
          alertsHTML += generateAlert('lucide:alert-triangle', 'text-red-500', 'bg-red-50', 'Provider Overloaded', `⚠ ${p.name} has ${providerMetricsMap[p.id].assigned} Active Assignments`);
        }
      });
      
      categories.forEach(cat => {
        const hasProvider = providers.some(p => p.category === cat || p.role === cat);
        if (!hasProvider) {
          alertsHTML += generateAlert('lucide:map', 'text-orange-500', 'bg-orange-50', 'Coverage Gap', `No ${cat} Provider Available across the network`);
        }
      });
      
      if (pending.length > 0) {
         alertsHTML += generateAlert('lucide:clock', 'text-blue-500', 'bg-blue-50', 'Pending Approval', `${pending.length} provider(s) waiting for admin approval`);
      }
      
      alertsContainer.innerHTML = alertsHTML;
    }

    // 5. Pending Approval Workflow
    const approvalSection = document.getElementById('approval-section');
    const pendingList = document.getElementById('pending-list');
    if (approvalSection && pendingList) {
      if (pending.length > 0) {
        approvalSection.classList.remove('hidden');
        pendingList.innerHTML = pending.map(p => `
          <div class="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center card-shadow">
            <div>
              <p class="text-sm font-bold text-slate-900">${p.name}</p>
              <p class="text-xs font-medium text-slate-500">${p.role || p.category}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="rejectProvider('${p.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm active:scale-95 transition">
                <iconify-icon icon="lucide:x"></iconify-icon>
              </button>
              <button onclick="approveProvider('${p.id}')" class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-sm active:scale-95 transition">
                <iconify-icon icon="lucide:check"></iconify-icon>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        approvalSection.classList.add('hidden');
      }
    }

    // 6. Location Coverage Health
    const locCoverageList = document.getElementById('location-coverage-list');
    if (locCoverageList) {
      locCoverageList.innerHTML = locations.map(loc => {
        const count = providers.filter(p => (p.location === loc) || (p.coverageArea && p.coverageArea.includes(loc))).length;
        let lStatus = 'Critical';
        let lColor = 'text-red-600';
        let lBg = 'bg-red-100';
        
        if (count >= 6) { lStatus = 'Excellent'; lColor = 'text-emerald-700'; lBg = 'bg-emerald-100'; }
        else if (count >= 3) { lStatus = 'Healthy'; lColor = 'text-blue-700'; lBg = 'bg-blue-100'; }
        else if (count >= 1) { lStatus = 'Low Coverage'; lColor = 'text-orange-700'; lBg = 'bg-orange-100'; }

        return `
          <div class="flex justify-between items-center p-3 border-b border-slate-50 last:border-0">
            <div>
              <p class="text-sm font-bold text-slate-800">${loc}</p>
              <p class="text-xs font-medium text-slate-500">${count} Providers</p>
            </div>
            <span class="px-2 py-1 ${lBg} ${lColor} text-[10px] font-bold rounded uppercase tracking-wider">${lStatus}</span>
          </div>
        `;
      }).join('');
    }

    // 7. Category Coverage
    const catCoverageList = document.getElementById('category-coverage-list');
    if (catCoverageList) {
      catCoverageList.innerHTML = categories.map(cat => {
        const count = providers.filter(p => p.category === cat || p.role === cat).length;
        return `
          <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 truncate mr-2" title="${cat}">${cat}</span>
            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-900">${count}</span>
          </div>
        `;
      }).join('');
    }

    // 8. Assignment Load Distribution (Top 5 busy)
    const busyProvidersList = document.getElementById('busy-providers-list');
    if (busyProvidersList) {
      const sortedBusy = [...providers].sort((a, b) => (providerMetricsMap[b.id]?.assigned || 0) - (providerMetricsMap[a.id]?.assigned || 0)).slice(0, 5);
      
      if (sortedBusy.length > 0) {
        busyProvidersList.innerHTML = sortedBusy.map(p => {
          const m = providerMetricsMap[p.id];
          const assigned = m?.assigned || 0;
          const resolved = m?.resolved || 0;
          const widthPct = assigned > 0 ? Math.min(100, Math.round((resolved / assigned) * 100)) : 0;
          
          return `
            <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow">
              <div class="flex justify-between text-sm font-bold text-slate-800 mb-2">
                <span>${p.name}</span>
                <span class="text-blue-600">${assigned} Assigned</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                 <div class="bg-purple-500 h-2 progress-bar-fill" style="width: ${widthPct}%"></div>
              </div>
              <div class="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                 <span>Resolved: ${resolved}</span>
                 <span>Accepted: ${assigned}</span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        busyProvidersList.innerHTML = `<p class="text-sm text-slate-500">No busy providers found.</p>`;
      }
    }

    // 9. Provider Utilization
    const utilList = document.getElementById('utilization-list');
    if (utilList) {
      utilList.innerHTML = providers.slice(0, 4).map(p => {
        const assigned = providerMetricsMap[p.id]?.assigned || 0;
        const utilPct = Math.min(100, Math.round((assigned / GLOBAL_CAPACITY) * 100));
        let status = 'Underutilized';
        let color = 'text-emerald-600';
        if (utilPct >= 80) { status = 'Overloaded'; color = 'text-red-600'; }
        else if (utilPct >= 50) { status = 'Utilized'; color = 'text-blue-600'; }
        
        return `
          <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 card-shadow">
            <div>
              <p class="text-sm font-bold text-slate-800">${p.name}</p>
              <p class="text-xs font-medium text-slate-500">Cap: ${assigned}/${GLOBAL_CAPACITY}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-black text-slate-900">${utilPct}%</p>
              <p class="text-[10px] font-bold ${color} uppercase tracking-wide">${status}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 10. Service Response Metrics
    const metricsGrid = document.getElementById('service-metrics-grid');
    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center flex flex-col justify-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1 leading-tight">Avg Acceptance Time</p>
          <p class="text-lg font-black text-slate-900">14 <span class="text-xs font-medium text-slate-400">mins</span></p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center flex flex-col justify-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1 leading-tight">Avg Resolution Time</p>
          <p class="text-lg font-black text-slate-900">4.2 <span class="text-xs font-medium text-slate-400">hrs</span></p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center flex flex-col justify-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1 leading-tight">Acceptance Rate</p>
          <p class="text-lg font-black text-emerald-600">94%</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center flex flex-col justify-center">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1 leading-tight">Rejection Rate</p>
          <p class="text-lg font-black text-red-500">6%</p>
        </div>
      `;
    }

    // 11. Provider Search & Directory Preview
    const dirList = document.getElementById('directory-list');
    if (dirList) {
      let filtered = providers;
      if (searchQuery) {
        filtered = providers.filter(p => 
          p.name.toLowerCase().includes(searchQuery) ||
          (p.role && p.role.toLowerCase().includes(searchQuery)) ||
          (p.location && p.location.toLowerCase().includes(searchQuery)) ||
          (p.category && p.category.toLowerCase().includes(searchQuery))
        );
      }
      
      const top10 = [...filtered].reverse().slice(0, 10);
      
      if (top10.length === 0) {
        dirList.innerHTML = `<p class="text-center text-sm font-medium text-slate-400 py-4">No providers found.</p>`;
      } else {
        dirList.innerHTML = top10.map(p => `
          <div class="bg-white p-4 rounded-2xl border border-slate-100 card-shadow relative overflow-hidden group">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="font-bold text-slate-900 text-sm mb-0.5">${p.name}</p>
                <p class="text-xs text-slate-500">${p.role || p.category} &bull; ${p.location || 'No Location'}</p>
              </div>
              <span class="px-2 py-0.5 ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} text-[10px] font-bold rounded uppercase tracking-wide">${p.status}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-2">
               <button onclick="alert('View Provider ${p.id}')" class="py-1.5 bg-slate-50 text-slate-600 font-bold text-xs rounded-lg active:bg-slate-100 transition border border-slate-200">View</button>
               <button onclick="alert('Edit Provider ${p.id}')" class="py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg active:bg-blue-100 transition border border-blue-200">Edit</button>
               <a href="10-localpulse-admin-issues-management.html" class="flex items-center justify-center py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg active:bg-emerald-100 transition border border-emerald-200">Assign</a>
            </div>
          </div>
        `).join('');
      }
    }

  }

  // Initial render
  renderDashboard();

});
