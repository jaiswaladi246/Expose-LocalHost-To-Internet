const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const header = qs('.site-header');
const menuButton = qs('#menuButton');
const mobileNav = qs('#mobileNav');
const toast = qs('#toast');
const cursorGlow = qs('#cursorGlow');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 14);
});

menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '×' : '☰';
});

qsa('.mobile-nav a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

qsa('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
  revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    const duration = 1000;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
qsa('[data-count]').forEach((el) => counterObserver.observe(el));

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  qsa('[data-tilt], .interactive-card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const amount = card.hasAttribute('data-tilt') ? 4 : 2;
      card.style.transform = `perspective(900px) rotateY(${x * amount}deg) rotateX(${-y * amount}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

const terminalSequences = [
  {
    command: 'npm start',
    output: '<span class="dim">&gt; ngrok-devops-shack@1.0.0 start</span>\n<span class="dim">&gt; node server.js</span>\n\n<span class="ok">✓ DevOps Shack application running</span>\n<span class="blue">  http://localhost:3000</span>'
  },
  {
    command: 'ngrok http 3000',
    output: '<span class="ok">Session Status     online</span>\nAccount            DevOps Shack\nForwarding         <span class="blue">https://your-url.ngrok.app</span>\n                   → http://localhost:3000'
  },
  {
    command: 'curl http://localhost:3000/api/status',
    output: '<span class="blue">{</span>\n  "status": <span class="ok">"healthy"</span>,\n  "service": "DevOps Shack Node.js App"\n<span class="blue">}</span>'
  }
];

const typedLine = qs('#typedLine');
const terminalOutput = qs('#terminalOutput');
let sequenceIndex = 0;

function typeSequence() {
  const sequence = terminalSequences[sequenceIndex];
  typedLine.textContent = '';
  terminalOutput.innerHTML = '';
  let charIndex = 0;

  const typeChar = () => {
    typedLine.textContent = sequence.command.slice(0, charIndex + 1);
    charIndex += 1;
    if (charIndex < sequence.command.length) {
      setTimeout(typeChar, 45 + Math.random() * 35);
    } else {
      setTimeout(() => {
        terminalOutput.innerHTML = sequence.output;
        setTimeout(() => {
          sequenceIndex = (sequenceIndex + 1) % terminalSequences.length;
          typeSequence();
        }, 3000);
      }, 450);
    }
  };

  typeChar();
}
setTimeout(typeSequence, 650);

const currentOrigin = window.location.origin;
qsa('.current-origin').forEach((el) => el.textContent = currentOrigin);

function formatUptime(seconds = 0) {
  const sec = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remaining = sec % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

const sendRequest = qs('#sendRequest');
const sendRequestText = qs('#sendRequestText');
const apiResponse = qs('#apiResponse code');
const responseBadge = qs('#responseBadge');

sendRequest.addEventListener('click', async () => {
  sendRequest.disabled = true;
  sendRequestText.textContent = 'Requesting…';
  responseBadge.textContent = 'Loading';
  responseBadge.className = 'response-badge';
  const start = performance.now();

  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    const data = await response.json();
    const latency = Math.max(1, Math.round(performance.now() - start));

    apiResponse.textContent = JSON.stringify(data, null, 2);
    responseBadge.textContent = `${response.status} OK`;
    responseBadge.className = 'response-badge success';
    qs('#metricStatus').textContent = data.status === 'healthy' ? 'Healthy' : 'Online';
    qs('#metricStatusNote').textContent = data.service || 'Express backend';
    qs('#metricLatency').textContent = `${latency} ms`;
    qs('#metricUptime').textContent = formatUptime(data.uptimeSeconds);
    qs('#metricTime').textContent = new Date(data.time).toLocaleTimeString();
    showToast('Backend responded successfully');
  } catch (error) {
    apiResponse.textContent = JSON.stringify({ error: 'Request failed', details: error.message }, null, 2);
    responseBadge.textContent = 'Error';
    responseBadge.className = 'response-badge error';
    qs('#metricStatus').textContent = 'Failed';
    qs('#metricStatusNote').textContent = 'Could not reach Express';
  } finally {
    sendRequest.disabled = false;
    sendRequestText.textContent = 'Send Request';
  }
});

qs('#copyCurl').addEventListener('click', async () => {
  const command = `curl ${currentOrigin}/api/status`;
  try {
    await navigator.clipboard.writeText(command);
    showToast('curl command copied');
  } catch {
    showToast(command);
  }
});
