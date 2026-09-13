const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const next =
  new URLSearchParams(location.search).get('next') || 'index.html';

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


function show(id, title, copy) {
  $$('form').forEach(form => form.classList.add('hidden'));

  $(id).classList.remove('hidden');

  $('#title').textContent = title;
  $('#copy').textContent = copy;
}


// -----------------------------
// Firebase phone authentication
// -----------------------------

let confirmationResult = null;
let recaptchaVerifier = null;

function setupRecaptcha() {
  if (recaptchaVerifier) return;

  recaptchaVerifier =
    new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible'
      }
    );
}


// SEND OTP
$('#phone-form').onsubmit = async e => {

  e.preventDefault();

  const phone =
    $('#phone').value.replace(/\D/g, '');

  if (phone.length !== 10) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }

  const phoneNumber = '+91' + phone;

  try {

    setupRecaptcha();

    confirmationResult =
      await auth.signInWithPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );

    sessionStorage.setItem(
      'UdaanFin-phone',
      phone
    );

    show(
      '#otp-form',
      'Verify your number.',
      'Enter the OTP sent to +91 ' +
      phone
    );

    $('.otp input').focus();

  } catch (error) {

    console.error(error);

    alert(
      'Unable to send OTP. Please try again.'
    );

    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  }
};


// OTP boxes
$$('.otp input').forEach((input, index, all) => {

  input.oninput = () => {

    input.value =
      input.value.replace(/\D/g, '').slice(0, 1);

    if (
      input.value &&
      all[index + 1]
    ) {
      all[index + 1].focus();
    }
  };

});


// VERIFY OTP
$('#otp-form').onsubmit = async e => {

  e.preventDefault();

  const otp =
    $$('.otp input')
      .map(input => input.value)
      .join('');

  if (otp.length !== 6) {
    alert('Please enter the 6-digit OTP.');
    return;
  }

  try {

    const result =
      await confirmationResult.confirm(otp);

    const user = result.user;

    const userRef =
      db.collection('users').doc(user.uid);

    const userDoc =
      await userRef.get();

    if (userDoc.exists) {

      const data = userDoc.data();

      const name =
        data.name || 'User';

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
        'Lovely. What’s your name?',
        'We’ll use it to personalise your UdaanFin AI experience.'
      );

      $('#name').focus();
    }

  } catch (error) {

    console.error(error);

    alert(
      'Incorrect or expired OTP. Please try again.'
    );
  }
};


// CHANGE PHONE
$('#change').onclick = () => {

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  show(
    '#phone-form',
    'Let’s get you in.',
    'Enter your mobile number to receive a one-time password.'
  );
};


// SAVE NEW USER
$('#name-form').onsubmit = async e => {

  e.preventDefault();

  const name =
    $('#name').value.trim();

  if (!name) return;

  const user =
    auth.currentUser;

  if (!user) {
    alert('Your session expired. Please log in again.');
    location.reload();
    return;
  }

  try {

    const phone =
      user.phoneNumber || '';

    await db
      .collection('users')
      .doc(user.uid)
      .set({
        name: name,
        phone: phone,
        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });

    localStorage.setItem(
      'UdaanFin-user',
      name
    );

    localStorage.setItem(
      'UdaanFin-phone',
      phone
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