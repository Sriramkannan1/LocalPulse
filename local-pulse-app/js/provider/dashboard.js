document.addEventListener('DOMContentLoaded', () => {
  const user = Storage.getCurrentUser();
  if (!user || user.role !== 'provider') {
    window.location.href = '03-localpulse-mobile-login-screen.html';
    return;
  }

  const tasksList = document.getElementById('tasks-list');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const rejectModal = document.getElementById('reject-modal');
  const toastContainer = document.getElementById('toast-container');
  
  let currentFilter = 'All';
  let activeIssueIdToReject = null;

  function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 -translate-x-1/2 ${isError ? 'bg-red-600' : 'bg-slate-900'} text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm z-[200] animate-in slide-in-from-top-4 fade-in duration-300`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function renderTasks() {
    const allTasks = Storage.getProviderTasks(user.id);
    
    // Calculate Metrics
    const metrics = Storage.getProviderMetrics(user.id);
    document.getElementById('metric-assigned').textContent = metrics.assigned;
    document.getElementById('metric-accepted').textContent = allTasks.filter(t => t.providerResponse === 'Accepted' || t.providerResponse === 'Completed').length;
    document.getElementById('metric-inprogress').textContent = allTasks.filter(t => t.status === 'In Progress').length;
    document.getElementById('metric-completed').textContent = metrics.resolved;
    document.getElementById('metric-rejected').textContent = metrics.rejected;

    // Apply Filter
    let filtered = allTasks;
    if (currentFilter === 'Pending') {
      filtered = allTasks.filter(t => t.providerResponse === 'Pending' || !t.providerResponse);
    } else if (currentFilter === 'Active') {
      filtered = allTasks.filter(t => t.status === 'Accepted' || t.status === 'In Progress');
    }

    tasksList.innerHTML = '';

    if (filtered.length === 0) {
      tasksList.innerHTML = `
        <div class="text-center text-slate-400 mt-10 p-6 bg-white rounded-2xl border border-slate-100">
          <iconify-icon icon="lucide:check-circle-2" class="text-4xl mb-2 text-emerald-300"></iconify-icon>
          <p class="text-sm font-medium text-slate-500">No tasks found for this view.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(task => {
      const isPending = task.providerResponse === 'Pending' || !task.providerResponse;
      const isAccepted = task.providerResponse === 'Accepted' && task.status !== 'In Progress' && task.status !== 'Resolved';
      const isInProgress = task.status === 'In Progress';
      const isCompleted = task.providerResponse === 'Completed' || task.status === 'Resolved';
      const isRejected = task.providerResponse === 'Rejected';

      let statusBadge = '';
      if (isPending) statusBadge = '<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wide">Awaiting Response</span>';
      else if (isRejected) statusBadge = '<span class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wide">Rejected</span>';
      else if (isCompleted) statusBadge = '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide">Completed</span>';
      else if (isInProgress) statusBadge = '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wide">In Progress</span>';
      else if (isAccepted) statusBadge = '<span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide">Accepted</span>';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-5 border border-slate-100 card-shadow';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-bold text-slate-900">${task.title}</h3>
            </div>
            ${statusBadge}
          </div>
          <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">${task.category}</span>
        </div>
        
        <div class="text-xs text-slate-600 space-y-1.5 mb-4 bg-slate-50 p-3 rounded-xl">
          <div class="flex items-center gap-2">
            <iconify-icon icon="lucide:map-pin" class="text-slate-400"></iconify-icon>
            <span class="font-medium">${task.location}</span>
          </div>
          <div class="flex items-center gap-2">
            <iconify-icon icon="lucide:calendar" class="text-slate-400"></iconify-icon>
            <span class="font-medium">Assigned: ${new Date(task.assignedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="flex gap-2" id="action-btns-${task.id}">
          ${isPending ? `
            <button class="flex-1 py-2.5 bg-[#16A34A] text-white font-bold text-sm rounded-xl active:bg-green-700 transition-colors btn-accept" data-id="${task.id}">Accept</button>
            <button class="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl active:bg-slate-200 transition-colors btn-reject-modal" data-id="${task.id}">Reject</button>
          ` : ''}
          ${isAccepted ? `
            <button class="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl active:bg-blue-700 transition-colors btn-start" data-id="${task.id}">Start Work</button>
          ` : ''}
          ${isInProgress ? `
            <button class="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl active:bg-emerald-700 transition-colors btn-complete" data-id="${task.id}">Mark Complete</button>
          ` : ''}
          ${isCompleted ? `
            <button class="w-full py-2 bg-slate-50 text-slate-400 font-bold text-sm rounded-xl" disabled>Task Resolved</button>
          ` : ''}
          ${isRejected ? `
            <button class="w-full py-2 bg-red-50 text-red-400 font-bold text-sm rounded-xl" disabled>Task Rejected</button>
          ` : ''}
        </div>
      `;
      tasksList.appendChild(card);
    });

    attachCardListeners();
  }

  function attachCardListeners() {
    // Accept Task
    document.querySelectorAll('.btn-accept').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const task = Storage.getIssues().find(i => i.id === id);
        if (task) {
          task.providerResponse = 'Accepted';
          task.status = 'Accepted';
          Storage.updateIssue(task);
          showToast('Task Accepted Successfully');
          renderTasks();
        }
      });
    });

    // Start Work
    document.querySelectorAll('.btn-start').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const task = Storage.getIssues().find(i => i.id === id);
        if (task) {
          task.status = 'In Progress';
          Storage.updateIssue(task);
          showToast('Work Started! Be safe.');
          renderTasks();
        }
      });
    });

    // Mark Complete
    document.querySelectorAll('.btn-complete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const task = Storage.getIssues().find(i => i.id === id);
        if (task) {
          task.status = 'Resolved';
          task.providerResponse = 'Completed';
          Storage.updateIssue(task);
          showToast('Task Resolved! Great job.');
          renderTasks();
        }
      });
    });

    // Open Reject Modal
    document.querySelectorAll('.btn-reject-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeIssueIdToReject = e.currentTarget.dataset.id;
        rejectModal.classList.remove('hidden');
        rejectModal.classList.add('flex');
      });
    });
  }

  // Reject Modal Logic
  document.querySelectorAll('.close-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      rejectModal.classList.add('hidden');
      rejectModal.classList.remove('flex');
      activeIssueIdToReject = null;
    });
  });

  document.querySelectorAll('.reason-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reason = e.currentTarget.dataset.reason;
      if (activeIssueIdToReject) {
        const task = Storage.getIssues().find(i => i.id === activeIssueIdToReject);
        if (task) {
          task.providerResponse = 'Rejected';
          task.rejectionReason = reason;
          task.status = 'Reassign Needed'; // Crucial workflow rule
          Storage.updateIssue(task);
          showToast('Task Rejected', true);
        }
      }
      rejectModal.classList.add('hidden');
      rejectModal.classList.remove('flex');
      activeIssueIdToReject = null;
      renderTasks();
    });
  });

  // Filter UI
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-slate-800', 'text-white', 'border-slate-800');
        b.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
      });
      const target = e.currentTarget;
      target.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
      target.classList.add('bg-slate-800', 'text-white', 'border-slate-800');
      currentFilter = target.dataset.filter;
      renderTasks();
    });
  });

  // Init
  renderTasks();
});
