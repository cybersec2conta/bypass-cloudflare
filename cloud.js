const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

class CyberByp {
    constructor(opts = {}) {
        this.headless = opts.headless ?? 'new';
        this.timeout = opts.timeout ?? 120000;
        this.retry = opts.retry ?? 5;
        this.browser = null;
        this.sessions = new Map();
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: this.headless,
            executablePath: process.env.CHROME_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process,AutomationControlled',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--window-position=0,0',
                '--disable-notifications',
                '--mute-audio',
                '--lang=pt-BR',
            ],
            ignoreDefaultArgs: [
                '--enable-automation',
                '--enable-blink-features=IdleDetection',
            ],
        });
        return this;
    }

    async newPage(opts = {}) {
        const page = await this.browser.newPage();
        const session = Math.random().toString(36).slice(2, 10);

        await page.evaluateOnNewDocument(() => {
            const strip = (a, b) => {
                Object.defineProperty(a, b, {
                    get: () => undefined,
                    set: () => {},
                });
            };
            strip(navigator, 'webdriver');
            strip(navigator, 'plugins');
            strip(navigator, 'mimeTypes');
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
                ]
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['pt-BR', 'pt', 'en-US', 'en', 'es', 'fr']
            });
            
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32'
            });
            
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 8
            });
            
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => 8
            });
            
            Object.defineProperty(navigator, 'maxTouchPoints', {
                get: () => 0
            });

            window.chrome = {
                runtime: { onConnect: { addListener: () => {} }, onMessage: { addListener: () => {} } },
                loadTimes: () => {},
                csi: () => {},
                app: {
                    isInstalled: false,
                    InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
                    RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
                },
                webstore: { onInstallStageChanged: {}, onDownloadProgress: {} }
            };

            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (params) => (
                params.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(params)
            );

            const getParam = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(p) {
                if (p === 37445) return 'Intel Inc.';
                if (p === 37446) return 'Intel Iris OpenGL Engine';
                if (p === 7937) return 'WebKit WebGL';
                if (p === 7938) return 'WebKit';
                return getParam.call(this, p);
            };

            const getBBox = SVGElement.prototype.getBBox;
            SVGElement.prototype.getBBox = function() {
                const r = getBBox.call(this);
                r.x += Math.random() * 0.0001;
                r.y += Math.random() * 0.0001;
                return r;
            };

            const getContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, ...args) {
                const ctx = getContext.call(this, type, ...args);
                if (ctx && type === '2d') {
                    const fillText = ctx.fillText;
                    ctx.fillText = function(...a) {
                        ctx.shadowBlur = Math.random() * 0.000001;
                        return fillText.call(this, ...a);
                    };
                }
                return ctx;
            };

            const fns = [
                'User-Agent', 'Accept', 'Accept-Language', 'Accept-Encoding',
                'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform',
                'Sec-Fetch-Site', 'Sec-Fetch-Mode', 'Sec-Fetch-Dest',
                'Upgrade-Insecure-Requests', 'Cache-Control'
            ];
            const origFetch = window.fetch;
            window.fetch = async function(...args) {
                const res = await origFetch(...args);
                return res;
            };
        });

        await page.setViewport({
            width: opts.width || 1920,
            height: opts.height || 1080,
            deviceScaleFactor: opts.dpr || 1,
            hasTouch: opts.touch ?? false,
            isLandscape: opts.landscape ?? true,
            isMobile: opts.mobile ?? false,
        });

        const ua = opts.ua || [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        ][Math.floor(Math.random() * 4)];

        await page.setUserAgent(ua);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'sec-ch-ua': '"Chromium";v="150", "Google Chrome";v="150", "Not.A=Brand";v="8"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        });

        this.sessions.set(session, { page, cookies: null, html: null, time: Date.now() });
        return { page, session };
    }

    async bypass(url, opts = {}) {
        const { page, session } = await this.newPage(opts);
        const start = Date.now();

        for (let i = 1; i <= this.retry; i++) {
            try {
                await page.goto(url, {
                    waitUntil: opts.waitUntil || 'networkidle2',
                    timeout: opts.timeout || this.timeout,
                    referer: opts.referer || undefined,
                });

                await this.solve(page, opts.timeout || this.timeout);

                if (await this.isClean(page)) {
                    const cookies = await page.cookies();
                    const html = await page.content();
                    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

                    const data = {
                        ok: true,
                        session,
                        cookies: cookies.map(c => `${c.name}=${c.value}`).join('; '),
                        cookiesJSON: cookies,
                        html,
                        time: elapsed + 's',
                        page,
                    };

                    this.sessions.set(session, { ...this.sessions.get(session), ...data });
                    return data;
                }
            } catch (e) {
                if (i === this.retry) {
                    await page.close().catch(() => {});
                    this.sessions.delete(session);
                    return { ok: false, error: e.message, session };
                }
                await this.sleep(2000 * i);
            }
        }

        await page.close().catch(() => {});
        this.sessions.delete(session);
        return { ok: false, error: 'Max retries', session };
    }

    async solve(page, timeout) {
        const start = Date.now();
        const check = async () => {
            if (await this.isClean(page)) return true;
            if (Date.now() - start > timeout) return false;
            return null;
        };

        while (Date.now() - start < timeout) {
            const result = await check();
            if (result === true) return;
            if (result === false) break;

            try {
                const frames = await page.frames();
                for (const frame of frames) {
                    const url = frame.url();
                    if (url.includes('challenges.cloudflare.com') || 
                        url.includes('turnstile') ||
                        url.includes('recaptcha')) {
                        
                        await frame.evaluate(() => {
                            const cb = document.querySelector('.cf-turnstile, .g-recaptcha, #challenge-stage');
                            if (cb) {
                                cb.click();
                                cb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                cb.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                            }
                        }).catch(() => {});
                        
                        await frame.evaluate(() => {
                            const inputs = document.querySelectorAll('input[type="checkbox"], input[type="button"], button');
                            inputs.forEach(i => {
                                i.click();
                                i.focus();
                            });
                        }).catch(() => {});
                    }
                }
            } catch (e) {}

            try {
                await page.evaluate(() => {
                    const els = document.querySelectorAll('iframe, .cf-turnstile, .g-recaptcha, #challenge-stage');
                    els.forEach(el => {
                        el.click();
                        el.focus();
                    });
                    window.scrollBy(0, Math.random() * 200 - 100);
                }).catch(() => {});
            } catch (e) {}

            try {
                const mouse = page.mouse;
                await mouse.move(
                    Math.random() * 800 + 200,
                    Math.random() * 600 + 100,
                    { steps: Math.floor(Math.random() * 10) + 5 }
                );
                await mouse.click(
                    Math.random() * 800 + 200,
                    Math.random() * 600 + 100
                );
            } catch (e) {}

            await this.sleep(1500);
        }
    }

    async isClean(page) {
        try {
            const html = await page.content();
            const title = await page.title().catch(() => '');

            const blocked = [
                'cf-challenge', 'cf-chl-', 'cf-please-wait',
                'Just a moment', 'Checking your browser',
                'DDoS protection', 'Cloudflare',
                'cf-turnstile', 'turnstile', 'challenges.cloudflare',
                'sucuri_cloudproxy', 'sucuri', 'Sucuri',
                'Incapsula', '_Incapsula_Resource',
                'PerimeterX', 'px-captcha',
                'Akamai', 'akamai',
                'DataDome', 'datadome',
                'Distil', 'distil',
                'Imperva', 'imperva',
                'Reblaze', 'reblaze',
                'blocked', 'captcha', 'challenge',
            ];

            for (const word of blocked) {
                if (html.includes(word) || title.includes(word)) return false;
            }

            const hasBlockedFrame = await page.evaluate(() => {
                const iframes = document.querySelectorAll('iframe');
                for (const iframe of iframes) {
                    if (iframe.src && (
                        iframe.src.includes('cloudflare') ||
                        iframe.src.includes('recaptcha') ||
                        iframe.src.includes('captcha') ||
                        iframe.src.includes('challenge')
                    )) return true;
                }
                return false;
            }).catch(() => false);

            if (hasBlockedFrame) return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    getSession(session) {
        return this.sessions.get(session) || null;
    }

    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async close() {
        for (const [session, data] of this.sessions) {
            await data.page.close().catch(() => {});
        }
        this.sessions.clear();
        if (this.browser) await this.browser.close().catch(() => {});
    }
}

module.exports = CyberByp;
