const puppeteer = require("puppeteer");

module.exports = async function() {
    let args = ["--disable-accelerated-2d-canvas", "--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", '--proxy-server="direct://"', "--proxy-bypass-list=*"];

    global.__BROWSER__ = await puppeteer.launch({
        headless: !process.env.PSP_PAUSE_ON_FAILURE,
        devtools: !!process.env.PSP_PAUSE_ON_FAILURE,
        args
    });
    process.env.PSP_BROWSER_ENDPOINT = global.__BROWSER__.wsEndpoint();
};
