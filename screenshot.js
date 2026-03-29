const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // 设置手机视口
  await page.setViewport({
    width: 375,
    height: 812,
    isMobile: true
  });
  
  const previewPath = path.join(__dirname, 'preview.html');
  const fileUrl = 'file://' + previewPath;
  
  // 首页
  await page.goto(fileUrl);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/adai-fitness-home.png' });
  console.log('✅ 首页截图: /tmp/adai-fitness-home.png');
  
  // 训练页
  await page.evaluate(() => showScreen('workout'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/adai-fitness-workout.png' });
  console.log('✅ 训练页截图: /tmp/adai-fitness-workout.png');
  
  // 历史页
  await page.evaluate(() => showScreen('history'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/adai-fitness-history.png' });
  console.log('✅ 历史页截图: /tmp/adai-fitness-history.png');
  
  await browser.close();
  console.log('\n所有截图完成！');
})();