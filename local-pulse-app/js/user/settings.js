document.addEventListener('DOMContentLoaded', () => {
  const user = Storage.getCurrentUser();
  if (!user) {
    Router.navigate('03-localpulse-mobile-login-screen.html');
    return;
  }

  const main = document.querySelector('main');
  
  // Inject the enhanced profile card
  if (main) {
    const profileHTML = `
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-green-600"></div>
        <div class="relative z-10 flex flex-col items-center">
          <div class="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-4xl font-extrabold text-green-600 mb-3 mt-4">
            ${user.name.charAt(0)}
          </div>
          <h2 class="text-xl font-bold text-slate-900">${user.name}</h2>
          <p class="text-slate-500 text-sm mb-4">${user.email}</p>
          
          <div class="flex items-center gap-2 mb-6">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">${user.role}</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
              <iconify-icon icon="lucide:map-pin" class="mr-1"></iconify-icon> ${user.location || 'Unknown'}
            </span>
          </div>

          <div class="w-full flex justify-around bg-slate-50 rounded-2xl p-4">
            <div class="text-center">
              <p class="text-2xl font-black text-slate-900">${user.reports || 0}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reports</p>
            </div>
            <div class="w-px bg-slate-200"></div>
            <div class="text-center">
              <p class="text-2xl font-black text-slate-900">${user.reputation || 0}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reputation</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Replace the first div in main (assuming it's the old static profile card)
    const oldProfileCard = main.querySelector('div.bg-white');
    if (oldProfileCard) {
      oldProfileCard.outerHTML = profileHTML;
    } else {
      main.insertAdjacentHTML('afterbegin', profileHTML);
    }
  }

  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Storage.logout();
      Router.navigate('03-localpulse-mobile-login-screen.html');
    });
  }

  // Handle Back Button
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      Router.navigate('04-localpulse-feed-screen.html');
    });
  }

  // --- Modals ---
  function createModal(id, title, contentHtml) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800 text-lg">${title}</h3>
          <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 active:scale-90 transition-transform close-modal">
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <div class="p-6 text-slate-600 text-sm space-y-4 max-h-[60vh] overflow-y-auto">
          ${contentHtml}
        </div>
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button class="px-6 py-2 bg-[#16A34A] text-white font-bold rounded-xl active:bg-[#15803d] transition-colors close-modal">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    });

    return modal;
  }

  function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  // Help & Support
  createModal('help-support-modal', 'Help & Support', `
    <h4 class="font-bold text-slate-800">Frequently Asked Questions</h4>
    <p>Find answers to commonly asked questions.</p>
    <h4 class="font-bold text-slate-800 mt-4">Emergency Contacts</h4>
    <p>100 - Police<br>101 - Fire<br>108 - Ambulance</p>
    <h4 class="font-bold text-slate-800 mt-4">Community Guidelines</h4>
    <p>Please review our guidelines to keep the community safe and supportive.</p>
    <h4 class="font-bold text-slate-800 mt-4">Email Support</h4>
    <p><a href="mailto:support@localpulse.demo" class="text-blue-600">support@localpulse.demo</a></p>
    <h4 class="font-bold text-slate-800 mt-4">Phone</h4>
    <p>1800-123-456</p>
  `);
  document.getElementById('help-support-row')?.addEventListener('click', () => showModal('help-support-modal'));

  // Terms & Conditions
  createModal('terms-modal', 'Terms & Conditions', `
    <h4 class="font-bold text-slate-800">Responsible Reporting</h4>
    <p>Ensure that all issues reported are accurate and true.</p>
    <h4 class="font-bold text-slate-800 mt-4">False Complaint Policy</h4>
    <p>Accounts submitting false complaints will be suspended.</p>
    <h4 class="font-bold text-slate-800 mt-4">User Responsibilities</h4>
    <p>Keep your contact details updated and communicate respectfully.</p>
    <h4 class="font-bold text-slate-800 mt-4">Community Safety</h4>
    <p>Do not post personal identifiable information publicly.</p>
    <button class="w-full bg-[#16A34A] text-white py-2 rounded-xl mt-6 font-bold close-modal">Accept</button>
  `);
  document.getElementById('terms-row')?.addEventListener('click', () => showModal('terms-modal'));

  // Privacy Policy
  createModal('privacy-modal', 'Privacy Policy', `
    <h4 class="font-bold text-slate-800">Data Storage</h4>
    <p>We collect only the minimal data required for reporting.</p>
    <h4 class="font-bold text-slate-800 mt-4">Local Storage Usage</h4>
    <p>All your data is safely stored in your device's local storage for this version.</p>
    <h4 class="font-bold text-slate-800 mt-4">Future Firebase Migration Notice</h4>
    <p>In upcoming versions, data will be migrated to Firebase for cross-device sync.</p>
    <h4 class="font-bold text-slate-800 mt-4">User Rights</h4>
    <p>You have the right to access and export your data at any time.</p>
    <h4 class="font-bold text-slate-800 mt-4">Data Removal Request</h4>
    <p>You can request data removal or clear your local storage manually.</p>
  `);
  document.getElementById('privacy-row')?.addEventListener('click', () => showModal('privacy-modal'));

  // About LocalPulse
  createModal('about-modal', 'About LocalPulse', `
    <h4 class="font-bold text-slate-800">Version</h4>
    <p>1.0.0</p>
    <h4 class="font-bold text-slate-800 mt-4">Build</h4>
    <p>Hackathon MVP</p>
    <h4 class="font-bold text-slate-800 mt-4">Technology</h4>
    <p>HTML<br>CSS<br>JavaScript</p>
    <h4 class="font-bold text-slate-800 mt-4">Storage</h4>
    <p>localStorage</p>
    <h4 class="font-bold text-slate-800 mt-4">Future Roadmap</h4>
    <p>Firebase Integration<br>AI Issue Classification<br>Community Analytics</p>
  `);
  document.getElementById('about-row')?.addEventListener('click', () => showModal('about-modal'));
});
