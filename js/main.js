/* main.js — Coordination: Dual themes, Custom Cursor, Triage Chat, SVG Node Graph, and Ballot Drop */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==================== 1. CUSTOM CURSOR DOT & HOVER STATES ====================
  const cursorDot = document.querySelector('.cursor-dot');
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorDot && isFinePointer) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let initialized = false;
    const lerpFactor = 0.15; // smooth lag

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!initialized) {
        cursorX = mouseX;
        cursorY = mouseY;
        cursorDot.style.opacity = '1';
        initialized = true;
        tick();
      }
    });

    document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { if (initialized) cursorDot.style.opacity = '1'; });

    function tick() {
      cursorX += (mouseX - cursorX) * lerpFactor;
      cursorY += (mouseY - cursorY) * lerpFactor;
      cursorDot.style.left = `${cursorX}px`;
      cursorDot.style.top = `${cursorY}px`;
      requestAnimationFrame(tick);
    }

    // Add Cursor Hover expansion on interactive nodes
    const hoverables = document.querySelectorAll('a, button, .polaroid-card, .theme-dial-track, .ballot-card');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('cursor-hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('cursor-hovering'));
    });
  }

  // ==================== 2. DUAL THEMES DIAL SWITCHER ====================
  const themeDial = document.getElementById('themeDial');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'theme-paper';

  // Apply default
  document.body.className = savedTheme;

  if (themeDial) {
    themeDial.addEventListener('click', () => {
      const currentTheme = document.body.className.includes('theme-paper') ? 'theme-paper' : 'theme-noir';
      const newTheme = currentTheme === 'theme-paper' ? 'theme-noir' : 'theme-paper';

      // Toggle with smooth visual sweep
      document.body.classList.add('theme-transitioning');
      document.body.classList.remove(currentTheme);
      document.body.classList.add(newTheme);

      localStorage.setItem('portfolio-theme', newTheme);

      // Clean up class to avoid overhead on animations later
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 450);
    });
  }

  // ==================== 3. MINDORA TRIAGE CHAT ENGINE ====================
  const triageContainer = document.getElementById('triageSimulator');
  if (triageContainer) {
    const chatTimeline = [
      { sender: 'bot', text: 'Hello, I\'m Mindora Triage. Please describe your symptoms.' },
      { sender: 'user', text: 'I\'ve been feeling severe chest tightness, and my wearable heart tracker went up to 135 bpm while resting.' },
      { sender: 'bot', text: 'Telemetry confirmed. Heart Rate: 138 bpm (resting). Spikes in stress coefficient. Priority Rating: High. Routing to clinical emergency triage...' },
      { sender: 'user', text: 'Okay, grabbing my keys. I can drive over.' },
      { sender: 'bot', text: 'Caution: Do not operate a vehicle. Rest level critical. We have notified a dispatcher. Please remain seated and on the line.' }
    ];

    let timelineIndex = 1; // 0 is default bubble in HTML

    function addBubble() {
      if (timelineIndex >= chatTimeline.length) {
        // Loop back
        setTimeout(() => {
          triageContainer.innerHTML = `<div class="chat-bubble bot">Hello, I'm Mindora Triage. Please describe your symptoms.</div>`;
          timelineIndex = 1;
          setTimeout(addBubble, 2500);
        }, 6000);
        return;
      }

      const step = chatTimeline[timelineIndex];
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${step.sender}`;
      bubble.textContent = step.text;
      triageContainer.appendChild(bubble);

      // Scroll container
      triageContainer.scrollTop = triageContainer.scrollHeight;

      timelineIndex++;
      // Set delay based on text length for a natural reading flow
      const delay = Math.max(2500, step.text.length * 40);
      setTimeout(addBubble, delay);
    }

    // Start Chat sequence after a small delay
    setTimeout(addBubble, 3000);
  }

  // ==================== 4. AI RECOMMENDATION NODE GRAPH ====================
  const svg = document.getElementById('nodeGraphSvg');
  if (svg) {
    const width = 340;
    const height = 210;
    
    // Core user node
    const coreNode = { label: 'USER VINIT', x: width / 2, y: height / 2, size: 24, stroke: 'var(--accent-primary)' };
    
    // Connected item nodes
    const itemNodes = [
      { label: 'SVD Model', angle: 0, distance: 75, speed: 0.007, color: 'var(--text-primary)' },
      { label: 'Goodreads DB', angle: 1.2, distance: 70, speed: 0.009, color: 'var(--text-secondary)' },
      { label: 'MovieLens 100K', angle: 2.4, distance: 80, speed: 0.005, color: 'var(--text-secondary)' },
      { label: 'Thriller Latent', angle: 3.6, distance: 75, speed: 0.006, color: '#39A388' },
      { label: 'Collaborative Filter', angle: 4.8, distance: 85, speed: 0.004, color: 'var(--text-primary)' }
    ];

    // Build SVG Elements
    const gLinks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gNodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(gLinks);
    svg.appendChild(gNodes);

    // Instantiate lines
    const links = itemNodes.map(() => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'node-link');
      line.setAttribute('stroke', 'var(--border-medium)');
      gLinks.appendChild(line);
      return line;
    });

    // Instantiate nodes
    const nodeElements = itemNodes.map(item => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'node-circle');
      circle.setAttribute('r', '5');
      circle.setAttribute('stroke', item.color);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-label');
      text.setAttribute('dy', '-9');
      text.textContent = item.label;

      g.appendChild(circle);
      g.appendChild(text);
      gNodes.appendChild(g);

      return { group: g, item };
    });

    // Core central node elements
    const coreG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const coreCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    coreCircle.setAttribute('class', 'node-circle');
    coreCircle.setAttribute('r', '8');
    coreCircle.setAttribute('stroke', 'var(--accent-primary)');
    coreCircle.setAttribute('cx', coreNode.x);
    coreCircle.setAttribute('cy', coreNode.y);

    const coreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    coreText.setAttribute('class', 'node-label');
    coreText.setAttribute('dy', '18');
    coreText.setAttribute('x', coreNode.x);
    coreText.setAttribute('y', coreNode.y);
    coreText.setAttribute('style', 'fill: var(--accent-primary); font-weight: 700;');
    coreText.textContent = coreNode.label;

    coreG.appendChild(coreCircle);
    coreG.appendChild(coreText);
    gNodes.appendChild(coreG);

    // Physics float animation loop
    function updateNodes() {
      nodeElements.forEach((ne, i) => {
        ne.item.angle += ne.item.speed;
        
        // Trigonometric orbits
        const targetX = coreNode.x + Math.cos(ne.item.angle) * ne.item.distance;
        const targetY = coreNode.y + Math.sin(ne.item.angle) * ne.item.distance;

        // Apply transformations
        ne.group.setAttribute('transform', `translate(${targetX}, ${targetY})`);

        // Connect links
        const line = links[i];
        line.setAttribute('x1', coreNode.x);
        line.setAttribute('y1', coreNode.y);
        line.setAttribute('x2', targetX);
        line.setAttribute('y2', targetY);
      });

      requestAnimationFrame(updateNodes);
    }
    
    updateNodes();
  }

  // ==================== 5. VOTERNEXUS BALLOT DROP SIMULATOR ====================
  const ballotCard = document.getElementById('ballotCard');
  const ballotSuccess = document.getElementById('ballotSuccess');
  const ballotBoxContainer = document.querySelector('.ballot-box-container');

  if (ballotCard && ballotSuccess) {
    ballotCard.addEventListener('click', () => {
      // Trigger card drop down slot
      ballotCard.classList.add('inserted');

      setTimeout(() => {
        // Reveal success screen
        ballotSuccess.classList.add('visible');
        ballotBoxContainer.style.opacity = '0';
      }, 550);

      // Reset widgets after delay to invite fresh clicks
      setTimeout(() => {
        ballotSuccess.classList.remove('visible');
        ballotBoxContainer.style.opacity = '1';
        ballotCard.classList.remove('inserted');
      }, 4500);
    });
  }

  // ==================== 6. CHAOS MODE ARCADE TRIGGER OVERLAY ====================
  const chaosTrigger = document.getElementById('chaos-trigger');
  if (chaosTrigger) {
    chaosTrigger.addEventListener('click', () => {
      import('./chaos-transition.js').then((module) => {
        window.pixelDissolve = module.pixelDissolve;

        module.pixelDissolve('enter', () => {
          if (!document.getElementById('chaos-script')) {
            const script = document.createElement('script');
            script.id = 'chaos-script';
            script.src = './chaos/assets/index.js';
            script.type = 'module';
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.id = 'chaos-style';
            link.rel = 'stylesheet';
            link.href = './chaos/assets/index.css';
            document.head.appendChild(link);
          } else {
            // Panel already compiled and in DOM, trigger event to show
            window.dispatchEvent(new CustomEvent('show-chaos-panel'));
          }
        });
      }).catch(err => {
        console.error('Failed to load chaos transition module:', err);
      });
    });
  }
});
