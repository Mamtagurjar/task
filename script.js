// Max date = today
const today = new Date().toISOString().split('T')[0];
document.getElementById('dob').max = today;

// Elements
const form           = document.getElementById('regForm');
const formBody       = document.getElementById('formBody');
const successOverlay = document.getElementById('successOverlay');
const successDetail  = document.getElementById('successDetail');
const submitBtn      = document.getElementById('submitBtn');
const spinner        = document.getElementById('spinner');
const diseaseYes     = document.getElementById('diseaseYes');
const diseaseNo      = document.getElementById('diseaseNo');
const diseaseFields  = document.getElementById('diseaseFields');

// Phone inputs: digits only
['phone', 'altPhone'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });
});

// Toggle disease detail field
function toggleDisease() {
  if (diseaseYes.checked) {
    diseaseFields.classList.add('show');
  } else {
    diseaseFields.classList.remove('show');
    clearError('diseaseDetails', 'diseaseDetailsErr');
    document.getElementById('diseaseDetails').value = '';
    document.getElementById('diseaseDetails').classList.remove('valid', 'error');
  }
}
diseaseYes.addEventListener('change', toggleDisease);
diseaseNo.addEventListener('change', toggleDisease);

// --- Validation helpers ---
function showError(id, msgId) {
  const el = document.getElementById(id);
  el.classList.add('error');
  el.classList.remove('valid');
  document.getElementById(msgId).classList.add('show');
}

function clearError(id, msgId) {
  const el = document.getElementById(id);
  el.classList.remove('error');
  if (msgId) document.getElementById(msgId).classList.remove('show');
}

function markValid(id, msgId) {
  const el = document.getElementById(id);
  el.classList.remove('error');
  el.classList.add('valid');
  if (msgId) document.getElementById(msgId).classList.remove('show');
}

// Field definitions
const fields = [
  { id: 'name',           msg: 'nameErr',          validate: v => v.trim().length >= 2 },
  { id: 'address',        msg: 'addressErr',        validate: v => v.trim().length >= 5 },
  { id: 'phone',          msg: 'phoneErr',          validate: v => /^\d{10}$/.test(v.trim()) },
  { id: 'altPhone',       msg: 'altPhoneErr',       validate: v => v.trim() === '' || /^\d{10}$/.test(v.trim()) },
  { id: 'dob',            msg: 'dobErr',            validate: v => v !== '' && new Date(v) <= new Date() },
  { id: 'bloodGroup',     msg: 'bloodErr',          validate: v => v !== '' },
  { id: 'diseaseDetails', msg: 'diseaseDetailsErr', validate: v => v.trim().length >= 2 },
];

// Live validation (blur + input)
fields.forEach(({ id, msg, validate }) => {
  const el = document.getElementById(id);

  el.addEventListener('blur', () => {
    if (id === 'diseaseDetails' && !diseaseYes.checked) return;
    if (validate(el.value)) markValid(id, msg);
    else showError(id, msg);
  });

  el.addEventListener('input', () => {
    if (el.classList.contains('error') && validate(el.value)) markValid(id, msg);
  });
});

// Escape HTML for display
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// --- Form Submit ---
form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  fields.forEach(({ id, msg, validate }) => {
    if (id === 'diseaseDetails' && !diseaseYes.checked) return;
    const el = document.getElementById(id);
    if (validate(el.value)) markValid(id, msg);
    else { showError(id, msg); valid = false; }
  });

  // Radio check
  const diseaseVal = document.querySelector('input[name="disease"]:checked');
  if (!diseaseVal) {
    document.getElementById('diseaseErr').classList.add('show');
    valid = false;
  } else {
    document.getElementById('diseaseErr').classList.remove('show');
  }

  if (!valid) return;

  // Show loading spinner
  submitBtn.disabled = true;
  document.querySelector('.btn-text').style.opacity = '0';
  spinner.style.display = 'block';

  // Simulate API call delay
  setTimeout(() => {
    const dob = document.getElementById('dob').value;
    const dobFormatted = dob
      ? new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';
    const altP = document.getElementById('altPhone').value.trim();
    const diseaseInfo = diseaseYes.checked
      ? document.getElementById('diseaseDetails').value.trim()
      : 'None';

    successDetail.innerHTML = `
      <b style="display:block;margin-bottom:8px;font-size:0.9rem;color:var(--text);">Registration Summary</b>
      <strong>Name:</strong> ${esc(document.getElementById('name').value.trim())}<br>
      <strong>Address:</strong> ${esc(document.getElementById('address').value.trim())}<br>
      <strong>Phone:</strong> ${esc(document.getElementById('phone').value.trim())}<br>
      ${altP ? `<strong>Alt. Mobile:</strong> ${esc(altP)}<br>` : ''}
      <strong>Date of Birth:</strong> ${dobFormatted}<br>
      <strong>Blood Group:</strong> ${esc(document.getElementById('bloodGroup').value)}<br>
      <strong>Any Disease:</strong> ${diseaseYes.checked ? 'Yes — ' + esc(diseaseInfo) : 'No'}
    `;

    formBody.style.display = 'none';
    successOverlay.classList.add('show');
  }, 1200);
});

// --- Reset ---
document.getElementById('resetBtn').addEventListener('click', () => {
  form.reset();
  toggleDisease();

  fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    el.classList.remove('error', 'valid');
    document.getElementById(msg).classList.remove('show');
  });

  submitBtn.disabled = false;
  document.querySelector('.btn-text').style.opacity = '1';
  spinner.style.display = 'none';
  successOverlay.classList.remove('show');
  formBody.style.display = 'block';
});