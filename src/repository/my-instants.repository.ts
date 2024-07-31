import { getPage, closeAll } from '../infra/puppeteer'

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
