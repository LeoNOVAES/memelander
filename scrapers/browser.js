const puppeteer = require('puppeteer');

let browser = null;
let page = null;

const setupBrowser = async () => {
  try {
    console.log('[INFO] setting up browser');
    browser = await puppeteer.launch({    
      headless: true,
      args: [
        '--no-sandbox'
      ] 
    });  
  } catch (error) {
    console.log('[ERROR] erro when setupBrowser - ', error);
  }
};

const getPage = async () => {
  if (!browser) {
    await setupBrowser();
  };

  console.log('[INFO] create new page');

  page = await browser.newPage();
  return page;
}

const closeAll = async () => {
  console.log('[INFO] closing browser and pages');
  await page.close();
  await browser.close();
}

module.exports = {
  setupBrowser: setupBrowser,
  getPage: getPage,
  closeAll,
}
