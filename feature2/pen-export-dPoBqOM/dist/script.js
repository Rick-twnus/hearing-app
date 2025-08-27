// Initialize i18next for multilingual support
i18next.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {
        title: '心情日記小助手 🌟',
        languageTab: '語言選擇',
        diaryTab: '寫日記',
        reminderTab: '提醒設定',
        historyTab: '歷史紀錄',
        language: '語言',
        reminder: '每日提醒',
        setReminder: '設定提醒 🕒',
        diaryInput: '分享你的心情 💬',
        speechInput: '語音輸入 🎤',
        photoUpload: '上傳照片 📸',
        moodTracker: '今天的心情 😊',
        submit: '保存日記 💾',
        diarySaved: '日記已保存！🎉',
        reminderSet: '已設定提醒！',
        noText: '請寫點什麼吧！',
        positiveResponse: '哇！今天心情超棒！繼續保持這份快樂哦！🌈',
        neutralResponse: '謝謝你的分享！今天很平靜，繼續記錄你的故事吧！🌟',
        negativeResponse: '看起來有點小低落，沒關係，明天會更好！需要我陪你聊聊嗎？💕',
        mood_happy: '開心',
        mood_neutral: '普通',
        mood_sad: '難過',
        mood_angry: '生氣',
        sentiment_positive: '正面',
        sentiment_neutral: '中性',
        sentiment_negative: '負面',
        sentiment_unknown: '未知'
      }
    },
    en: {
      translation: {
        title: 'Mood Diary Assistant 🌟',
        languageTab: 'Language',
        diaryTab: 'Write Diary',
        reminderTab: 'Reminder',
        historyTab: 'History',
        language: 'Language',
        reminder: 'Daily Reminder',
        setReminder: 'Set Reminder 📅',
        diaryInput: 'Share Your Mood 💬',
        speechInput: 'Speech Input 🎤',
        photoUpload: 'Upload Photo 📸',
        moodTracker: 'Today\'s Mood 😊',
        submit: 'Save Diary 💾',
        diarySaved: 'Diary saved! 🎉',
        reminderSet: 'Reminder Set!',
        noText: 'Please write something!',
        positiveResponse: 'Wow! You’re in a great mood today! Keep shining! 🌈',
        neutralResponse: 'Thanks for sharing! Today feels calm, keep journaling! 🌟',
        negativeResponse: 'Seems like a tough day. It’s okay, tomorrow will be better! 💕',
        mood_happy: 'Happy',
        mood_neutral: 'Neutral',
        mood_sad: 'Sad',
        mood_angry: 'Angry',
        sentiment_positive: 'Positive',
        sentiment_neutral: 'Neutral',
        sentiment_negative: 'Negative',
        sentiment_unknown: 'Unknown'
      }
    }
  }
}, function(err, t) {
  updateContent();
});

// Language switcher
document.getElementById('language-select').addEventListener('change', (e) => {
  i18next.changeLanguage(e.target.value, updateContent);
});

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    elem.textContent = i18next.t(key);
  });
  displayDiaryEntries(); // Refresh entries to update translations
}

// Modal handling
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.getElementById(btn.dataset.modal).classList.add('active');
  });
});

document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.remove('active');
  });
});

