(function () {
  'use strict';

  const measurementId = 'G-84D2LJGPH1';
  const campaignKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term'
  ];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(googleTag);

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  const currentCampaign = Object.fromEntries(
    campaignKeys
      .map((key) => [key, new URLSearchParams(window.location.search).get(key)])
      .filter(([, value]) => value)
  );

  if (Object.keys(currentCampaign).length) {
    try {
      sessionStorage.setItem('vyve_campaign', JSON.stringify(currentCampaign));
    } catch (_) {
      // O rastreamento continua mesmo quando o armazenamento está indisponível.
    }
  }

  let campaign = currentCampaign;
  if (!Object.keys(campaign).length) {
    try {
      campaign = JSON.parse(sessionStorage.getItem('vyve_campaign') || '{}');
    } catch (_) {
      campaign = {};
    }
  }

  const track = (eventName, parameters) => {
    window.gtag('event', eventName, {
      ...campaign,
      ...parameters
    });
  };

  const linkContext = (link) => {
    const section = link.closest('section, header, footer, article, aside');
    return {
      link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100),
      link_url: link.href.split('?')[0],
      content_group: section?.id || section?.classList?.[0] || 'global'
    };
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.href;
    const context = linkContext(link);

    if (/wa\.me|whatsapp\.com/i.test(href)) {
      track('whatsapp_click', context);
      track('generate_lead', {...context, lead_source: 'whatsapp'});
      return;
    }

    if (/^mailto:/i.test(link.getAttribute('href') || '')) {
      track('email_click', context);
      track('generate_lead', {...context, lead_source: 'email'});
      return;
    }

    if (link.matches('.button, .nav-cta, .text-link, [data-analytics="cta"]')) {
      track('cta_click', context);
      return;
    }

    if (link.hostname && link.hostname !== window.location.hostname) {
      track('outbound_click', context);
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const formContext = {
      form_id: form.id || 'sem_id',
      form_name: form.getAttribute('name') || form.getAttribute('aria-label') || 'formulario_site'
    };
    track('form_submit', formContext);
    track('generate_lead', {...formContext, lead_source: 'form'});
  });
})();
