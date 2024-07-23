const browser = require('../scrapers/browser');

async function getInstantSound(url) {
  const regex = /^https:\/\/www\.myinstants\.com(\/.*)?$/;
  const page = await browser.getPage();

  if (!regex.test(url)) {
    return { error: 'URL invalida, assista o tutorial e tente novamente!' };
  }

  await page.goto(url);
  const sound = await page.evaluate(() => {
    const name = document.querySelector('#instant-page-title').innerText;
    const url = `https://www.myinstants.com${document.querySelector('#instant-page-button-element').getAttribute('data-url')}`;
    return { name, url };
  });

  await browser.closeAll();
  return sound;
}

module.exports = {
  getInstantSound,
};