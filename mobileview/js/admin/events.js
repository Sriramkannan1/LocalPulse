document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const eventsList = document.getElementById('events-list');

  function renderEvents() {
    if (!eventsList) return;
    const events = Storage.getEvents();
    eventsList.innerHTML = '';

    if (events.length === 0) {
      eventsList.innerHTML = `
        <div class="text-center text-slate-400 mt-10 p-6 bg-white rounded-2xl border border-slate-100">
          <iconify-icon icon="lucide:calendar-x" class="text-4xl mb-2 text-slate-300"></iconify-icon>
          <p class="text-sm font-medium text-slate-500">No events found.</p>
        </div>
      `;
      return;
    }

    // Sort descending (newest created first)
    events.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    events.forEach((event, index) => {
      // Pick a random icon and color set for variety
      const icons = [
        { icon: 'lucide:calendar-range', bg: 'bg-purple-50', text: 'text-purple-600' },
        { icon: 'lucide:users', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { icon: 'lucide:megaphone', bg: 'bg-blue-50', text: 'text-blue-600' },
        { icon: 'lucide:tree-pine', bg: 'bg-amber-50', text: 'text-amber-600' }
      ];
      const style = icons[index % icons.length];
      
      const eventDate = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      // rudimentary formatting for time
      const timeStr = event.time;

      const el = document.createElement('div');
      el.className = 'bg-white rounded-[20px] p-5 shadow-card border border-slate-50 relative';
      el.innerHTML = `
        <div class="absolute top-5 right-5">
          <button class="w-8 h-8 flex items-center justify-center btn-delete" data-id="${event.id}">
            <iconify-icon icon="lucide:trash-2" class="text-red-400 text-xl hover:text-red-600"></iconify-icon>
          </button>
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center">
            <iconify-icon icon="${style.icon}" class="${style.text} text-xl"></iconify-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-900 leading-tight pr-10">${event.title}</h3>
        </div>
        
        <p class="text-sm text-slate-500 mb-4 line-clamp-2">${event.description}</p>

        <div class="space-y-3 mb-5">
          <div class="flex items-center gap-3">
            <iconify-icon icon="lucide:calendar" class="text-[#16A34A] text-lg"></iconify-icon>
            <span class="text-sm font-medium text-slate-600">${eventDate} • ${timeStr}</span>
          </div>
          <div class="flex items-center gap-3">
            <iconify-icon icon="lucide:map-pin" class="text-[#16A34A] text-lg"></iconify-icon>
            <span class="text-sm font-medium text-slate-600">${event.location}</span>
          </div>
        </div>
      `;
      eventsList.appendChild(el);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to delete this event?')) {
          const id = e.currentTarget.dataset.id;
          Storage.deleteEvent(id);
          renderEvents();
        }
      });
    });
  }

  renderEvents();
});
