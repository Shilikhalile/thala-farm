const input = document.querySelector('#plantInput');
const chooseBtn = document.querySelector('#chooseBtn');
const uploadArea = document.querySelector('#uploadArea');
const dropZone = document.querySelector('#dropZone');
const previewArea = document.querySelector('#previewArea');
const previewGrid = document.querySelector('#previewGrid');
const previewLabel = document.querySelector('#previewLabel');
const resultArea = document.querySelector('#resultArea');
const analyzeBtn = document.querySelector('#analyzeBtn');
const resetBtn = document.querySelector('#resetBtn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
let selectedFiles = [];

function showPreviews(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith('image/')).slice(0, 3);
  if (!files.length) return;
  selectedFiles = files;
  previewGrid.innerHTML = '';
  files.forEach((file) => {
    const image = document.createElement('img');
    image.alt = `صورة ${file.name}`;
    image.src = URL.createObjectURL(file);
    previewGrid.appendChild(image);
  });
  previewLabel.textContent = `${files.length} ${files.length === 1 ? 'تصويرة جاهزة' : 'تصاور جاهزين'} للتحليل`;
  uploadArea.hidden = true;
  resultArea.hidden = true;
  previewArea.hidden = false;
}

chooseBtn?.addEventListener('click', (event) => { event.stopPropagation(); input?.click(); });
uploadArea?.addEventListener('click', () => input?.click());
input?.addEventListener('change', (event) => showPreviews(event.target.files));

['dragenter', 'dragover'].forEach((eventName) => dropZone?.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadArea?.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone?.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadArea?.classList.remove('dragging');
}));
dropZone?.addEventListener('drop', (event) => showPreviews(event.dataTransfer.files));

function readImage(file) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = URL.createObjectURL(file);
  });
}

async function inspectPlant(files) {
  let green = 0, yellow = 0, dark = 0, total = 0;
  for (const file of files) {
    const image = await readImage(file);
    const canvas = document.createElement('canvas');
    const size = 90;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size).data;
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      if (g > r * 1.08 && g > b * 1.05) green += 1;
      if (r > b * 1.25 && g > b * 1.1 && r > 90) yellow += 1;
      if (brightness < 62) dark += 1;
      total += 1;
    }
  }
  const greenRatio = green / total;
  const yellowRatio = yellow / total;
  const darkRatio = dark / total;
  const vitality = Math.max(48, Math.min(98, Math.round(62 + greenRatio * 90 - yellowRatio * 28 - darkRatio * 12)));
  const stress = Math.max(8, Math.min(82, Math.round(12 + yellowRatio * 180 + darkRatio * 35)));
  const coverage = Math.min(100, files.length * 31 + 7);
  let title = 'علامات إجهاد خفيفة';
  let text = 'الورقة فيها تدرّج في اللون يستحق المتابعة. عاود صوّر نفس النبتة بعد 48 ساعة في ضوء واضح، وتجنّب رشّ أي علاج عشوائياً.';
  if (yellowRatio > .16) { title = 'اصفرار أو نقص محتمل'; text = 'لقينا نسبة اصفرار واضحة في التصاور. ثبّت من السقي، صرف الماء، والجهة السفلية للورقة قبل أي تدخل.'; }
  else if (darkRatio > .22) { title = 'بقع داكنة / ضرر محتمل'; text = 'التصاور فيها مناطق داكنة تستحق الفحص. صوّر الوجهين متاع الورقة عن قرب، وخلي الأوراق المصابة معزولة مؤقتاً.'; }
  else if (vitality > 80) { title = 'النبتة باينة في حالة طيبة'; text = 'اللون العام متوازن وما بانوش علامات قوية على ضغط. واصل المتابعة وصوّر الأوراق الجديدة باش تكتشف أي تغيير بكري.'; }
  return { title, text, vitality, stress, coverage, confidence: Math.max(71, Math.min(96, 72 + files.length * 6 + Math.round(vitality / 15))) };
}

analyzeBtn?.addEventListener('click', async () => {
  if (!selectedFiles.length) return;
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = 'نقرا الورقة كاملة... <span>◌</span>';
  const result = await inspectPlant(selectedFiles);
  setTimeout(() => {
    document.querySelector('#resultTitle').textContent = result.title;
    document.querySelector('#resultText').innerHTML = result.text;
    document.querySelector('#confidence').textContent = `ثقة ${result.confidence}%`;
    document.querySelector('#confidenceBar').style.width = `${result.confidence}%`;
    document.querySelector('#greenScore').textContent = `${result.vitality}%`;
    document.querySelector('#stressScore').textContent = `${result.stress}%`;
    document.querySelector('#coverageScore').textContent = `${result.coverage}%`;
    previewArea.hidden = true;
    resultArea.hidden = false;
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'حلّل النبتة كاملة <span>✦</span>';
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 650);
});

resetBtn?.addEventListener('click', () => {
  input.value = '';
  selectedFiles = [];
  previewGrid.innerHTML = '';
  resultArea.hidden = true;
  previewArea.hidden = true;
  uploadArea.hidden = false;
});

menuToggle?.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? 'none' : 'flex';
  navLinks.style.position = 'absolute'; navLinks.style.top = '68px'; navLinks.style.right = '15px'; navLinks.style.left = '15px';
  navLinks.style.padding = '18px'; navLinks.style.flexDirection = 'column'; navLinks.style.alignItems = 'stretch'; navLinks.style.background = '#0b261b'; navLinks.style.borderRadius = '12px';
});
document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
  if (window.innerWidth <= 680 && navLinks) navLinks.style.display = 'none';
}));
