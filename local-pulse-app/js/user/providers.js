document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardUserRoute()) return;

  const providersList = document.getElementById('providers-list');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentCategory = 'All';
  let searchQuery = '';

  function getCategoryStyles(category) {
    switch(category) {
      case 'Electrician': return { icon: 'lucide:zap', bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'Plumber': return { icon: 'lucide:droplet', bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'Cleaning': return { icon: 'lucide:trash-2', bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'Mechanic': return { icon: 'lucide:wrench', bg: 'bg-slate-100', text: 'text-slate-600' };
      default: return { icon: 'lucide:briefcase', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  }

  function renderProviders() {
    const providers = Storage.getProviders();
    
    // Filter by Category
    let filtered = providers;
    if (currentCategory !== 'All') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
    }

    providersList.innerHTML = '';

    if (filtered.length === 0) {
      providersList.innerHTML = `
        <div class="text-center text-slate-400 mt-10">
          <iconify-icon icon="lucide:search-x" class="text-4xl mb-2"></iconify-icon>
          <p class="text-sm font-medium">No providers found</p>
        </div>
      `;
      return;
    }

    filtered.forEach(provider => {
      const styles = getCategoryStyles(provider.category);
      
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-4 border border-slate-50 shadow-sm flex items-center gap-4 transition-transform active:scale-[0.98]';
      card.innerHTML = `
        <div class="w-12 h-12 ${styles.bg} ${styles.text} flex items-center justify-center rounded-xl font-bold text-xl shrink-0">
          <iconify-icon icon="${styles.icon}"></iconify-icon>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 truncate">${provider.name}</h3>
          <p class="text-xs text-slate-500 mt-0.5 truncate">${provider.description}</p>
          <div class="flex items-center gap-1 mt-2 text-xs font-bold text-[#16A34A]">
            <iconify-icon icon="lucide:star" class="text-amber-400"></iconify-icon> ${provider.rating}
          </div>
        </div>
        <a href="tel:${provider.phone.replace(/\\s+/g, '')}" class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center active:bg-green-100 shrink-0">
          <iconify-icon icon="lucide:phone"></iconify-icon>
        </a>
      `;
      providersList.appendChild(card);
    });
  }

  // Handle Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProviders();
    });
  }

  // Handle Category Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update UI state
      filterBtns.forEach(b => {
        b.classList.remove('bg-[#16A34A]', 'text-white', 'border-[#16A34A]');
        b.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
      });
      
      const target = e.currentTarget;
      target.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
      target.classList.add('bg-[#16A34A]', 'text-white', 'border-[#16A34A]');

      // Update filter and render
      currentCategory = target.dataset.category;
      renderProviders();
    });
  });

  // Initial Render
  renderProviders();
});
