// 目前首頁不需要特別JS，可保留空檔以後擴充
console.log("首頁載入完成");
function setVh() {
  // 計算真正可用高度 (包含工具列隱藏狀態)
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
window.addEventListener('load', setVh);




