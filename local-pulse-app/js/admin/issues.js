document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const mainContainer = document.querySelector('main');
  const filterButtons = document.querySelectorAll('header .flex.items-center.justify-between button');
  const assignModal = document.getElementById('assign-modal');
  const providerSelect = document.getElementById('provider-select');
  
  let currentFilter = 'All';
  let activeIssueIdToAssign = null;

  function renderTable() {
    const issues = Storage.getIssues();
    
    const filtered = issues.filter(issue => 
      currentFilter === 'All' ? true : issue.status === currentFilter
    );

    // sort descending by date
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    mainContainer.innerHTML = '';

    filtered.forEach(issue => {
      let badgeClass = 'status-badge-pending';
      if (issue.status === 'In Progress') badgeClass = 'status-badge-progress';
      if (issue.status === 'Resolved' || issue.status === 'Closed') badgeClass = 'status-badge-resolved';
      if (issue.status === 'Reassign Needed') badgeClass = 'bg-red-100 text-red-700';
      if (issue.status === 'Assigned' || issue.status === 'Accepted') badgeClass = 'bg-indigo-100 text-indigo-700';
      if (issue.status === 'Verification Pending') badgeClass = 'bg-purple-100 text-purple-700';
      if (issue.status === 'Verified') badgeClass = 'bg-green-100 text-green-700';
      if (issue.status === 'Rejected Verification') badgeClass = 'bg-red-100 text-red-700';

      const dateStr = new Date(issue.createdAt).toLocaleDateString();

      // Assignment UI logic
      let assignmentUI = '';
      if (issue.assignedProviderId) {
        let responseColor = 'text-amber-500';
        if(issue.providerResponse === 'Accepted' || issue.providerResponse === 'Completed') responseColor = 'text-emerald-500';
        if(issue.providerResponse === 'Rejected') responseColor = 'text-red-500';

        assignmentUI = `
          <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assignment Information</h4>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-semibold text-slate-800">${issue.assignedProviderName}</span>
              <span class="text-[10px] font-bold ${responseColor}">${issue.providerResponse}</span>
            </div>
            ${issue.rejectionReason ? `<p class="text-[10px] font-medium text-red-500 mt-1">Reason: ${issue.rejectionReason}</p>` : ''}
            <p class="text-[10px] text-slate-500 mt-1">Assigned: ${new Date(issue.assignedAt).toLocaleDateString()}</p>
          </div>
        `;
      }

      let actionButton = '';
      if (!issue.assignedProviderId || issue.status === 'Reassign Needed') {
        actionButton = `
          <button class="mt-3 w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm active:bg-slate-700 transition-colors btn-assign" data-id="${issue.id}">
            ${issue.status === 'Reassign Needed' ? 'Reassign Provider' : 'Assign Provider'}
          </button>
        `;
      } else if (issue.status === 'Verification Pending' || issue.status === 'Resolved' || issue.status === 'Verified' || issue.status === 'Rejected Verification' || issue.status === 'In Progress') {
        // Expose verify button for all active assigned tasks after assignment (but typically mostly used in Verification Pending)
        // If it's already verified/resolved, it can just act as a review button.
        actionButton = `
          <a href="20-localpulse-issue-verification.html?id=${issue.id}" class="mt-3 w-full py-2 bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg shadow-sm active:bg-purple-200 transition-colors">
            <iconify-icon icon="lucide:shield-check" class="text-sm"></iconify-icon>
            Verify Issue
          </a>
        `;
      }

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-4 custom-shadow border border-slate-50';
      
      card.innerHTML = `
        <div class="flex justify-between items-start cursor-pointer card-clickable" data-id="${issue.id}">
          <div class="space-y-1 flex-1 pr-2">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 shrink-0">
                <iconify-icon icon="lucide:circle-dot" class="text-slate-800"></iconify-icon>
              </div>
              <h3 class="text-[15px] font-bold text-slate-800">${issue.title}</h3>
            </div>
            <div class="flex items-center gap-1.5 pl-6">
              <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xs shrink-0"></iconify-icon>
              <span class="text-xs text-slate-500 truncate">${issue.location}</span>
            </div>
            <div class="flex items-center gap-1.5 pl-6 mt-1">
              <iconify-icon icon="lucide:tag" class="text-slate-400 text-xs shrink-0"></iconify-icon>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${issue.category}</span>
            </div>
            <p class="text-[11px] text-slate-400 pl-6 mt-1">${dateStr}</p>
          </div>
          <span class="flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-bold ${badgeClass}">
            ${issue.status}
          </span>
        </div>
        ${assignmentUI}
        ${actionButton}
      `;

      mainContainer.appendChild(card);
    });

    if (filtered.length === 0) {
      mainContainer.innerHTML = '<div class="text-center text-slate-400 mt-10 text-sm font-medium">No issues found for this filter.</div>';
    }

    // Attach Listeners
    document.querySelectorAll('.card-clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        localStorage.setItem('selected_issue_id', e.currentTarget.dataset.id);
        Router.navigate('06-localpulse-issue-details-screen.html');
      });
    });

    document.querySelectorAll('.btn-assign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeIssueIdToAssign = e.currentTarget.dataset.id;
        populateProviderDropdown();
        assignModal.classList.remove('hidden');
        assignModal.classList.add('flex');
      });
    });
  }

  function populateProviderDropdown() {
    const providers = Storage.getProviders().filter(p => p.status === 'Active');
    providerSelect.innerHTML = '';
    providers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.category}) - ${p.location}`;
      providerSelect.appendChild(opt);
    });
  }

  // --- SMART MATCHING ENGINE ---
  function autoAssignProvider(issue) {
    const providers = Storage.getProviders();
    const categoryMapping = {
      'Electricity': 'Electrician',
      'Water Issue': 'Plumber',
      'Garbage': 'Cleaning',
      'Road Issue': 'Mechanic',
      'Safety': 'Mechanic'
    };
    const mappedCategory = categoryMapping[issue.category] || 'Electrician';
    const locName = issue.location.split(',')[0].trim();

    let bestScore = -1;
    let bestProviderId = null;

    providers.forEach(p => {
      let score = 0;
      if (p.status === 'Active') score += 10;
      if (p.category === mappedCategory) score += 50;
      if (p.coverageArea && p.coverageArea.includes(locName)) score += 30;
      
      // Workload optimization (fewer assigned = higher score)
      const workloadScore = Math.max(0, 10 - (p.assignedIssues || 0));
      score += workloadScore;

      if (score > bestScore) {
        bestScore = score;
        bestProviderId = p.id;
      }
    });

    if (bestProviderId && bestScore >= 60) { // Needs at least Category + Active
      Storage.reassignProvider(issue.id, bestProviderId);
      alert('Smart Assign Successful! Assigned based on Category, Location & Workload.');
    } else {
      alert('Smart Assign Failed. No suitable provider found for this issue.');
    }
  }

  document.getElementById('auto-assign-btn')?.addEventListener('click', () => {
    if (activeIssueIdToAssign) {
      const issue = Storage.getIssues().find(i => i.id === activeIssueIdToAssign);
      if (issue) {
        autoAssignProvider(issue);
        assignModal.classList.add('hidden');
        assignModal.classList.remove('flex');
        renderTable();
      }
    }
  });

  document.getElementById('confirm-assign-btn')?.addEventListener('click', () => {
    if (activeIssueIdToAssign && providerSelect.value) {
      Storage.reassignProvider(activeIssueIdToAssign, providerSelect.value);
      assignModal.classList.add('hidden');
      assignModal.classList.remove('flex');
      renderTable();
    }
  });

  document.getElementById('close-assign')?.addEventListener('click', () => {
    assignModal.classList.add('hidden');
    assignModal.classList.remove('flex');
  });

  // Filter Tabs
  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('active-tab', 'font-bold');
          b.classList.add('font-semibold', 'text-slate-400');
        });
        btn.classList.add('active-tab', 'font-bold');
        btn.classList.remove('font-semibold', 'text-slate-400');
        
        currentFilter = btn.textContent.trim();
        renderTable();
      });
    });
  }

  // Handle back button
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      Router.navigate('08-localpulse-admin-dashboard.html');
    });
  }

  renderTable();
});
