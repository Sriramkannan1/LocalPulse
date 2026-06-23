document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isLoginPage = path.includes('03-localpulse-mobile-login-screen.html');
  const isRegisterPage = path.includes('01-localpulse-registration-screen.html');
  const isSplashPage = path.includes('02-localpulse-splash-screen.html');

  // Session Redirect Check
  function checkSession() {
    const user = Storage.getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        Router.navigate('08-localpulse-admin-dashboard.html');
        return true;
      } else if (user.role === 'provider') {
        Router.navigate('17-localpulse-provider-dashboard.html');
        return true;
      } else {
        Router.navigate('04-localpulse-feed-screen.html');
        return true;
      }
    }
    return false;
  }

  // Splash Screen Logic
  if (isSplashPage) {
    setTimeout(() => {
      if (!checkSession()) {
        Router.navigate('03-localpulse-mobile-login-screen.html');
      }
    }, 2000);
    return;
  }

  // Auto-redirect if logged in on Auth pages
  if (isLoginPage || isRegisterPage) {
    checkSession();
  }

  // Login Logic (Split Member vs Admin)
  if (isLoginPage) {
    const memberForm = document.getElementById('member-login-form');
    const adminForm = document.getElementById('admin-login-form');

    if (memberForm) {
      memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('member-email').value;
        const password = document.getElementById('member-password').value;

        if (!email || !password) {
          alert('Please enter email and password');
          return;
        }

        // Demo Mode: Any email/password combination works for users.
        const user = Storage.login(email, password);
        if (user) {
          if (email.toLowerCase() === 'provider@localpulse.com') {
            const providers = Storage.getProviders();
            if (providers.length > 0) {
              user.id = providers[0].id; // Assign them the first provider account for demo
              user.name = providers[0].name;
            }
            user.role = 'provider'; // Force role to provider
            Storage._set(StorageKeys.SESSION, user); // Resave session
            Router.navigate('17-localpulse-provider-dashboard.html');
          } else {
            Router.navigate('04-localpulse-feed-screen.html');
          }
        }
      });
    }

    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        if (!email || !password) {
          alert('Please enter admin credentials');
          return;
        }

        const adminUser = Storage.loginAsAdmin(email, password);
        if (adminUser) {
          Router.navigate('08-localpulse-admin-dashboard.html');
        } else {
          alert('Invalid Admin Credentials');
        }
      });
    }
  }

  // Registration Logic (Demo Mode: Always succeeds)
  if (isRegisterPage) {
    const registerForm = document.querySelector('form');
    
    // Inject success modal HTML into the page hidden
    const modalHTML = `
      <div id="success-modal" class="fixed inset-0 bg-slate-900/60 z-50 hidden flex flex-col items-center justify-center p-6 backdrop-blur-sm">
        <div class="bg-white rounded-[24px] p-8 w-full max-w-sm text-center shadow-2xl transform transition-all scale-95 opacity-0" id="success-modal-content">
          <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <iconify-icon icon="lucide:check" class="text-4xl"></iconify-icon>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 mb-3">Registration Successful</h2>
          <p class="text-slate-500 text-[15px] leading-relaxed mb-2">Your LocalPulse account has been created successfully.</p>
          <p class="text-slate-500 text-[14px] leading-relaxed mb-8">Demo Account Created.<br>You can now sign in and start reporting issues.</p>
          <button id="btn-continue-login" class="w-full bg-[#16A34A] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all">
            Continue to Login
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const successModal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');
    const btnContinue = document.getElementById('btn-continue-login');

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = registerForm.querySelectorAll('input');
        const name = inputs[0]?.value;
        const email = inputs[1]?.value;
        const password = inputs[2]?.value;

        if (!name || !email || !password) {
          alert('Please fill all fields');
          return;
        }

        // Show Success Popup regardless of details for Demo Mode
        successModal.classList.remove('hidden');
        // Trigger reflow for animation
        void successModal.offsetWidth;
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        Router.navigate('03-localpulse-mobile-login-screen.html');
      });
    }
  }
});
