document.addEventListener('DOMContentLoaded', () => {
  const issueId = localStorage.getItem('selected_issue_id');
  if (!issueId) {
    Router.navigate('04-localpulse-feed-screen.html');
    return;
  }

  const issues = Storage.getIssues();
  const issue = issues.find(i => i.id === issueId);
  
  if (!issue) {
    Router.navigate('04-localpulse-feed-screen.html');
    return;
  }

  const mainEl = document.querySelector('main');
  const dateStr = new Date(issue.createdAt).toLocaleDateString();

  // Determine timeline progress
  const timelineSteps = [
    { label: 'Issue Created', key: 'Pending', desc: 'Issue reported and waiting for action.' },
    { label: 'Assigned', key: 'Assigned', desc: 'A provider has been assigned.' },
    { label: 'Accepted', key: 'Accepted', desc: 'Provider accepted the task.' },
    { label: 'Work Started', key: 'In Progress', desc: 'Provider is currently working.' },
    { label: 'Resolved', key: 'Resolved', desc: 'Issue has been fixed.' }
  ];

  let currentStepIndex = 0;
  if (issue.status === 'Assigned' || issue.status === 'Reassign Needed') currentStepIndex = 1;
  if (issue.providerResponse === 'Accepted') currentStepIndex = 2;
  if (issue.status === 'In Progress') currentStepIndex = 3;
  if (issue.status === 'Resolved' || issue.status === 'Closed') currentStepIndex = 4;

  let timelineHTML = '';
  timelineSteps.forEach((step, index) => {
    const isCompleted = index <= currentStepIndex;
    const isActive = index === currentStepIndex;
    
    let dotColor = isCompleted ? (isActive ? 'bg-[#16A34A] ring-[#16A34A]/20' : 'bg-[#16A34A]') : 'bg-slate-200';
    let textColor = isCompleted ? 'text-slate-900' : 'text-slate-400';
    let ringClass = isActive ? 'ring-4' : '';

    timelineHTML += `
      <div class="relative flex gap-4 timeline-item">
        <div class="timeline-line"></div>
        <div class="relative z-10 w-4 h-4 mt-1 rounded-full ${dotColor} ${ringClass}"></div>
        <div class="flex-1 -mt-1 mb-6">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-[14px] font-bold ${textColor}">${step.label}</h4>
          </div>
          ${isCompleted ? `<p class="text-[13px] text-slate-500">${step.desc}</p>` : ''}
        </div>
      </div>
    `;
  });

  // Rejection Notice if applicable
  let rejectionNotice = '';
  if (issue.status === 'Reassign Needed') {
    rejectionNotice = `
      <div class="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
        <iconify-icon icon="lucide:alert-circle" class="text-red-500 text-xl mt-0.5"></iconify-icon>
        <div>
          <h4 class="text-sm font-bold text-red-800">Reassignment Required</h4>
          <p class="text-xs text-red-600 mt-1">The assigned provider was unable to accept. We are finding a new provider.</p>
        </div>
      </div>
    `;
  }

  mainEl.innerHTML = `
    <!-- Hero Image -->
    <div class="px-4 pt-4">
      <div class="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-slate-100">
        <img src="${issue.image || 'assets/images/placeholder-issue.jpg'}" alt="Issue Image" class="w-full h-full object-cover">
        <div class="absolute top-4 left-4">
          <span class="bg-[#16A34A] text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
            ${issue.status}
          </span>
        </div>
      </div>
    </div>

    <!-- Issue Title and Category -->
    <div class="px-4 mt-6">
      <div class="flex justify-between items-start mb-3">
        <h2 class="text-[22px] font-bold text-slate-900 flex-1">${issue.title}</h2>
      </div>
      <div class="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
        ${issue.category}
      </div>
      <p class="mt-4 text-[14px] leading-[1.6] text-slate-600">
        ${issue.description || 'No description provided.'}
      </p>
      ${rejectionNotice}
    </div>

    <!-- Metadata Section -->
    <div class="px-4 mt-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A]">
          <iconify-icon icon="lucide:map-pin" class="text-xl"></iconify-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-[12px] text-slate-400 font-medium">Location</span>
          <span class="text-[14px] text-slate-900 font-semibold">${issue.location}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <iconify-icon icon="lucide:calendar" class="text-xl"></iconify-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-[12px] text-slate-400 font-medium">Reported On</span>
          <span class="text-[14px] text-slate-900 font-semibold">${dateStr}</span>
        </div>
      </div>

      ${issue.assignedProviderName ? `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <iconify-icon icon="lucide:hard-hat" class="text-xl"></iconify-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-[12px] text-slate-400 font-medium">Assigned Provider</span>
            <span class="text-[14px] text-slate-900 font-semibold">${issue.assignedProviderName}</span>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Status Updates Timeline -->
    <div class="px-4 mt-8">
      <h3 class="text-[16px] font-bold text-slate-900 mb-6">Workflow Timeline</h3>
      <div class="pl-1">
        ${timelineHTML}
      </div>
    </div>

    <!-- Footer Action -->
    <div class="px-4 mt-10 mb-4">
      <button id="maps-btn" class="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#16A34A] text-[#16A34A] font-bold text-[15px] active:bg-[#16A34A] active:text-white transition-colors">
        <iconify-icon icon="lucide:map" class="text-xl"></iconify-icon>
        Open in Maps
      </button>
    </div>
  `;

  document.getElementById('maps-btn')?.addEventListener('click', () => {
    alert(`Opening maps to ${issue.location}...`);
  });

  document.getElementById('back-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back(); // more robust back
  });
});
