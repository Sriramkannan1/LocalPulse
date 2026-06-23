document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const providersList = document.getElementById('providers-list');
  const btnAddProvider = document.getElementById('btn-add-provider');
  
  const modalHTML = `
    <div id="provider-modal" class="fixed inset-0 bg-slate-900/50 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 id="provider-modal-title" class="text-lg font-bold text-slate-900 mb-4">Add Provider</h3>
        <input type="hidden" id="provider-id">
        <input type="text" id="provider-name" placeholder="Provider Name" class="w-full p-3 mb-3 border border-slate-200 rounded-xl text-sm focus:border-green-500 outline-none">
        <select id="provider-category" class="w-full p-3 mb-3 border border-slate-200 rounded-xl text-sm focus:border-green-500 outline-none">
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Mechanic">Mechanic</option>
        </select>
        <input type="text" id="provider-phone" placeholder="Phone Number" class="w-full p-3 mb-3 border border-slate-200 rounded-xl text-sm focus:border-green-500 outline-none">
        <textarea id="provider-desc" placeholder="Description" class="w-full p-3 mb-6 border border-slate-200 rounded-xl text-sm h-24 focus:border-green-500 outline-none"></textarea>
        
        <div class="flex justify-end gap-3">
          <button id="btn-cancel-provider" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
          <button id="btn-save-provider" class="px-5 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('provider-modal');
  const idInput = document.getElementById('provider-id');
  const nameInput = document.getElementById('provider-name');
  const categorySelect = document.getElementById('provider-category');
  const phoneInput = document.getElementById('provider-phone');
  const descInput = document.getElementById('provider-desc');

  function openModal(provider = null) {
    if (provider) {
      document.getElementById('provider-modal-title').textContent = 'Edit Provider';
      idInput.value = provider.id;
      nameInput.value = provider.name;
      categorySelect.value = provider.category;
      phoneInput.value = provider.phone;
      descInput.value = provider.description;
    } else {
      document.getElementById('provider-modal-title').textContent = 'Add Provider';
      idInput.value = '';
      nameInput.value = '';
      categorySelect.value = 'Electrician';
      phoneInput.value = '';
      descInput.value = '';
    }
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  document.getElementById('btn-cancel-provider').addEventListener('click', closeModal);

  document.getElementById('btn-save-provider').addEventListener('click', () => {
    if (!nameInput.value || !phoneInput.value) {
      return alert('Name and Phone are required');
    }

    const data = {
      id: idInput.value || undefined,
      name: nameInput.value,
      category: categorySelect.value,
      phone: phoneInput.value,
      description: descInput.value,
      rating: idInput.value ? undefined : '5.0' // Mock rating for new
    };

    if (data.id) {
      const existing = Storage.getProviders().find(p => p.id === data.id);
      data.rating = existing.rating;
      Storage.updateProvider(data);
    } else {
      Storage.saveProvider(data);
    }

    closeModal();
    renderProviders();
  });

  if (btnAddProvider) {
    btnAddProvider.addEventListener('click', () => openModal());
  }

  function renderProviders() {
    if (!providersList) return;
    const providers = Storage.getProviders();
    providersList.innerHTML = '';

    providers.forEach(provider => {
      const el = document.createElement('div');
      el.className = 'bg-white p-4 rounded-2xl mb-4 border border-slate-100 flex flex-col shadow-sm';
      el.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
              ${provider.name.charAt(0)}
            </div>
            <div>
              <h3 class="font-bold text-slate-900 leading-tight">${provider.name}</h3>
              <span class="text-[10px] uppercase font-bold text-slate-400">${provider.category}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="text-blue-500 p-1 btn-edit" data-id="${provider.id}">
              <iconify-icon icon="lucide:edit-2"></iconify-icon>
            </button>
            <button class="text-red-500 p-1 btn-delete" data-id="${provider.id}">
              <iconify-icon icon="lucide:trash-2"></iconify-icon>
            </button>
          </div>
        </div>
        <p class="text-sm text-slate-500 mb-3 ml-[52px]">${provider.description}</p>
        <div class="flex items-center justify-between ml-[52px] text-sm">
          <span class="font-semibold text-slate-700 flex items-center gap-1">
            <iconify-icon icon="lucide:phone" class="text-green-600"></iconify-icon> ${provider.phone}
          </span>
          <span class="font-bold text-amber-500 flex items-center gap-1">
            <iconify-icon icon="lucide:star"></iconify-icon> ${provider.rating}
          </span>
        </div>
      `;
      providersList.appendChild(el);
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const p = Storage.getProviders().find(e => e.id === id);
        if (p) openModal(p);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to delete this provider?')) {
          const id = e.currentTarget.dataset.id;
          Storage.deleteProvider(id);
          renderProviders();
        }
      });
    });
  }

  renderProviders();
});
