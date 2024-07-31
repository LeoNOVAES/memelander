import puppeteer, { Browser, Page } from 'puppeteer'

let browser: Browser;
let page: Page;

export const setupBrowser = async () => {
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

export const getPage = async () => {
    await setupBrowser();
    page = await browser.newPage();
    return page;
}

export const closeAll = async () => {
    console.log('[INFO] closing browser and pages');
    await page.close();
    await browser.close();
}

