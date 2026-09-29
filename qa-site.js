const puppeteer = require('/Users/wavveros/gods-eye-view/node_modules/puppeteer');
const path = require('path');

const targetUrl = process.env.QA_URL || 'http://127.0.0.1:4179';

(async () => {
  const browser = await puppeteer.launch({
    headless:true,
    executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args:['--no-sandbox'],
  });

  const results = [];
  for (const view of [
    {name:'desktop',width:1440,height:1000},
    {name:'tablet',width:768,height:1024},
    {name:'mobile',width:390,height:844},
  ]) {
    const page = await browser.newPage();
    const errors = [];
    const failedRequests = [];

    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({url:request.url(),reason:request.failure()?.errorText}));

    await page.evaluateOnNewDocument(() => {
      window.__qaVitals = {cls:0,lcp:0};
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => { window.__qaVitals.cls += entry.value; });
      }).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__qaVitals.lcp = entries.at(-1)?.startTime || 0;
      }).observe({type:'largest-contentful-paint',buffered:true});
    });

    await page.setViewport({width:view.width,height:view.height,deviceScaleFactor:1});
    const response = await page.goto(targetUrl, {waitUntil:'networkidle0'});
    const initialVitals = await page.evaluate(() => ({
      fcp:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
      ...window.__qaVitals,
    }));

    if (view.name !== 'desktop') {
      await page.click('.menu-button');
      const expanded = await page.$eval('.menu-button', (button) => button.getAttribute('aria-expanded'));
      if (expanded !== 'true') errors.push('Menu responsivo não abriu');
      await page.keyboard.press('Escape');
      const closed = await page.$eval('.menu-button', (button) => button.getAttribute('aria-expanded'));
      if (closed !== 'false') errors.push('Menu responsivo não fechou com Escape');
    }

    await page.click('.carousel-toggle');
    const carouselPaused = await page.evaluate(() => ({
      pressed:document.querySelector('.carousel-toggle')?.getAttribute('aria-pressed'),
      playState:getComputedStyle(document.querySelector('.client-track')).animationPlayState,
    }));
    if (carouselPaused.pressed !== 'true' || carouselPaused.playState !== 'paused') {
      errors.push('Controle do carrossel não pausou a animação');
    }
    await page.click('.carousel-toggle');

    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
      for (let y = 0; y < document.body.scrollHeight; y += Math.floor(innerHeight * .72)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((resolve) => setTimeout(resolve, 1250));

    const checks = await page.evaluate(() => {
      const brokenImages = [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute('src'));
      const unsafeBlankLinks = [...document.querySelectorAll('a[target="_blank"]')]
        .filter((link) => !link.relList.contains('noopener'))
        .map((link) => link.href);
      const metricValues = [...document.querySelectorAll('.metric-value')].map((item) => item.textContent.trim());
      const overflowingElements = [...document.querySelectorAll('body *')]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return style.position !== 'fixed' && style.overflowX === 'visible' && (bounds.right > innerWidth + 1 || bounds.left < -1);
        })
        .slice(0, 20)
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            element:`${element.tagName.toLowerCase()}.${element.className}`,
            left:Math.round(bounds.left),
            right:Math.round(bounds.right),
            width:Math.round(bounds.width),
          };
        });

      return {
        brokenImages,
        unsafeBlankLinks,
        horizontalOverflow:document.documentElement.scrollWidth > window.innerWidth + 1,
        metricValues,
        overflowingElements,
        clientCount:document.querySelectorAll('.client-set:not([aria-hidden]) .client-card').length,
        carouselCloneCount:document.querySelectorAll('.client-set[aria-hidden="true"] .client-card').length,
        carouselReady:document.querySelector('.client-track')?.classList.contains('carousel-ready') || false,
        carouselAnimation:getComputedStyle(document.querySelector('.client-track')).animationName,
        certificationCount:document.querySelectorAll('.credential:not(.credential-specialty)').length,
        specialtyCount:document.querySelectorAll('.credential-specialty').length,
        credentialLogoCount:document.querySelectorAll('.credential-logo img').length,
        processIconCount:document.querySelectorAll('.step-icon svg').length,
        insightCardCount:document.querySelectorAll('.insight-card').length,
        spendMetricCount:document.querySelectorAll('.metric-spend').length,
        resultsMetricCount:document.querySelectorAll('.results .metric').length,
        inlineWhatsappCount:document.querySelectorAll('.whatsapp-button').length,
        resultsElosCaseMentions:(document.querySelector('#resultados')?.innerText.match(/case elos|sessões no site|seguidores no linkedin/gi) || []).length,
        infoproductCardCount:document.querySelectorAll('.infoproduct-card').length,
        whatsappFloatCount:document.querySelectorAll('.whatsapp-float').length,
        heroIsFullBleed:(() => {
          const bounds = document.querySelector('.hero')?.getBoundingClientRect();
          return Boolean(bounds && Math.abs(bounds.left) <= 1 && Math.abs(bounds.width - innerWidth) <= 2);
        })(),
        heroBackgroundWidth:document.querySelector('.hero-visual img')?.naturalWidth || 0,
        typedHeadline:Boolean(document.querySelector('#hero-typed')?.dataset.words),
        typingCaretCount:document.querySelectorAll('.typing-caret').length,
        visiblePhoneNumber:document.body.innerText.includes('(41) 9 9612-8878'),
        whatsappLinks:document.querySelectorAll('a[href^="https://wa.me/5541996128878"]').length,
      };
    });

    let accessibility = {status:'unavailable',violations:[]};
    try {
      await page.addScriptTag({url:'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'});
      accessibility = await page.evaluate(async () => {
        const report = await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
        return {
          status:'scanned',
          violations:report.violations.map((violation) => ({
            id:violation.id,
            impact:violation.impact,
            nodes:violation.nodes.length,
            targets:violation.nodes.map((node) => ({target:node.target,html:node.html})),
          })),
        };
      });
    } catch (error) {
      accessibility = {status:'unavailable',error:error.message,violations:[]};
    }

    await page.screenshot({
      path:path.join(__dirname, `site-${view.name}.png`),
      fullPage:true,
    });

    results.push({
      view:view.name,
      viewport:`${view.width}x${view.height}`,
      status:response.status(),
      title:await page.title(),
      errors,
      failedRequests,
      initialVitals,
      checks,
      accessibility,
    });
    await page.close();
  }

  for (const route of [
    '/blog/',
    '/blog/marketing-para-clinica-estetica.html',
    '/blog/marketing-para-clinica-dentaria.html',
    '/blog/marketing-para-advogados.html',
    '/blog/marketing-para-academias.html',
    '/blog/gestao-de-trafego-pago.html',
    '/blog/marketing-para-infoprodutores.html',
    '/blog/marketing-para-delivery.html',
    '/blog/marketing-para-oficinas.html',
    '/blog/marketing-para-lojas-de-carros.html',
    '/blog/marketing-para-lojas-de-roupas.html',
  ]) {
    const page = await browser.newPage();
    const errors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({url:request.url(),reason:request.failure()?.errorText}));
    await page.setViewport({width:route === '/blog/' ? 390 : 1440,height:route === '/blog/' ? 844 : 1000,deviceScaleFactor:1});
    const response = await page.goto(new URL(route.replace(/^\//, ''), `${targetUrl.replace(/\/$/, '')}/`).href, {waitUntil:'networkidle0'});
    const checks = await page.evaluate(() => ({
      h1Count:document.querySelectorAll('h1').length,
      canonical:document.querySelector('link[rel="canonical"]')?.href || '',
      brokenImages:[...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      horizontalOverflow:document.documentElement.scrollWidth > window.innerWidth + 1,
      structuredDataCount:document.querySelectorAll('script[type="application/ld+json"]').length,
      visiblePhoneNumber:document.body.innerText.includes('(41) 9 9612-8878'),
    }));
    results.push({view:`blog:${route}`,status:response.status(),title:await page.title(),errors,failedRequests,checks});
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results,null,2));
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
