document.addEventListener('DOMContentLoaded', () => {
  if (!Router.guardUserRoute()) return;

  const form = document.querySelector('form');
  if (!form) return;

  const titleInput = document.getElementById('issue-title');
  const descInput = document.getElementById('issue-desc');
  const categorySelect = document.getElementById('issue-category');
  
  // Location Picker
  const locationPicker = document.getElementById('location-picker');
  const locationText = document.getElementById('location-text');
  let selectedLocation = '';

  // Create Location Modal
  const locationModal = document.createElement('div');
  locationModal.className = 'fixed inset-0 z-[100] hidden items-end justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4';
  locationModal.innerHTML = `
    <div class="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-full duration-300">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-slate-800 text-lg">Select Location</h3>
        <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 active:scale-90 transition-transform close-location">
          <iconify-icon icon="lucide:x"></iconify-icon>
        </button>
      </div>
      <div class="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="Current Location">
          <iconify-icon icon="lucide:crosshair" class="text-green-600 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">Current Location</span>
        </button>
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="Green Park, Coimbatore">
          <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">Green Park, Coimbatore</span>
        </button>
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="Gandhipuram, Coimbatore">
          <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">Gandhipuram, Coimbatore</span>
        </button>
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="Singanallur, Coimbatore">
          <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">Singanallur, Coimbatore</span>
        </button>
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="Peelamedu, Coimbatore">
          <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">Peelamedu, Coimbatore</span>
        </button>
        <button type="button" class="loc-option w-full text-left p-3 rounded-xl flex items-center gap-3 active:bg-slate-100" data-loc="RS Puram, Coimbatore">
          <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-xl"></iconify-icon>
          <span class="font-semibold text-slate-800">RS Puram, Coimbatore</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(locationModal);

  locationPicker.addEventListener('click', () => {
    locationModal.classList.remove('hidden');
    locationModal.classList.add('flex');
  });

  locationModal.querySelectorAll('.close-location').forEach(btn => {
    btn.addEventListener('click', () => {
      locationModal.classList.add('hidden');
      locationModal.classList.remove('flex');
    });
  });

  locationModal.querySelectorAll('.loc-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedLocation = e.currentTarget.dataset.loc;
      locationText.textContent = selectedLocation;
      locationText.classList.remove('text-gray-400');
      locationText.classList.add('text-slate-900');
      locationModal.classList.add('hidden');
      locationModal.classList.remove('flex');
    });
  });

  // Photo Upload
  const photoPicker = document.getElementById('photo-picker');
  const fileInput = document.getElementById('file-input');
  const photoPreview = document.getElementById('photo-preview');
  let selectedImageBase64 = '';

  photoPicker.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        selectedImageBase64 = ev.target.result;
        photoPreview.src = selectedImageBase64;
        photoPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Toast Function
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm z-[200] animate-in slide-in-from-top-4 fade-in duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Remove existing errors
    form.querySelectorAll('.text-red-500.text-xs').forEach(e => e.remove());

    if (!titleInput.value.trim() || !descInput.value.trim() || !categorySelect.value || !selectedLocation) {
      alert('Please fill out all required fields, including Location.');
      return;
    }

    const user = Storage.getCurrentUser();
    
    // --- SMART AUTO-ASSIGNMENT LOGIC ---
    let assignedProviderId = null;
    let assignedProviderName = null;
    let assignmentStatus = 'Pending';

    // 1. Fetch all providers
    const providers = Storage.getProviders();

    // 2. Filter: Active Status AND Category Match AND Coverage Area Match
    const categoryMapping = {
      'Electricity': 'Electrician',
      'Water Issue': 'Plumber',
      'Garbage': 'Cleaning',
      'Road Issue': 'Mechanic', // Fallback mapped role
      'Safety': 'Mechanic'      // Fallback mapped role
    };
    const mappedCategory = categoryMapping[categorySelect.value] || 'Electrician';
    const locName = selectedLocation.split(',')[0].trim(); // Extract base name e.g., "Peelamedu"

    const candidates = providers.filter(p => 
      p.status === 'Active' && 
      p.category === mappedCategory && 
      p.coverageArea && p.coverageArea.includes(locName)
    );

    if (candidates.length > 0) {
      // 3. Priority 4: Lowest Assigned Issues
      candidates.sort((a, b) => (a.assignedIssues || 0) - (b.assignedIssues || 0));
      const selectedProvider = candidates[0];
      
      assignedProviderId = selectedProvider.id;
      assignedProviderName = selectedProvider.name;
      assignmentStatus = 'Assigned';

      // Update provider's workload
      selectedProvider.assignedIssues = (selectedProvider.assignedIssues || 0) + 1;
      Storage.updateProvider(selectedProvider);
    }
    // --- END AUTO ASSIGNMENT ---

    const issueId = `ISS${Date.now()}`;
    const newIssue = {
      id: issueId,
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      category: categorySelect.value,
      location: selectedLocation,
      latitude: 11.0168 + (Math.random() * 0.02 - 0.01),
      longitude: 76.9558 + (Math.random() * 0.02 - 0.01),
      image: selectedImageBase64 || "assets/images/placeholder-issue.jpg",
      authorId: user.id,
      status: assignmentStatus,
      assignedProviderId: assignedProviderId,
      assignedProviderName: assignedProviderName,
      assignedAt: assignedProviderId ? new Date().toISOString() : null
    };

    Storage.saveIssue(newIssue);

    // Save Assignment Record for V2
    if (assignedProviderId) {
      Storage.saveAssignment({
        issueId: issueId,
        providerId: assignedProviderId,
        assignedBy: 'system',
        status: 'Assigned'
      });
      showToast(`Report Submitted. Auto-assigned to ${assignedProviderName}.`);
    } else {
      showToast('Report Submitted Successfully');
    }
    
    setTimeout(() => {
      Router.navigate('12-localpulse-my-reports-dashboard.html');
    }, 1500);
  });
});
