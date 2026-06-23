document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardUserRoute()) return;

  const user = Storage.getCurrentUser();
  const reportsList = document.getElementById('reports-list');
  
  function renderReports() {
    const allIssues = Storage.getIssues();
    const myIssues = allIssues.filter(i => i.authorId === user.id);
    
    // sort descending by date
    myIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reportsList.innerHTML = '';

    if (myIssues.length === 0) {
      reportsList.innerHTML = `
        <div class="text-center text-slate-400 mt-10 p-6 bg-white rounded-2xl border border-slate-100">
          <iconify-icon icon="lucide:file-question" class="text-4xl mb-2 text-slate-300"></iconify-icon>
          <p class="text-sm font-medium text-slate-500">You haven't reported any issues yet.</p>
        </div>
      `;
      return;
    }

    myIssues.forEach(issue => {
      let badgeClass = 'bg-[#F59E0B]/10 text-[#F59E0B]';
      if (issue.status === 'In Progress') badgeClass = 'bg-[#3B82F6]/10 text-[#3B82F6]';
      if (issue.status === 'Resolved' || issue.status === 'Closed') badgeClass = 'bg-[#10B981]/10 text-[#10B981]';
      if (issue.status === 'Reassign Needed') badgeClass = 'bg-red-100 text-red-600';
      if (issue.status === 'Assigned' || issue.status === 'Accepted') badgeClass = 'bg-indigo-100 text-indigo-700';

      const dateStr = new Date(issue.createdAt).toLocaleDateString();

      // Provider assignment UI for Citizen
      let providerUI = '';
      if (issue.assignedProviderName) {
        let responseColor = 'text-amber-500';
        if (issue.providerResponse === 'Accepted' || issue.providerResponse === 'Completed') responseColor = 'text-emerald-500';
        if (issue.providerResponse === 'Rejected') responseColor = 'text-red-500';
        
        providerUI = `
          <div class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Provider</h4>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-800">${issue.assignedProviderName}</span>
              <span class="text-[10px] font-bold ${responseColor} bg-white px-2 py-0.5 rounded-full shadow-sm">${issue.providerResponse || 'Pending'}</span>
            </div>
          </div>
        `;
      }

      const card = document.createElement('div');
      card.className = 'report-card bg-white rounded-[20px] p-5 border border-slate-50 cursor-pointer active:scale-[0.98] transition-transform';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-[16px] font-bold text-slate-900 flex-1 leading-tight">${issue.title}</h3>
          <span class="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full tracking-wide">${issue.category}</span>
        </div>
        
        <div class="flex items-center gap-2 text-slate-500 mb-4">
          <iconify-icon icon="lucide:map-pin" class="text-[#16A34A]"></iconify-icon>
          <span class="text-[14px] font-medium">${issue.location}</span>
        </div>

        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2 text-slate-400">
            <iconify-icon icon="lucide:clock" class="text-[14px]"></iconify-icon>
            <span class="text-[13px] font-medium">${dateStr}</span>
          </div>
          <div class="px-4 py-1.5 ${badgeClass} rounded-lg">
            <span class="text-[13px] font-bold uppercase tracking-wide">${issue.status}</span>
          </div>
        </div>
        ${providerUI}
      `;

      card.addEventListener('click', () => {
        localStorage.setItem('selected_issue_id', issue.id);
        Router.navigate('06-localpulse-issue-details-screen.html');
      });

      reportsList.appendChild(card);
    });
  }

  // Handle back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      Router.navigate('04-localpulse-feed-screen.html');
    });
  }

  renderReports();
});
