document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardAdminRoute()) return;

  const form = document.getElementById('create-event-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('event-title').value.trim();
      const description = document.getElementById('event-desc').value.trim();
      const date = document.getElementById('event-date').value;
      const time = document.getElementById('event-time').value;
      const location = document.getElementById('event-location').value.trim();

      if (!title || !description || !date || !time || !location) {
        alert('Please fill out all fields.');
        return;
      }

      const eventData = {
        title,
        description,
        date,
        time,
        location
      };

      Storage.saveEvent(eventData);

      // Optional: Add a little UI feedback
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<iconify-icon icon="lucide:check" class="text-xl"></iconify-icon> Created Successfully!`;
      btn.classList.add('bg-emerald-500');
      
      setTimeout(() => {
        Router.navigate('09-localpulse-admin-events-screen.html');
      }, 800);
    });
  }
});
