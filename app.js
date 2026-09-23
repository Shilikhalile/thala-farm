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

const selectedSymptoms = new Set();
document.querySelectorAll('.symptom-chip').forEach((chip) => chip.addEventListener('click', () => {
  const symptom = chip.dataset.symptom;
  chip.classList.toggle('active');
  chip.classList.contains('active') ? selectedSymptoms.add(symptom) : selectedSymptoms.delete(symptom);
}));

function getHistory() { return JSON.parse(localStorage.getItem('agriai-history') || '[]'); }
function renderHistory() {
  const history = getHistory();
  const count = document.querySelector('#historyCount');
  const list = document.querySelector('#historyList');
  if (!count || !list) return;
  count.textContent = history.length;
  list.innerHTML = history.length ? history.slice(0, 4).map((item) => `<div class="history-item"><strong>${item.title}</strong><span>${item.date}</span></div>`).join('') : '<p class="empty-history">أول فحص تعملو يبان هنا.</p>';
}
renderHistory();

const originalAnalyze = analyzeBtn;
analyzeBtn?.addEventListener('click', () => {
  setTimeout(() => {
    const title = document.querySelector('#resultTitle')?.textContent || 'فحص جديد';
    const history = getHistory();
    history.unshift({ title, date: new Date().toLocaleDateString('fr-TN') });
    localStorage.setItem('agriai-history', JSON.stringify(history.slice(0, 8)));
    document.querySelector('#lastScan').textContent = 'اليوم · الآن';
    renderHistory();
  }, 900);
});

document.querySelector('#editProfile')?.addEventListener('click', () => {
  const edit = document.querySelector('#profileEdit');
  edit.hidden = !edit.hidden;
});
document.querySelector('#saveProfile')?.addEventListener('click', () => {
  const name = document.querySelector('#fieldName').value.trim() || 'حقل الزيتون متاعي';
  const location = document.querySelector('#fieldLocation').value.trim() || 'Thala';
  document.querySelector('#profileName').textContent = name;
  document.querySelector('#profileMeta').textContent = `${location} · زيتون · بروفايل شخصي`;
  document.querySelector('#profileEdit').hidden = true;
  localStorage.setItem('agriai-profile', JSON.stringify({ name, location }));
});
const savedProfile = JSON.parse(localStorage.getItem('agriai-profile') || 'null');
if (savedProfile) { document.querySelector('#profileName').textContent = savedProfile.name; document.querySelector('#profileMeta').textContent = `${savedProfile.location} · زيتون · بروفايل شخصي`; }

document.querySelector('#shareReport')?.addEventListener('click', async () => {
  const text = 'AgriAI Tunisia — تقرير فحص الحقل. جرّب تشخيص نبتتك: https://shilikhalile.github.io/thala-farm/';
  if (navigator.share) await navigator.share({ title: 'AgriAI Tunisia', text });
  else { await navigator.clipboard?.writeText(text); alert('تنسخ التقرير. تنجم تبعثو لأي واحد.'); }
});

const weatherState = { label: 'الطقس موش متوفر توا', temp: null, advice: 'عاود جرّب بعد شوية.' };
const weatherLabels = { 0: 'صحو', 1: 'صحو غالباً', 2: 'سحب خفيفة', 3: 'غائم', 45: 'ضباب', 48: 'ضباب', 51: 'رذاذ', 53: 'رذاذ', 61: 'مطر خفيف', 63: 'مطر', 65: 'مطر قوي', 71: 'ثلج خفيف', 80: 'زخات مطر', 81: 'زخات مطر', 82: 'زخات قوية', 95: 'عواصف' };
async function loadWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.58&longitude=8.68&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FTunis&forecast_days=3';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather request failed');
    const data = await response.json();
    const current = data.current;
    const label = weatherLabels[current.weather_code] || 'طقس متبدّل';
    weatherState.label = label;
    weatherState.temp = Math.round(current.temperature_2m);
    weatherState.advice = current.weather_code >= 51 ? 'استنّى شوية قبل الرشّ' : 'الوقت مناسب للفحص';
    document.querySelector('#weatherNow').textContent = `${weatherState.temp}° · ${label}`;
    document.querySelector('#weatherAdvice').textContent = weatherState.advice;
    document.querySelector('#weatherDetails').textContent = `رطوبة ${current.relative_humidity_2m}% · رياح ${Math.round(current.wind_speed_10m)} كم/س`;
    const days = data.daily.time.map((date, index) => `<span><b>${index === 0 ? 'اليوم' : index === 1 ? 'غدوة' : 'بعد غدوة'}</b>${Math.round(data.daily.temperature_2m_max[index])}° · ${weatherLabels[data.daily.weather_code[index]] || 'متبدّل'}</span>`).join('');
    document.querySelector('#forecast').innerHTML = days;
  } catch (error) {
    document.querySelector('#weatherNow').textContent = 'الطقس موش متوفر';
    document.querySelector('#weatherAdvice').textContent = 'ما قدرناش نجيبو الطقس توا';
    document.querySelector('#weatherDetails').textContent = 'تثبت من الكونكسيون وعاود جرّب';
  }
}
loadWeather();

const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');
const chatForm = document.querySelector('#chatForm');
function addMessage(text, type) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  chatMessages?.appendChild(message);
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}
function assistantReply(question) {
  const q = question.toLowerCase();
  if (q.includes('طقس') || q.includes('جو') || q.includes('مطر') || q.includes('حرارة')) return `توا في ثالة: ${weatherState.temp ? `${weatherState.temp}° و${weatherState.label}` : weatherState.label}. ${weatherState.advice}`;
  if (q.includes('صوّر') || q.includes('تصوير') || q.includes('تصويرة')) return 'صوّر الورقة في ضوء طبيعي، من فوق ومن تحت، وخلي الصورة واضحة. تنجم ترفع حتى 3 تصاور لنفس النبتة.';
  if (q.includes('مرض') || q.includes('بقع') || q.includes('اصفرار') || q.includes('حشرة')) return 'ارفع تصاور للورقة كاملة وقريبة. AgriAI يقارن اللون والبقع والجفاف ويعطيك قراءة أولية، أما ما تستعملش علاج قبل التثبت.';
  if (q.includes('شنوة') && (q.includes('تعمل') || q.includes('منصّة') || q.includes('agriai'))) return 'نعاونك تفحص نبتتك بالتصويرة، تتابع حالة الحقل، وتشوف طقس ثالة. اختار المحصول وزيد الأعراض اللي لاحظتهم.';
  if (q.includes('زيتون') || q.includes('طماطم') || q.includes('تمور')) return 'اختار نوع المحصول من بطاقة الفحص، وبعد ارفع تصاور واضحة. كل ما تزيد تصاور من زوايا مختلفة، القراءة تولّي أحسن.';
  return 'فهمتك. اسألني على الطقس، طريقة التصوير، أمراض الأوراق، أو كيفاش تستعمل AgriAI.';
}
function sendChat(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage(clean, 'user');
  chatInput.value = '';
  setTimeout(() => addMessage(assistantReply(clean), 'bot'), 320);
}
chatForm?.addEventListener('submit', (event) => { event.preventDefault(); sendChat(chatInput.value); });
document.querySelectorAll('.assistant-prompts button').forEach((button) => button.addEventListener('click', () => sendChat(button.dataset.prompt)));