// Initialize Pyodide for VADER sentiment analysis
let pyodide;
async function loadPyodideAndPackages() {
  try {
    pyodide = await loadPyodide();
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('vaderSentiment')
      from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
      analyzer = SentimentIntensityAnalyzer()
    `);
  } catch (error) {
    console.error('Failed to load Pyodide or VADER:', error);
  }
}
loadPyodideAndPackages();

// Speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'zh-CN';
document.getElementById('language-select').addEventListener('change', (e) => {
  recognition.lang = e.target.value === 'zh' ? 'zh-CN' : 'en-US';
});

document.getElementById('speech-input').addEventListener('click', () => {
  recognition.start();
  document.getElementById('speech-input').textContent = i18next.t('speechInput') + ' (錄音中...)';
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  document.getElementById('diary-input').value += transcript + ' ';
  document.getElementById('speech-input').textContent = i18next.t('speechInput');
};

recognition.onend = () => {
  document.getElementById('speech-input').textContent = i18next.t('speechInput');
};

// Diary submission
document.getElementById('submit-diary').addEventListener('click', async () => {
  const text = document.getElementById('diary-input').value.trim();
  const photo = document.getElementById('photo-upload').files[0];
  const mood = document.querySelector('.mood-emoji.scale-125')?.dataset.mood || 'none';

  if (!text) {
    alert(i18next.t('noText'));
    return;
  }

  // Perform sentiment analysis
  let sentiment = 'neutral';
  let responseText = i18next.t('neutralResponse');
  try {
    if (pyodide) {
      const scores = await pyodide.runPythonAsync(`
        analyzer.polarity_scores('${text.replace(/'/g, "\\'")}')
      `);
      const sentimentScore = scores.compound || 0;
      if (sentimentScore >= 0.05) {
        sentiment = 'positive';
        responseText = i18next.t('positiveResponse');
      } else if (sentimentScore <= -0.05) {
        sentiment = 'negative';
        responseText = i18next.t('negativeResponse');
      }
    }
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    sentiment = 'neutral';
    responseText = i18next.t('neutralResponse');
  }

  // Generate title
  const title = text.split(' ').slice(0, 5).join(' ') || 'Untitled Entry';

  // Handle photo
  let photoUrl = '';
  if (photo) {
    photoUrl = URL.createObjectURL(photo);
  }

  // Save diary entry
  const entry = { title, text, photoUrl, mood, sentiment, responseText, date: new Date().toISOString() };
  const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
  entries.push(entry);
  localStorage.setItem('diaryEntries', JSON.stringify(entries));

  // Display entry in history modal
  displayDiaryEntries();
  alert(i18next.t('diarySaved'));

  // Reset inputs
  document.getElementById('diary-input').value = '';
  document.getElementById('photo-upload').value = '';
  document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('scale-125'));

  // Open history modal
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
  document.getElementById('history-modal').classList.add('active');
});

// Mood selector
document.querySelectorAll('.mood-emoji').forEach(emoji => {
  emoji.addEventListener('click', () => {
    document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('scale-125'));
    emoji.classList.add('scale-125');
  });
});

// Display diary entries
function displayDiaryEntries() {
  const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
  const container = document.getElementById('diary-entries');
  container.innerHTML = '';

  // Display entries
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'diary-entry';
    const moodText = i18next.t(`mood_${entry.mood}`) || entry.mood;
    const sentimentText = entry.sentiment ? i18next.t(`sentiment_${entry.sentiment}`) : i18next.t('sentiment_unknown');
    div.innerHTML = `
      <h3 class="font-bold text-lg text-pink-500">${entry.title}</h3>
      <p class="text-sm text-gray-600">${new Date(entry.date).toLocaleString()}</p>
      <p>${entry.text}</p>
      ${entry.photoUrl ? `<img src="${entry.photoUrl}" class="w-full h-48 object-cover rounded-lg mt-2" alt="Diary Photo">` : ''}
      <p><strong>心情:</strong> ${moodText}</p>
      <p><strong>情感:</strong> ${sentimentText}</p>
      <p><strong>回應:</strong> ${entry.responseText}</p>
    `;
    container.appendChild(div);
  });
}

// Reminder functionality
document.getElementById('set-reminder').addEventListener('click', () => {
  const time = document.getElementById('reminder-time').value;
  if (time) {
    localStorage.setItem('reminderTime', time);
    alert(i18next.t('reminderSet', { time }));
    scheduleReminder(time);
  }
});

function scheduleReminder(time) {
  const [hours, minutes] = time.split(':').map(Number);
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes) {
      alert('該寫日記囉！✨');
    }
  }, 60000);
}

// Load saved reminder
const savedTime = localStorage.getItem('reminderTime');
if (savedTime) {
  document.getElementById('reminder-time').value = savedTime;
  scheduleReminder(savedTime);
}

// Initial display of diary entries
displayDiaryEntries();