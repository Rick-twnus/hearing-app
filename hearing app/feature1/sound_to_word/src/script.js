// 檢查瀏覽器是否支援 Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('您的瀏覽器不支援 Web Speech API，請使用 Chrome 或其他支援的瀏覽器。');
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-TW'; // 設置語言為繁體中文
  recognition.interimResults = true; // 啟用即時結果
  recognition.continuous = true; // 啟用連續錄音

  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const transcriptDiv = document.getElementById('transcript');
  const statusDiv = document.getElementById('status');

  let finalTranscript = ''; // 儲存最終轉錄結果

  // 當語音識別有結果時
  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    transcriptDiv.textContent = finalTranscript + interimTranscript;
  };

  // 當語音識別結束時
  recognition.onend = () => {
    if (startBtn.disabled) {
      // 如果正在錄音，自動重啟識別以實現長時間錄音
      recognition.start();
    } else {
      statusDiv.textContent = '狀態：錄音已停止';
    }
  };

  // 錯誤處理
  recognition.onerror = (event) => {
    statusDiv.textContent = `錯誤：${event.error}`;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  // 開始錄音按鈕
  startBtn.addEventListener('click', () => {
    finalTranscript = ''; // 清空之前的轉錄
    transcriptDiv.textContent = '';
    recognition.start();
    statusDiv.textContent = '狀態：正在錄音...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  });

  // 停止錄音按鈕
  stopBtn.addEventListener('click', () => {
    recognition.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = '狀態：錄音已停止';
  });
}