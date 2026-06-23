document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  // Extract ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const issueId = urlParams.get('id');

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.location.href = '10-localpulse-admin-issues-management.html';
    });
  }

  if (!issueId) {
    alert('Invalid Issue ID');
    window.location.href = '10-localpulse-admin-issues-management.html';
    return;
  }

  const issues = Storage.getIssues();
  const issue = issues.find(i => i.id === issueId);

  if (!issue) {
    alert('Issue not found');
    window.location.href = '10-localpulse-admin-issues-management.html';
    return;
  }

  const providers = Storage.getProviders();
  const provider = providers.find(p => p.id === issue.assignedProviderId) || null;

  // --- Populate UI ---
  document.getElementById('header-issue-id').textContent = `ID: ${issue.id}`;
  
  // Section 1: Issue Info
  document.getElementById('verif-title').textContent = issue.title;
  document.getElementById('verif-location').textContent = issue.location;
  document.getElementById('verif-desc').textContent = issue.description || 'No description provided.';
  document.getElementById('verif-category').textContent = issue.category;
  document.getElementById('verif-priority').textContent = 'High'; // Mocking priority as it's not stored
  document.getElementById('verif-citizen').textContent = 'Citizen User'; // Mock citizen name
  
  const createdDate = new Date(issue.createdAt);
  document.getElementById('verif-date').textContent = createdDate.toLocaleString();
  
  const statusEl = document.getElementById('verif-status');
  statusEl.textContent = issue.status;
  if (issue.status === 'Verification Pending') {
    statusEl.className = 'px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-lg';
  } else if (issue.status === 'Resolved' || issue.status === 'Verified') {
    statusEl.className = 'px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-lg';
  } else if (issue.status === 'Rejected Verification') {
    statusEl.className = 'px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-lg';
  } else {
    statusEl.className = 'px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-lg';
  }

  // Section 2: Provider Info
  if (provider) {
    document.getElementById('verif-provider-initial').textContent = provider.name.charAt(0);
    document.getElementById('verif-provider-name').textContent = provider.name;
    document.getElementById('verif-provider-role').textContent = provider.category;
    
    // Mock Timestamps based on assignedAt
    const assignedDate = new Date(issue.assignedAt || Date.now());
    
    const acceptedDate = new Date(assignedDate.getTime() + 15 * 60000); // 15 mins later
    const startedDate = new Date(acceptedDate.getTime() + 45 * 60000); // 45 mins later
    const completedDate = new Date(startedDate.getTime() + 120 * 60000); // 2 hours later
    
    document.getElementById('verif-ts-assign').textContent = assignedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (issue.providerResponse !== 'Pending') {
      document.getElementById('verif-ts-accept').textContent = acceptedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    if (issue.status === 'In Progress' || issue.status === 'Verification Pending' || issue.status === 'Resolved') {
       document.getElementById('verif-ts-start').textContent = startedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    if (issue.status === 'Verification Pending' || issue.status === 'Resolved') {
       document.getElementById('verif-ts-complete').textContent = completedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

  } else {
    document.getElementById('verif-provider-name').textContent = 'Unassigned';
    document.getElementById('verif-provider-role').textContent = '-';
  }

  // Section 3: Timeline
  const timelineStages = [
    'Reported', 'Assigned', 'Accepted', 'En Route', 'Started', 'Completed', 'Verification Pending', 'Resolved'
  ];
  
  let currentStageIndex = 0;
  if (issue.status === 'Pending') currentStageIndex = 0;
  if (issue.status === 'Assigned') currentStageIndex = 1;
  if (issue.providerResponse === 'Accepted') currentStageIndex = 2;
  if (issue.status === 'In Progress') currentStageIndex = 4; // Mock skipping En Route
  if (issue.status === 'Verification Pending') currentStageIndex = 6;
  if (issue.status === 'Resolved' || issue.status === 'Closed') currentStageIndex = 7;

  const timelineContainer = document.getElementById('timeline-container');
  let timelineHTML = '';
  
  timelineStages.forEach((stage, index) => {
    let nodeClass = 'node-pending';
    let lineClass = 'line-pending';
    let textClass = 'text-slate-400 font-medium';
    
    if (index < currentStageIndex) {
      nodeClass = 'node-done';
      lineClass = 'line-done';
      textClass = 'text-slate-700 font-bold';
    } else if (index === currentStageIndex) {
      nodeClass = 'node-current';
      textClass = 'text-purple-700 font-black';
    }

    timelineHTML += `
      <div class="relative flex items-center gap-4 timeline-item h-10">
        <div class="relative w-6 h-6 flex items-center justify-center shrink-0">
          <div class="absolute w-full h-full rounded-full ${nodeClass === 'node-current' ? 'bg-purple-100' : ''}"></div>
          <div class="${nodeClass} w-3 h-3 rounded-full z-10"></div>
          <div class="timeline-line ${lineClass}"></div>
        </div>
        <span class="text-sm ${textClass}">${stage}</span>
      </div>
    `;
  });
  timelineContainer.innerHTML = timelineHTML;

  // Section 4: Proof Of Work
  const proofContainer = document.getElementById('proof-container');
  if (issue.status === 'Verification Pending' || issue.status === 'Resolved') {
    proofContainer.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-100 rounded-xl h-32 flex flex-col items-center justify-center border border-slate-200">
          <iconify-icon icon="lucide:image" class="text-2xl text-slate-400 mb-1"></iconify-icon>
          <span class="text-[10px] font-bold text-slate-500 uppercase">Before</span>
        </div>
        <div class="bg-slate-100 rounded-xl h-32 flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden">
           <img src="https://images.unsplash.com/photo-1584820927498-cafe8c108157?w=300&q=80" class="absolute inset-0 w-full h-full object-cover opacity-60" alt="mock after">
           <span class="text-[10px] font-bold text-white uppercase bg-black/50 px-2 py-0.5 rounded absolute bottom-2 right-2">After</span>
        </div>
      </div>
    `;
    document.getElementById('verif-provider-notes').textContent = "Replaced the damaged component. Tested functionality and confirmed operational.";
  } else {
    proofContainer.innerHTML = `<p class="text-sm font-medium text-slate-500 italic">No proof uploaded yet.</p>`;
  }

  // --- Actions ---
  const btnApprove = document.getElementById('btn-approve');
  const btnReject = document.getElementById('btn-reject');
  const btnMonitor = document.getElementById('btn-monitor');
  const rejectModal = document.getElementById('reject-modal');

  // Disable buttons if already resolved
  if (issue.status === 'Resolved' || issue.status === 'Closed') {
    btnApprove.disabled = true;
    btnReject.disabled = true;
    btnMonitor.disabled = true;
    btnApprove.classList.add('opacity-50', 'cursor-not-allowed');
    btnReject.classList.add('opacity-50', 'cursor-not-allowed');
    btnMonitor.classList.add('opacity-50', 'cursor-not-allowed');
  }

  btnApprove?.addEventListener('click', () => {
    if (confirm('Are you sure you want to approve this resolution and close the issue?')) {
      issue.status = 'Resolved';
      issue.providerResponse = 'Completed';
      
      // Update Issue
      Storage.updateIssue(issue);

      // Generate System Notification
      Storage.saveNotification({
        type: 'system',
        title: 'Issue Verified',
        message: `Issue #${issue.id} has been verified and resolved by Admin.`
      });
      
      // Notify Citizen (Mock push to system notifications)
      Storage.saveNotification({
        type: 'issue',
        title: 'Issue Resolved Successfully',
        message: `Your issue "${issue.title}" has been successfully resolved.`
      });

      alert('Resolution Approved. Issue is now closed.');
      window.location.reload();
    }
  });

  btnMonitor?.addEventListener('click', () => {
    issue.status = 'Verification Pending';
    Storage.updateIssue(issue);
    
    Storage.saveNotification({
      type: 'system',
      title: 'Issue Monitoring Continued',
      message: `Admin is continuing to monitor Issue #${issue.id}.`
    });
    
    alert('Status updated to Verification Pending. Continuing monitoring.');
    window.location.reload();
  });

  // Reject Modal Logic
  btnReject?.addEventListener('click', () => {
    rejectModal.classList.remove('hidden');
    rejectModal.classList.add('flex');
  });

  document.getElementById('btn-cancel-reject')?.addEventListener('click', () => {
    rejectModal.classList.add('hidden');
    rejectModal.classList.remove('flex');
  });

  document.getElementById('btn-confirm-reject')?.addEventListener('click', () => {
    const reason = document.getElementById('reject-reason-select').value;
    const notes = document.getElementById('reject-reason-text').value;
    
    if (!reason) {
      alert('Please select a rejection reason.');
      return;
    }

    // Process Rejection
    issue.status = 'In Progress'; // Revert
    issue.verificationStatus = 'Rejected Verification';
    
    Storage.updateIssue(issue);

    Storage.saveNotification({
      type: 'system',
      title: 'Issue Verification Rejected',
      message: `Issue #${issue.id} rejected: ${reason}. Reverted to In Progress.`
    });

    alert('Verification rejected. Provider will be notified to resume work.');
    window.location.reload();
  });

});
