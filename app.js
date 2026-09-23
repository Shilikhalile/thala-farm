const input = document.querySelector('#plantInput');
const chooseBtn = document.querySelector('#chooseBtn');
const uploadArea = document.querySelector('#uploadArea');
const dropZone = document.querySelector('#dropZone');
const previewArea = document.querySelector('#previewArea');
const previewImage = document.querySelector('#previewImage');
const resultArea = document.querySelector('#resultArea');
const analyzeBtn = document.querySelector('#analyzeBtn');
const resetBtn = document.querySelector('#resetBtn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function showPreview(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.src = event.target.result;
    uploadArea.hidden = true;
    resultArea.hidden = true;
    previewArea.hidden = false;
  };
  reader.readAsDataURL(file);
}

chooseBtn?.addEventListener('click', () => input?.click());
uploadArea?.addEventListener('click', (event) => {
  if (event.target !== chooseBtn) input?.click();
});
input?.addEventListener('change', (event) => showPreview(event.target.files[0]));

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea?.classList.add('dragging');
  });
});
['dragleave', 'drop'].forEach((eventName) => {
  dropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea?.classList.remove('dragging');
  });
});
dropZone?.addEventListener('drop', (event) => showPreview(event.dataTransfer.files[0]));

analyzeBtn?.addEventListener('click', () => {
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = 'جاري التحليل... <span>◌</span>';
  setTimeout(() => {
    previewArea.hidden = true;
    resultArea.hidden = false;
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'حلّل الصورة <span>✦</span>';
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 900);
});

resetBtn?.addEventListener('click', () => {
  input.value = '';
  previewImage.src = '';
  resultArea.hidden = true;
  previewArea.hidden = true;
  uploadArea.hidden = false;
});

menuToggle?.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? 'none' : 'flex';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '68px';
  navLinks.style.right = '15px';
  navLinks.style.left = '15px';
  navLinks.style.padding = '18px';
  navLinks.style.flexDirection = 'column';
  navLinks.style.alignItems = 'stretch';
  navLinks.style.background = '#0b261b';
  navLinks.style.borderRadius = '12px';
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 680 && navLinks) navLinks.style.display = 'none';
  });
});
