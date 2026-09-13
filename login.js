const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const next =
  new URLSearchParams(location.search).get('next') || 'index.html';


// =============================
// THEME
// =============================

function theme(mode) {
  document.body.classList.toggle('dark', mode === 'dark');

  const button = $('#theme-toggle');

  if (button) {
    button.textContent = mode === 'dark' ? '☀' : '☾';
  }

  localStorage.setItem('UdaanFin-theme', mode);
}

theme(localStorage.getItem('UdaanFin-theme') || 'light');

$('#theme-toggle')?.addEventListener('click', () => {
  theme(
    document.body.classList.contains('dark')
      ? 'light'
      : 'dark'
  );
});


// =============================
// FORM DISPLAY
// =============================

function show(id, title, copy) {

  $$('form').forEach(form => {
    form.classList.add('hidden');
  });

  const target = $(id);

  if (target) {
    target.classList.remove('hidden');
  }

  if ($('#title')) {
    $('#title').textContent = title;
  }

  if ($('#copy')) {
    $('#copy').textContent = copy;
  }
}


// =============================
// GOOGLE LOGIN
// =============================

const googleButton = $('#google-login');

if (googleButton) {

  googleButton.addEventListener('click', async () => {

    googleButton.disabled = true;
    googleButton.innerHTML = 'Signing in…';

    try {

      const provider =
        new firebase.auth.GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result =
        await auth.signInWithPopup(provider);

      const user = result.user;

      const userRef =
        db.collection('users').doc(user.uid);

      const userDoc =
        await userRef.get();

      if (userDoc.exists) {

        const data = userDoc.data();

        const name =
          data.name ||
          user.displayName ||
          'User';

        localStorage.setItem(
          'UdaanFin-user',
          name
        );

        localStorage.setItem(
          'UdaanFin-phone',
          data.phone || ''
        );

        sessionStorage.setItem(
          'show-welcome',
          '1'
        );

        location.href = next;

      } else {

        show(
          '#name-form',
          'Welcome to UdaanFin AI.',
          'Just tell us your name so we can personalise your experience.'
        );

        $('#name').value =
          user.displayName || '';

        $('#name').focus();
      }

    } catch (error) {

  console.error("Firebase Google Login Error:", error);

  alert(
    "Firebase error:\n\n" +
    "Code: " + (error.code || "unknown") +
    "\n\nMessage: " + (error.message || "unknown")
  );

  googleButton.disabled = false;

  googleButton.innerHTML =
    'Continue with Google <span>→</span>';
}
  });
}


// =============================
// SAVE NEW GOOGLE USER
// =============================

const nameForm = $('#name-form');

if (nameForm) {

  nameForm.onsubmit = async e => {

    e.preventDefault();

    const name =
      $('#name').value.trim();

    if (!name) {

      alert('Please enter your name.');

      return;
    }

    const user =
      auth.currentUser;

    if (!user) {

      alert(
        'Your login session expired. Please sign in again.'
      );

      location.reload();

      return;
    }

    try {

      await db
        .collection('users')
        .doc(user.uid)
        .set({

          name: name,

          phone: '',

          email: user.email || '',

          createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

        }, { merge: true });


      localStorage.setItem(
        'UdaanFin-user',
        name
      );

      localStorage.setItem(
        'UdaanFin-phone',
        ''
      );

      sessionStorage.setItem(
        'show-welcome',
        '1'
      );

      location.href = next;

    } catch (error) {

      console.error(error);

      alert(
        'We could not save your account. Please try again.'
      );
    }
  };
}


// =============================
// QR LOGIN — PROTOTYPE
// =============================

const qrButton = $('#qr-login');

if (qrButton) {

  qrButton.addEventListener('click', () => {

    const qrBox = $('#qr-box');

    if (!qrBox) return;

    qrBox.classList.remove('hidden');

    qrButton.classList.add('hidden');

    const qrTarget =
      window.location.origin +
      window.location.pathname.replace(
        'login.html',
        'index.html'
      ) +
      '?qr-login=prototype';

    const qrContainer =
      $('#qrcode');

    if (
      qrContainer &&
      typeof QRCode !== 'undefined'
    ) {

      qrContainer.innerHTML = '';

      new QRCode(qrContainer, {
        text: qrTarget,
        width: 190,
        height: 190,
        correctLevel: QRCode.CorrectLevel.M
      });
    }

  });
}


// =============================
// QR PROTOTYPE CONTINUE
// =============================

const qrContinue =
  $('#qr-continue');

if (qrContinue) {

  qrContinue.addEventListener('click', () => {

    localStorage.setItem(
      'UdaanFin-qr-demo',
      'verified'
    );

    localStorage.setItem(
      'UdaanFin-user',
      'QR User'
    );

    sessionStorage.setItem(
      'show-welcome',
      '1'
    );

    location.href = next;
  });
}


// =============================
// QR CLOSE
// =============================

const qrClose =
  $('#qr-close');

if (qrClose) {

  qrClose.addEventListener('click', () => {

    $('#qr-box')?.classList.add('hidden');

    qrButton?.classList.remove('hidden');

  });
}
