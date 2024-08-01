import { getPage, closeAll } from '../infra/puppeteer'
import fs from 'fs';
import * as browser from '../infra/puppeteer'
export const getInstantSound = async (url: string) => {
  const regex = /^https:\/\/www\.myinstants\.com(\/.*)?$/;
  const page = await getPage();

  if (!regex.test(url)) {
    return { error: 'URL invalida, assista o tutorial e tente novamente!' };
  }

  await page.goto(url);
  const sound: any = await page.evaluate(() => {
    // @ts-ignore: Unreachable code error
    const name = document.querySelector('#instant-page-title').innerText;
    // @ts-ignore: Unreachable code error
    const url = `https://www.myinstants.com${document.querySelector('#instant-page-button-element').getAttribute('data-url')}`;
    return { name, url };
  });

  await closeAll();
  return sound;
}

export const downloadMp3InstantMeme = async (url: any) => {
  const { error } = await validateWebsite(url);

  if (error) return { error };

  const page = await browser.getPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.setRequestInterception(true);

  page.on('request', (request: any) => {
    // Continue with the request
    request.continue();
  });


  await page.waitForSelector('.instant-page-extra-button');
  await page.click('.instant-page-extra-button');

  page.on('response', async (response: any) => {
    console.log(`Response URL: ${response.url()}`);
    const url = response.url();
    if (url.endsWith('.mp3')) {
      console.log(`MP3 URL found: ${url}`);
      downloadMP3(url);
    }
  });

  await new Promise(resolve => setTimeout(resolve, 10000)); // Waits for 10 seconds
  await browser.closeAll();

}

export const validateWebsite = (url: any) => {
  const regex = /^https:\/\/www\.myinstants\.com(\/.*)?$/;

  if (!regex.test(url)) {
    return { error: 'URL invalida, assista o tutorial e tente novamente!' };
  }

  return { error: null };
}

export const downloadMP3 = (url: any, name?: any) => {
  // https.get(url, (response) => {
  //   response.pipe(file);
  //   file.on('finish', () => {
  //     file.close();
  //     console.log('Download completed!');
  //   });
  // }).on('error', (err) => {
  //   fs.unlink(`${name}.mp3`);
  //   console.error(`Error downloading the file: ${err.message}`);
  // });
};