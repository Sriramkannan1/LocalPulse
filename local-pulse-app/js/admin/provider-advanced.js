document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const providersList = document.getElementById('providers-list');
  const searchInput = document.getElementById('search-input');
  const catBtns = document.querySelectorAll('.cat-btn');
  const locationFilter = document.getElementById('location-filter');
  
  // Metric elements
  const metricTotal = document.getElementById('metric-total');
  const metricActive = document.getElementById('metric-active');
  const metricInactive = document.getElementById('metric-inactive');
  const metricAssigned = document.getElementById('metric-assigned');

  // State
  let currentCategory = 'All';
  let currentLocation = 'All';
  let searchQuery = '';
  let providerToDelete = null;

  function updateMetrics(providers) {
    metricTotal.textContent = providers.length;
    metricActive.textContent = providers.filter(p => p.status === 'Active').length;
    metricInactive.textContent = providers.filter(p => p.status !== 'Active').length;
    metricAssigned.textContent = providers.reduce((sum, p) => sum + (p.assignedIssues || 0), 0);
  }

  function renderProviders() {
    let providers = Storage.getProviders();
    updateMetrics(providers);

    // Apply Filters
    if (currentCategory !== 'All') {
      providers = providers.filter(p => p.category === currentCategory);
    }
    if (currentLocation !== 'All') {
      providers = providers.filter(p => p.coverageArea && p.coverageArea.includes(currentLocation));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      providers = providers.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.role && p.role.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    providersList.innerHTML = '';

    if (providers.length === 0) {
      providersList.innerHTML = `
        <div class="text-center text-slate-400 mt-10 p-6 bg-white rounded-2xl border border-slate-100">
          <iconify-icon icon="lucide:search-x" class="text-4xl mb-2 text-slate-300"></iconify-icon>
          <p class="text-sm font-medium text-slate-500">No providers match your filters</p>
        </div>
      `;
      return;
    }

    providers.forEach(p => {
      let statusBadge = '';
      if (p.status === 'Active') statusBadge = '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide">Active</span>';
      else if (p.status === 'Inactive') statusBadge = '<span class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wide">Inactive</span>';
      else statusBadge = '<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wide">On Leave</span>';

      const coverageStr = p.coverageArea ? p.coverageArea.join(', ') : 'None';

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-5 border border-slate-100 card-shadow relative overflow-hidden group';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-bold text-slate-900">${p.name}</h3>
              ${statusBadge}
            </div>
            <p class="text-xs font-semibold text-blue-600 mb-1">${p.role || 'Service Provider'} &bull; ${p.category}</p>
          </div>
          <div class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
             <button class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition edit-btn" data-id="${p.id}">
               <iconify-icon icon="lucide:edit-2"></iconify-icon>
             </button>
             <button class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition delete-btn" data-id="${p.id}" data-name="${p.name}">
               <iconify-icon icon="lucide:trash-2"></iconify-icon>
             </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
          <div class="flex items-start gap-1.5">
            <iconify-icon icon="lucide:map-pin" class="text-slate-400 mt-0.5 shrink-0"></iconify-icon>
            <div>
              <p class="font-semibold text-slate-800">Primary</p>
              <p class="truncate">${p.location || 'Unknown'}</p>
            </div>
          </div>
          <div class="flex items-start gap-1.5">
            <iconify-icon icon="lucide:map" class="text-slate-400 mt-0.5 shrink-0"></iconify-icon>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800">Coverage (${p.coverageArea ? p.coverageArea.length : 0})</p>
              <p class="truncate" title="${coverageStr}">${coverageStr}</p>
            </div>
          </div>
          <div class="flex items-start gap-1.5 mt-1">
            <iconify-icon icon="lucide:phone" class="text-emerald-500 mt-0.5 shrink-0"></iconify-icon>
            <div>
              <p class="font-semibold text-slate-800">Phone</p>
              <p>${p.phone || 'N/A'}</p>
            </div>
          </div>
          <div class="flex items-start gap-1.5 mt-1">
            <iconify-icon icon="lucide:briefcase" class="text-blue-500 mt-0.5 shrink-0"></iconify-icon>
            <div>
              <p class="font-semibold text-slate-800">Assigned</p>
              <p>${p.assignedIssues || 0} Issues</p>
            </div>
          </div>
        </div>

        <button class="w-full py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl active:bg-slate-50 transition-colors view-assignments-btn" data-id="${p.id}">
          View Assignments
        </button>
      `;
      providersList.appendChild(card);
    });

    // Attach listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        providerToDelete = e.currentTarget.dataset.id;
        document.getElementById('delete-provider-name').textContent = e.currentTarget.dataset.name;
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
      });
    });

    document.querySelectorAll('.view-assignments-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        alert('Assignment Viewer: Will list specific issues assigned to this provider in V2/Firebase.');
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        openFormModal(e.currentTarget.dataset.id);
      });
    });
  }

  // Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProviders();
    });
  }

  if (locationFilter) {
    locationFilter.addEventListener('change', (e) => {
      currentLocation = e.target.value;
      renderProviders();
    });
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      catBtns.forEach(b => {
        b.classList.remove('bg-slate-800', 'text-white', 'border-slate-800');
        b.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
      });
      const target = e.currentTarget;
      target.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
      target.classList.add('bg-slate-800', 'text-white', 'border-slate-800');
      currentCategory = target.dataset.cat;
      renderProviders();
    });
  });

  // Delete Handlers
  document.getElementById('cancel-delete-btn')?.addEventListener('click', () => {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
    providerToDelete = null;
  });

  document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
    if (providerToDelete) {
      Storage.deleteProvider(providerToDelete);
      providerToDelete = null;
      document.getElementById('delete-modal').classList.add('hidden');
      document.getElementById('delete-modal').classList.remove('flex');
      renderProviders();
    }
  });

  // --- Form Modal Logic ---
  const formModal = document.getElementById('provider-form-modal');
  const providerForm = document.getElementById('provider-form');
  const closeFormBtn = document.getElementById('close-form-btn');
  const formTitle = document.getElementById('form-modal-title');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.remove('-translate-y-20', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('-translate-y-20', 'opacity-0');
    }, 3000);
  }

  function openFormModal(providerId = null) {
    if (!formModal) return;
    formTitle.textContent = providerId ? 'Edit Provider' : 'Add Provider';
    providerForm.reset();
    document.getElementById('provider-id').value = '';

    if (providerId) {
      const providers = Storage.getProviders();
      const p = providers.find(x => x.id === providerId);
      if (p) {
        document.getElementById('provider-id').value = p.id;
        document.getElementById('provider-name').value = p.name || '';
        document.getElementById('provider-phone').value = p.phone || '';
        document.getElementById('provider-email').value = p.email || '';
        document.getElementById('provider-role').value = p.role || 'Field Technician';
        document.getElementById('provider-category').value = p.category || 'Electrician';
        document.getElementById('provider-location').value = p.location || 'Peelamedu';
        document.getElementById('provider-coverage').value = (p.coverageArea || []).join(', ');
        document.getElementById('provider-status').value = p.status || 'Active';
      }
    } else {
      document.getElementById('provider-status').value = 'Pending Approval';
    }
    
    formModal.classList.remove('hidden');
    formModal.classList.add('flex');
    setTimeout(() => {
      document.getElementById('provider-modal-content').classList.remove('translate-y-full');
    }, 10);
  }

  function closeFormModal() {
    if (!formModal) return;
    document.getElementById('provider-modal-content').classList.add('translate-y-full');
    setTimeout(() => {
      formModal.classList.add('hidden');
      formModal.classList.remove('flex');
    }, 300);
  }

  closeFormBtn?.addEventListener('click', closeFormModal);

  providerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('provider-id').value;
    const coverageVal = document.getElementById('provider-coverage').value;
    const coverageArea = coverageVal ? coverageVal.split(',').map(s => s.trim()).filter(s => s) : [];

    const providerData = {
      name: document.getElementById('provider-name').value,
      phone: document.getElementById('provider-phone').value,
      email: document.getElementById('provider-email').value,
      role: document.getElementById('provider-role').value,
      category: document.getElementById('provider-category').value,
      location: document.getElementById('provider-location').value,
      coverageArea: coverageArea,
      status: document.getElementById('provider-status').value,
      rating: 5.0, // Default rating
      assignedIssues: 0
    };

    if (id) {
      providerData.id = id;
      // Preserve existing rating and assignments
      const existing = Storage.getProviders().find(p => p.id === id);
      if (existing) {
        providerData.rating = existing.rating || 5.0;
        providerData.assignedIssues = existing.assignedIssues || 0;
      }
      Storage.updateProvider(providerData);
      showToast('Provider Updated Successfully');
    } else {
      Storage.saveProvider(providerData);
      showToast('Provider Added Successfully');
    }

    closeFormModal();
    renderProviders();
  });

  document.getElementById('add-provider-btn')?.addEventListener('click', () => {
    openFormModal();
  });

  // Init
  renderProviders();
});
