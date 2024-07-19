const puppeteer = require('puppeteer');

async function setupBrowser() {
  try {
    const browser = await puppeteer.launch({    
      headless: true,
      args: [
        '--no-sandbox'
      ] 
    });
    const page = await browser.newPage();
  
    return page;
  } catch (error) {
    console.log('[ERROR] erro when setupBrowser - ', error);
  }
}

async function getInstantSound(url) {
  const regex = /^https:\/\/www\.myinstants\.com(\/.*)?$/;

  if (!regex.test(url)) {
    return { error: 'URL invalida, assista o tutorial e tente novamente!' };
  }

  const page = await setupBrowser();

  await page.goto(url);
  console.log('page', page);

  const sound = await page.evaluate(() => {
    const name = document.querySelector('#instant-page-title').innerText;
    const url = `https://www.myinstants.com${document.querySelector('#instant-page-button-element').getAttribute('data-url')}`;
    return { name, url };
  });

  await page.close();
  return sound;
}

module.exports = {
  getInstantSound,
};