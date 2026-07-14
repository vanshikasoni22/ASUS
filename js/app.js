// ASUS Retail Demo Ecosystem — Interactive Prototype Engine
// Contains state storage, navigation routing, simulation routines, and mock assets.

(function() {

  // ==========================================
  // TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3400);
  }

  window.showToast = showToast;

  // ==========================================
  // GLOBAL STATE
  // ==========================================
  const appState = {
    activePage: 'cover', // cover, ds, retail, cms, flow, sandbox, assets
    userRole: 'Super Admin',
    activeSKU: 'CX3402',
    isLoggedIn: false,
    
    // Shared Content Database
    uploadedAssets: [
      { id: 'ast-01', title: 'Chromebook Plus Hero Banner', type: 'image', sku: 'CX3402', tags: 'Landing, Hero', date: '2026-07-10', url: 'assets/asus_chromebook_hero.png', desc: 'Main high-res display image for retail Chromebook CM3.' },
      { id: 'ast-02', title: 'Attract Mode Screensaver', type: 'image', sku: 'All SKUs', tags: 'Idle, Attract', date: '2026-07-12', url: 'assets/asus_attract_loop.png', desc: 'Enterprise idle marketing slide showing ChromeOS Plus benefits.' },
      { id: 'ast-03', title: 'Military Grade Specs Video', type: 'video', sku: 'B5402', tags: 'Specs, Durability', date: '2026-07-14', url: '', desc: 'Product stress test video illustrating MIL-STD 810H standards.' }
    ],
    
    // Content Assignments
    assignments: [
      { assetId: 'ast-01', assetTitle: 'Chromebook Plus Hero Banner', sku: 'CX3402', scope: 'North & West Regions', date: '2026-07-14 10:12', status: 'Synced' },
      { assetId: 'ast-02', assetTitle: 'Attract Mode Screensaver', sku: 'All SKUs', scope: 'National Stores', date: '2026-07-14 09:45', status: 'Synced' }
    ],
    
    // Devices State
    devices: {
      total: 1248,
      online: 1156,
      offline: 92,
      regions: {
        'North': { online: 312, offline: 20 },
        'West': { online: 280, offline: 14 },
        'South': { online: 356, offline: 41 },
        'East': { online: 300, offline: 17 }
      }
    }
  };

  // KSPs (Key Selling Points)
  const kspData = [
    {
      kicker: 'Durability',
      title: 'Military Grade Durability',
      text: 'Tested to rigorous US MIL-STD 810H standards. Protects against accidental drops, pressure weight, and liquid spills on keyboard.',
      icon: '🛡️'
    },
    {
      kicker: 'Performance',
      title: 'AI-Powered Intel Core Processor',
      text: 'Features the latest Intel Core i3/i5 processor with integrated AI acceleration. Speeds up photo edits and enhances video calls.',
      icon: '⚡'
    },
    {
      kicker: 'Battery Life',
      title: '10-Hour All-Day Battery',
      text: 'High-density battery cells deliver up to 10 hours of productivity on a single charge. Work anywhere without power-point anxiety.',
      icon: '🔋'
    },
    {
      kicker: 'Display',
      title: 'Vibrant Full HD Touch Screen',
      text: '14-inch anti-glare display with narrow bezels and optional touch panel support. Offers fluid navigation and crisp color calibration.',
      icon: '🖥️'
    },
    {
      kicker: 'Fast Charge',
      title: 'Rapid Charging Technology',
      text: 'Juice up your Chromebook from 0% to 60% in just 49 minutes via universal USB-C Power Delivery. Minimal downtime.',
      icon: '🔌'
    },
    {
      kicker: 'Design',
      title: 'Ultra-Lightweight Profile',
      text: 'Weighs only 1.44 kg with a modern thin-bezel chassis. Slides effortlessly into sleeves and backpacks for total mobile freedom.',
      icon: '💼'
    }
  ];

  // ==========================================
  // DOM ELEMENT SELECTORS
  // ==========================================
  const select = (id) => document.getElementById(id);
  const selectAll = (selector) => document.querySelectorAll(selector);

  // ==========================================
  // WORKBENCH SIDEBAR ROUTER
  // ==========================================
  function initWorkbenchRouter() {
    const navItems = selectAll('.workbench-nav-item');
    const pages = selectAll('.workbench-page');
    const headerTitle = select('.workbench-header-title');

    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        
        // Update active class
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        pages.forEach(page => page.classList.remove('active'));
        const activePageEl = select(`page-${targetPage}`);
        if (activePageEl) activePageEl.classList.add('active');

        // Update header text
        const pageTitle = this.querySelector('.page-name').textContent;
        const pageNum = this.querySelector('.page-num').textContent;
        if (headerTitle) {
          headerTitle.textContent = `${pageNum}  ·  ${pageTitle}`;
        }
        
        appState.activePage = targetPage;
        
        // Trigger specific entry points
        if (targetPage === 'retail') {
          restartRetailSimulation();
        } else if (targetPage === 'cms') {
          syncCMSView();
        }
      });
    });
  }

  // ==========================================
  // PRODUCT 1: RETAIL DEMO SIMULATOR STATE
  // ==========================================
  let retailTimer = null;
  let idleTimer = null;
  let activeKspIndex = 0;
  let activeMediaIndex = 0;
  let isVideoPlaying = false;
  let videoProgressTimer = null;
  let videoPercent = 0;
  let attractIndex = 0;
  let attractTimer = null;

  // Active Retail Screen control
  function showRtScreen(screenId) {
    const screens = selectAll('.rt-screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = select(screenId);
    if (target) {
      target.classList.add('active');
    }

    // Reset inactivity timer for anything except idle attract mode
    if (screenId !== 'rt-idle') {
      resetInactivityTimer();
    }
    
    // Trigger screen-specific functions
    if (screenId === 'rt-splash') {
      runSplashProcess();
    } else if (screenId === 'rt-sku') {
      runSKUProcess();
    } else if (screenId === 'rt-home') {
      // Home setup
    } else if (screenId === 'rt-ksp') {
      renderKsp();
    } else if (screenId === 'rt-specs') {
      // Specs setup
    } else if (screenId === 'rt-media') {
      renderMedia();
    } else if (screenId === 'rt-idle') {
      runAttractLoop();
    }
  }

  function restartRetailSimulation() {
    clearTimeout(retailTimer);
    clearTimeout(attractTimer);
    clearInterval(videoProgressTimer);
    isVideoPlaying = false;
    showRtScreen('rt-splash');
  }

  function resetInactivityTimer() {
    clearTimeout(idleTimer);
    // Timeout of 15 seconds for demonstration purposes
    idleTimer = setTimeout(() => {
      showRtScreen('rt-idle');
    }, 15000);
  }

  // RT-01 Splash process
  function runSplashProcess() {
    const spinner = select('rt-splash-spinner');
    if (spinner) spinner.style.display = 'block';
    
    retailTimer = setTimeout(() => {
      showRtScreen('rt-sku');
    }, 3000); // 3 seconds splash
  }

  // RT-02 SKU Detection process
  function runSKUProcess() {
    const logs = select('rt-sku-logs');
    const scanningCard = select('rt-sku-card-content');
    
    const logMessages = [
      'Initializing ChromeOS firmware handshake...',
      'Requesting hardware SKU registers...',
      'Mapping hardware ID to ASUS SKU library...',
      'Successfully verified SKU: CX3402 (ASUS Chromebook Plus CX34)'
    ];

    let step = 0;
    logs.textContent = logMessages[0];
    
    const logInterval = setInterval(() => {
      step++;
      if (step < logMessages.length) {
        logs.textContent = logMessages[step];
      } else {
        clearInterval(logInterval);
        // Completed scan
        setTimeout(() => {
          showRtScreen('rt-home');
        }, 1200);
      }
    }, 800);
  }

  // RT-04 KSPs Carousel
  function renderKsp() {
    const ksp = kspData[activeKspIndex];
    select('rt-ksp-num').textContent = `Highlight ${activeKspIndex + 1} of ${kspData.length}`;
    select('rt-ksp-kicker').textContent = ksp.kicker;
    select('rt-ksp-title').textContent = ksp.title;
    select('rt-ksp-text').textContent = ksp.text;
    select('rt-ksp-icon').textContent = ksp.icon;

    // Dots
    const dotsContainer = select('rt-ksp-dots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < kspData.length; i++) {
      const dot = document.createElement('div');
      dot.className = `rt-dot ${i === activeKspIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        activeKspIndex = i;
        renderKsp();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // RT-06 Media Gallery Carousel
  const mediaItems = [
    { type: 'image', url: 'assets/asus_chromebook_hero.png', title: 'Product Shot' },
    { type: 'image', url: 'assets/asus_attract_loop.png', title: 'Signage Concept' },
    { type: 'video', url: '', title: 'Military Durability stress test' }
  ];

  function renderMedia() {
    const current = mediaItems[activeMediaIndex];
    const viewer = select('rt-media-viewer');
    
    // Clear playing video
    clearInterval(videoProgressTimer);
    isVideoPlaying = false;
    
    if (current.type === 'image') {
      viewer.innerHTML = `<img src="${current.url}" alt="${current.title}">`;
    } else {
      viewer.innerHTML = `
        <div class="rt-video-overlay" id="vid-overlay">
          <button class="rt-video-play-btn" id="vid-play-btn">▶</button>
          <div style="margin-top: 100px; font-weight: 500; font-size: 13px;">ASUS Retail Stress Test Video (Simulated)</div>
        </div>
        <div class="rt-video-controls">
          <button class="btn btn-primary btn-icon" id="vid-play-small" style="width: 24px; height: 24px; font-size: 10px;">▶</button>
          <span style="font-size: 11px;" id="vid-time">0:00 / 0:30</span>
          <div class="rt-video-progress" id="vid-progress">
            <div class="rt-video-progress-bar" id="vid-progress-bar" style="width: 0%"></div>
          </div>
        </div>
      `;
      
      // Video Play button actions
      const playBtn = select('vid-play-btn');
      const playSmallBtn = select('vid-play-small');
      const overlay = select('vid-overlay');
      const progressBar = select('vid-progress-bar');
      const timeLabel = select('vid-time');
      
      const togglePlay = () => {
        isVideoPlaying = !isVideoPlaying;
        if (isVideoPlaying) {
          overlay.style.display = 'none';
          playSmallBtn.textContent = '⏸';
          
          videoProgressTimer = setInterval(() => {
            videoPercent += 3.33; // 30 seconds total
            if (videoPercent >= 100) {
              videoPercent = 0;
              isVideoPlaying = false;
              overlay.style.display = 'flex';
              playSmallBtn.textContent = '▶';
              progressBar.style.width = '0%';
              timeLabel.textContent = '0:00 / 0:30';
              clearInterval(videoProgressTimer);
            } else {
              progressBar.style.width = `${videoPercent}%`;
              const seconds = Math.floor((videoPercent / 100) * 30);
              timeLabel.textContent = `0:${seconds < 10 ? '0' + seconds : seconds} / 0:30`;
            }
          }, 1000);
        } else {
          overlay.style.display = 'flex';
          playSmallBtn.textContent = '▶';
          clearInterval(videoProgressTimer);
        }
      };

      playBtn.addEventListener('click', togglePlay);
      playSmallBtn.addEventListener('click', togglePlay);
    }

    // Render thumbs
    const thumbsContainer = select('rt-media-thumbs');
    thumbsContainer.innerHTML = '';
    mediaItems.forEach((item, index) => {
      const thumb = document.createElement('div');
      thumb.className = `rt-media-thumb ${index === activeMediaIndex ? 'active' : ''}`;
      
      if (item.type === 'image') {
        thumb.innerHTML = `<img src="${item.url}" alt="${item.title}">`;
      } else {
        thumb.innerHTML = `<div style="font-size: 24px;">🎥</div>`;
      }

      thumb.addEventListener('click', () => {
        activeMediaIndex = index;
        videoPercent = 0;
        renderMedia();
      });
      thumbsContainer.appendChild(thumb);
    });
  }

  // RT-07 Attract screensaver loops
  const attractSlides = [
    { title: 'ASUS Chromebook Plus', desc: 'Unleash productivity with cloud sync capabilities.', bg: 'assets/asus_attract_loop.png' },
    { title: 'Military Grade Testing', desc: 'Engineered to withstand everyday impacts.', bg: 'assets/asus_chromebook_hero.png' },
    { title: 'All Day Battery Endurance', desc: 'Keep running for up to 10 hours without a charge.', bg: 'assets/asus_attract_loop.png' }
  ];

  function runAttractLoop() {
    const slide = attractSlides[attractIndex];
    const idleImage = select('rt-idle-img');
    const title = select('rt-idle-title');
    const desc = select('rt-idle-desc');
    
    if (idleImage) {
      idleImage.style.opacity = '0';
      setTimeout(() => {
        idleImage.src = slide.bg;
        title.textContent = slide.title;
        desc.textContent = slide.desc;
        idleImage.style.opacity = '0.9';
      }, 300);
    }

    clearTimeout(attractTimer);
    attractTimer = setTimeout(() => {
      attractIndex = (attractIndex + 1) % attractSlides.length;
      runAttractLoop();
    }, 4000); // Cross-fade slides every 4 seconds
  }

  // Setup Event listeners inside the retail app
  function initRetailAppListeners() {
    // Splash screen click skips
    select('rt-splash-skip').addEventListener('click', () => {
      clearTimeout(retailTimer);
      showRtScreen('rt-sku');
    });

    // SKU Skip
    select('rt-sku-btn').addEventListener('click', () => {
      showRtScreen('rt-home');
    });

    // Home buttons
    select('rt-home-ksp-btn').addEventListener('click', () => {
      activeKspIndex = 0;
      showRtScreen('rt-ksp');
    });
    select('rt-home-specs-btn').addEventListener('click', () => showRtScreen('rt-specs'));
    select('rt-home-media-btn').addEventListener('click', () => {
      activeMediaIndex = 0;
      videoPercent = 0;
      showRtScreen('rt-media');
    });
    select('rt-home-preview-btn').addEventListener('click', () => showRtScreen('rt-idle'));

    // KSP buttons
    select('rt-ksp-prev').addEventListener('click', () => {
      activeKspIndex = (activeKspIndex - 1 + kspData.length) % kspData.length;
      renderKsp();
    });
    select('rt-ksp-next').addEventListener('click', () => {
      activeKspIndex = (activeKspIndex + 1) % kspData.length;
      renderKsp();
    });
    select('rt-ksp-home').addEventListener('click', () => showRtScreen('rt-home'));

    // Specs buttons
    select('rt-specs-back').addEventListener('click', () => showRtScreen('rt-ksp'));
    select('rt-specs-next').addEventListener('click', () => showRtScreen('rt-media'));

    // Media buttons
    select('rt-media-back').addEventListener('click', () => showRtScreen('rt-specs'));
    select('rt-media-next').addEventListener('click', () => showRtScreen('rt-idle'));

    // Idle wakeup
    select('rt-idle-wake').addEventListener('click', () => {
      clearTimeout(attractTimer);
      showRtScreen('rt-home');
    });

    // Any key press resets inactivity timer inside tablet
    select('tablet-viewport').addEventListener('click', () => {
      resetInactivityTimer();
    });
  }

  // ==========================================
  // PRODUCT 2: CMS ADMIN PORTAL LOGIC
  // ==========================================
  function showCmsScreen(screenId) {
    const screens = selectAll('.cms-screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = select(screenId);
    if (target) {
      target.classList.add('active');
    }
    
    // Sync nav active class
    const navItems = selectAll('.cms-nav-item');
    navItems.forEach(item => {
      const page = item.getAttribute('data-cms-page');
      if (page && screenId === `cms-${page}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (screenId === 'cms-dash') {
      renderCMSDashboard();
    } else if (screenId === 'cms-upload') {
      renderCMSUpload();
    } else if (screenId === 'cms-assign') {
      renderCMSAssignment();
    } else if (screenId === 'cms-schedule') {
      renderCMSScheduling();
    } else if (screenId === 'cms-reports') {
      renderCMSReports();
    }
  }

  function syncCMSView() {
    if (!appState.isLoggedIn) {
      showCmsScreen('cms-login');
    } else {
      showCmsScreen('cms-dash');
    }
  }

  // CMS Login
  function initCMSLogin() {
    const loginBtn = select('cms-login-submit');
    const roleChips = selectAll('#cms-role-chips .chip');

    roleChips.forEach(chip => {
      chip.addEventListener('click', function() {
        roleChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        appState.userRole = this.getAttribute('data-role');
        
        const note = select('cms-role-note');
        if (appState.userRole === 'Super Admin') {
          note.textContent = 'Super Admin has access to national filters & all regional stores.';
        } else {
          note.textContent = 'Regional Admin is restricted to Southern regional units.';
        }
      });
    });

    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      appState.isLoggedIn = true;
      
      // Update User Panel info
      select('cms-user-role-label').textContent = appState.userRole;
      select('cms-username-label').textContent = appState.userRole === 'Super Admin' ? 'Vanshika Soni' : 'John Doe (Region South)';
      
      // Show user panel
      select('cms-user-panel-box').style.display = 'flex';
      
      showCmsScreen('cms-dash');
    });

    // Sign out button
    select('cms-sign-out').addEventListener('click', function() {
      appState.isLoggedIn = false;
      select('cms-user-panel-box').style.display = 'none';
      showCmsScreen('cms-login');
    });
  }

  // Dashboard Renderer
  function renderCMSDashboard() {
    // Sync Metrics based on user role and upload lists
    select('cms-metric-devices').innerHTML = `${appState.devices.online.toLocaleString()}<span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">/ ${appState.devices.total}</span>`;
    select('cms-metric-products').textContent = appState.activeSKU === 'All SKUs' ? '3 Active' : '1 Active';
    select('cms-metric-uploads').textContent = appState.uploadedAssets.length;
    select('cms-metric-assignments').textContent = appState.assignments.length;

    // Render Recent Uploads Table
    const uploadBody = select('cms-dash-recent-uploads');
    uploadBody.innerHTML = '';
    // Show last 3
    const recent = appState.uploadedAssets.slice().reverse().slice(0, 3);
    recent.forEach(asset => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="font-weight:600;">${asset.title}</div><div class="asset-meta" style="font-size: 10px; color: var(--text-muted);">${asset.desc}</div></td>
        <td><span class="chip-status ${asset.type === 'video' ? 'chip-status-online' : 'chip-status-offline'}" style="font-size: 10px; padding: 1px 6px;">${asset.type.toUpperCase()}</span></td>
        <td><strong>${asset.sku}</strong></td>
        <td>${asset.date}</td>
      `;
      uploadBody.appendChild(tr);
    });

    // Render Latest Assignments Table
    const assignBody = select('cms-dash-recent-syncs');
    assignBody.innerHTML = '';
    const lastAssign = appState.assignments.slice().reverse().slice(0, 3);
    lastAssign.forEach(as => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="font-weight:600;">${as.assetTitle}</div></td>
        <td><span class="chip-status chip-status-online" style="font-size: 10px; padding: 1px 6px;">${as.status}</span></td>
        <td>${as.scope}</td>
        <td>${as.date}</td>
      `;
      assignBody.appendChild(tr);
    });

    // Interactive Map Tooltip Logic
    const nodes = selectAll('.map-node');
    const tooltip = select('map-tooltip');
    
    nodes.forEach(node => {
      node.addEventListener('mouseenter', function(e) {
        const store = this.getAttribute('data-store');
        const status = this.getAttribute('data-status');
        const region = this.getAttribute('data-region');
        
        tooltip.innerHTML = `<strong>${store}</strong><br>Region: ${region}<br>Status: <span style="color: ${status === 'online' ? '#1E8E3E' : '#D93025'}; font-weight: bold;">${status.toUpperCase()}</span>`;
        tooltip.style.display = 'block';
        
        // Position
        const rect = this.closest('.map-placeholder').getBoundingClientRect();
        const nodeRect = this.getBoundingClientRect();
        tooltip.style.left = `${nodeRect.left - rect.left + 15}px`;
        tooltip.style.top = `${nodeRect.top - rect.top - 10}px`;
      });

      node.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      node.addEventListener('click', function() {
        const store = this.getAttribute('data-store');
        showToast(`Ping report requested for ${store} — Status: 200 OK`, 'success');
      });
    });
  }

  // Upload Screen Renderer
  function renderCMSUpload() {
    const listBody = select('cms-upload-asset-list');
    
    const refreshList = () => {
      listBody.innerHTML = '';
      appState.uploadedAssets.forEach(asset => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${asset.title}</strong></td>
          <td><span class="chip" style="padding: 2px 8px; font-size: 10px;">${asset.type.toUpperCase()}</span></td>
          <td><code>${asset.sku}</code></td>
          <td>${asset.tags}</td>
          <td>${asset.date}</td>
          <td><button class="btn btn-secondary btn-icon delete-asset-btn" data-id="${asset.id}" style="width: 24px; height: 24px; font-size: 10px;">🗑️</button></td>
        `;
        listBody.appendChild(tr);
      });

      // Add delete handlers
      selectAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          appState.uploadedAssets = appState.uploadedAssets.filter(a => a.id !== id);
            appState.assignments = appState.assignments.filter(a => a.assetId !== id);
            showToast('Asset removed from catalog. Existing assignments cleared.', 'error');
            refreshList();
        });
      });
    };

    refreshList();
  }

  // Assignment Screen Renderer
  let selectedAssetId = 'ast-01';
  let targetRegion = [];
  let targetSku = 'CX3402';
  let targetStores = [];

  function renderCMSAssignment() {
    // Populate Asset Select Dropdown
    const assetSelect = select('cms-assign-asset-select');
    assetSelect.innerHTML = '';
    appState.uploadedAssets.forEach(asset => {
      const opt = document.createElement('option');
      opt.value = asset.id;
      opt.textContent = `${asset.title} (${asset.type.toUpperCase()}) - ${asset.sku}`;
      if (asset.id === selectedAssetId) {
        opt.selected = true;
      }
      assetSelect.appendChild(opt);
    });

    const updateSummary = () => {
      const asset = appState.uploadedAssets.find(a => a.id === selectedAssetId);
      const summaryText = select('cms-assign-summary-desc');
      const badgeCount = select('cms-assign-device-count');
      
      if (!asset) {
        summaryText.innerHTML = '<span style="color: var(--error);">No asset selected.</span>';
        badgeCount.textContent = '0 devices';
        return;
      }

      const regionList = targetRegion.length > 0 ? targetRegion.join(', ') : 'All Regions';
      const storeList = targetStores.length > 0 ? targetStores.join(', ') : 'All Retail Partners';
      
      let count = 1248; // Total
      if (targetRegion.length > 0) {
        count = 0;
        targetRegion.forEach(r => {
          const stats = appState.devices.regions[r];
          if (stats) count += stats.online + stats.offline;
        });
      }

      summaryText.innerHTML = `
        Assigning Asset: <strong>${asset.title}</strong><br>
        Target Model SKU: <code>${targetSku}</code><br>
        Target Geography: <strong>${regionList}</strong><br>
        Retail Outlets: <strong>${storeList}</strong>
      `;
      badgeCount.textContent = `${count} target devices`;
    };

    // Listen to selections
    assetSelect.addEventListener('change', function() {
      selectedAssetId = this.value;
      updateSummary();
    });

    // SKU selection
    const skuChips = selectAll('#cms-assign-sku-chips .chip');
    skuChips.forEach(chip => {
      chip.addEventListener('click', function() {
        skuChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        targetSku = this.getAttribute('data-sku');
        updateSummary();
      });
    });

    // Region chips (multiple selections)
    const regionChips = selectAll('#cms-assign-region-chips .chip');
    regionChips.forEach(chip => {
      chip.addEventListener('click', function() {
        const reg = this.getAttribute('data-region');
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          targetRegion = targetRegion.filter(r => r !== reg);
        } else {
          this.classList.add('active');
          targetRegion.push(reg);
        }
        updateSummary();
      });
    });

    // Store chips
    const storeChips = selectAll('#cms-assign-store-chips .chip');
    storeChips.forEach(chip => {
      chip.addEventListener('click', function() {
        const store = this.getAttribute('data-store');
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          targetStores = targetStores.filter(s => s !== store);
        } else {
          this.classList.add('active');
          targetStores.push(store);
        }
        updateSummary();
      });
    });

    updateSummary();
  }

  // Scheduling Screen Renderer
  function renderCMSScheduling() {
    const schedSelect = select('cms-sched-asset-select');
    schedSelect.innerHTML = '';
    appState.uploadedAssets.forEach(asset => {
      const opt = document.createElement('option');
      opt.value = asset.id;
      opt.textContent = `${asset.title} - ${asset.sku}`;
      schedSelect.appendChild(opt);
    });

    // Render mock active schedule table
    const schedBody = select('cms-sched-active-schedules');
    schedBody.innerHTML = '';
    appState.assignments.forEach((as, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${as.assetTitle}</strong></td>
        <td><code>${as.sku}</code></td>
        <td>Immediate Run</td>
        <td>No Expiration</td>
        <td><span class="chip-status chip-status-online" style="padding:1px 6px;">Active</span></td>
        <td><button class="btn btn-secondary btn-icon cancel-sched-btn" data-index="${i}" style="width:24px; height:24px; font-size:10px;">✕</button></td>
      `;
      schedBody.appendChild(tr);
    });

    // Add cancel handlers
    selectAll('.cancel-sched-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        appState.assignments.splice(index, 1);
          showToast('Schedule cancelled and removed from active timelines.', 'error');
          renderCMSScheduling();
      });
    });
  }

  // Reports Screen Renderer
  function renderCMSReports() {
    const deviceReportBody = select('cms-reports-device-list');
    deviceReportBody.innerHTML = '';
    
    // 5 mock devices with stats
    const mockDevices = [
      { serial: 'ASUS-CB-84938', model: 'CX3402', store: 'ASUS Store Manhattan', region: 'North', cpu: '14%', ram: '4.2GB/8.0GB', status: 'Online', lastSync: '10 mins ago' },
      { serial: 'ASUS-CB-29402', model: 'CX3402', store: 'Best Buy Seattle', region: 'West', cpu: '8%', ram: '3.9GB/8.0GB', status: 'Online', lastSync: '3 mins ago' },
      { serial: 'ASUS-TB-10294', model: 'CM3000', store: 'Costco San Francisco', region: 'West', cpu: '22%', ram: '3.1GB/4.0GB', status: 'Online', lastSync: '1 hour ago' },
      { serial: 'ASUS-CB-49502', model: 'CX5500', store: 'Walmart Dallas', region: 'South', cpu: '0%', ram: '- / -', status: 'Offline', lastSync: '1 day ago' },
      { serial: 'ASUS-CB-30492', model: 'B5402', store: 'ASUS Store Miami', region: 'South', cpu: '12%', ram: '6.1GB/16.0GB', status: 'Online', lastSync: '4 mins ago' }
    ];

    mockDevices.forEach(dev => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${dev.serial}</code></td>
        <td><strong>${dev.model}</strong></td>
        <td>${dev.store}</td>
        <td>${dev.region}</td>
        <td>${dev.cpu}</td>
        <td>${dev.ram}</td>
        <td><span class="chip-status ${dev.status === 'Online' ? 'chip-status-online' : 'chip-status-offline'}" style="padding:1px 6px;">${dev.status}</span></td>
        <td>${dev.lastSync}</td>
      `;
      deviceReportBody.appendChild(tr);
    });
  }

  // Setup Event listeners for CMS
  function initCMSListeners() {
    // Upload content submit
    select('cms-upload-submit').addEventListener('click', function(e) {
      e.preventDefault();
      const title = select('cms-upload-title').value.trim();
      const sku = select('cms-upload-sku').value;
      const type = select('cms-upload-type').value;
      const desc = select('cms-upload-desc').value.trim();
      const tags = select('cms-upload-tags').value.trim();

      if (!title) {
        showToast('Please provide an asset title before publishing.', 'error');
        return;
      }

      // Add to state
      const newAsset = {
        id: `ast-0${appState.uploadedAssets.length + 1}`,
        title,
        type,
        sku,
        tags: tags || 'General',
        date: new Date().toISOString().split('T')[0],
        url: type === 'image' ? 'assets/asus_attract_loop.png' : '',
        desc: desc || 'Uploaded marketing asset.'
      };

      appState.uploadedAssets.push(newAsset);
      
      // Reset form
      select('cms-upload-title').value = '';
      select('cms-upload-desc').value = '';
      select('cms-upload-tags').value = '';
      
      showToast('Asset published to catalog. Sync dispatched to target devices.', 'success');
      renderCMSUpload();
    });

    // Drag and drop click trigger input select
    select('cms-drag-zone-img').addEventListener('click', () => {
      select('cms-upload-type').value = 'image';
      showToast('Mock file selected: ASUS JPEG campaign asset ready.', 'info');
      select('cms-upload-title').value = 'Campaign Banner Spec Shot';
      select('cms-upload-tags').value = 'Promo, Winter26';
    });
    select('cms-drag-zone-vid').addEventListener('click', () => {
      select('cms-upload-type').value = 'video';
      showToast('Mock file selected: Stress test MP4 video ready for upload.', 'info');
      select('cms-upload-title').value = 'Chassis Shock Test Loop';
      select('cms-upload-tags').value = 'Video, Hardware';
    });

    // Assignment Save
    select('cms-assign-submit').addEventListener('click', function(e) {
      e.preventDefault();
      const asset = appState.uploadedAssets.find(a => a.id === selectedAssetId);
      if (!asset) {
        showToast('Please select an asset before dispatching.', 'error');
        return;
      }

      const scopeList = targetRegion.length > 0 ? targetRegion.join(' / ') : 'National';
      
      const newAssign = {
        assetId: asset.id,
        assetTitle: asset.title,
        sku: targetSku,
        scope: `${scopeList} stores (${targetStores.length > 0 ? targetStores.join(', ') : 'All Partners'})`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Synced'
      };

      appState.assignments.push(newAssign);
      showToast('Distribution rules saved. Sync signal dispatched to all target devices.', 'success');
      showCmsScreen('cms-dash');
    });

    // Schedule Save
    select('cms-sched-submit').addEventListener('click', function(e) {
      e.preventDefault();
      const assetSelect = select('cms-sched-asset-select');
      const asset = appState.uploadedAssets.find(a => a.id === assetSelect.value);
      
      if (!asset) {
        showToast('Please select an asset to schedule.', 'error');
        return;
      }

      const startDate = select('cms-sched-start').value || 'Immediate';
      const endDate = select('cms-sched-end').value || 'Indefinite';

      const newAssign = {
        assetId: asset.id,
        assetTitle: `${asset.title} (Scheduled: ${startDate} to ${endDate})`,
        sku: asset.sku,
        scope: 'Scheduled Stores',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Synced'
      };

      appState.assignments.push(newAssign);
      showToast(`Schedule published for "${asset.title}". Distribution timeline active.`, 'success');
      renderCMSScheduling();
    });

    // Report Downloads Trigger Simulation
    const runExport = (format) => {
      const btnText = select(`btn-export-${format.toLowerCase()}`);
      const originalText = btnText.innerHTML;
      btnText.innerHTML = `<span class="rt-spinner" style="width:12px; height:12px; border-width:2px; display:inline-block; margin-right:6px;"></span> Generating...`;
      btnText.disabled = true;

      setTimeout(() => {
        btnText.innerHTML = originalText;
        btnText.disabled = false;
        
        // Dispatch actual file download download
        const blobContent = generateMockReportData(format);
        const blob = new Blob([blobContent], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ASUS-RetailDemo-Report-${new Date().toISOString().slice(0,10)}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    };

    select('btn-export-csv').addEventListener('click', () => runExport('CSV'));
    select('btn-export-excel').addEventListener('click', () => runExport('XLS'));
    select('btn-export-pdf').addEventListener('click', () => runExport('PDF'));

    // CMS Inner navigation routing clicks
    const cmsNavLinks = selectAll('[data-cms-page]');
    cmsNavLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-cms-page');
        showCmsScreen(`cms-${page}`);
      });
    });
  }

  function generateMockReportData(format) {
    if (format === 'CSV') {
      return "Serial,Model,Store,Region,CPU_Usage,RAM_Usage,Status,Last_Sync\n" +
             "ASUS-CB-84938,CX3402,ASUS Store Manhattan,North,14%,4.2GB/8.0GB,Online,10 mins ago\n" +
             "ASUS-CB-29402,CX3402,Best Buy Seattle,West,8%,3.9GB/8.0GB,Online,3 mins ago\n" +
             "ASUS-TB-10294,CM3000,Costco San Francisco,West,22%,3.1GB/4.0GB,Online,1 hour ago\n" +
             "ASUS-CB-49502,CX5500,Walmart Dallas,South,0%,- / -,Offline,1 day ago\n" +
             "ASUS-CB-30492,B5402,ASUS Store Miami,South,12%,6.1GB/16.0GB,Online,4 mins ago\n";
    } else if (format === 'XLS') {
      return "[XML-Excel Worksheet Summary]\n" +
             "Worksheet: Device Status Report\n" +
             "Online count: 1156\n" +
             "Offline count: 92\n" +
             "Sync Success rate: 92.6%\n";
    } else {
      return "========================================================\n" +
             "        ASUS RETAIL DEMO ECOSYSTEM - STATUS REPORT      \n" +
             "========================================================\n" +
             "Generated: " + new Date().toString() + "\n" +
             "Total Managed Nodes: 1248\n" +
             "Regional Breakdowns:\n" +
             "  - North: 312 Online, 20 Offline\n" +
             "  - West:  280 Online, 14 Offline\n" +
             "  - South: 356 Online, 41 Offline\n" +
             "  - East:  300 Online, 17 Offline\n" +
             "All assets verified synced successfully.\n";
    }
  }

  // ==========================================
  // FLOW DIAGRAM CLICK NAVIGATION LINKS
  // ==========================================
  function initFlowDiagramListeners() {
    const nodes = selectAll('.flow-svg-node');
    nodes.forEach(node => {
      node.addEventListener('click', function() {
        const dest = this.getAttribute('data-target-flow');
        if (!dest) return;
        
        // Parse destination
        if (dest.startsWith('rt-')) {
          // Switch workbench to retail page
          const navRetail = document.querySelector('.workbench-nav-item[data-page="retail"]');
          if (navRetail) navRetail.click();
          
          // Switch retail app to target screen
          showRtScreen(dest);
        } else if (dest.startsWith('cms-')) {
          // Switch workbench to CMS page
          const navCms = document.querySelector('.workbench-nav-item[data-page="cms"]');
          if (navCms) navCms.click();
          
          // Switch CMS app to target screen
          appState.isLoggedIn = true;
          select('cms-user-panel-box').style.display = 'flex';
          showCmsScreen(dest);
        }
      });
    });
  }

  // ==========================================
  // INITIALIZATION HANDLER
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initWorkbenchRouter();
    
    // Retail components
    initRetailAppListeners();
    restartRetailSimulation();
    
    // CMS components
    initCMSLogin();
    initCMSListeners();
    
    // Flow interactive nodes
    initFlowDiagramListeners();
    
    // Set landing default page active
    const firstNav = document.querySelector('.workbench-nav-item[data-page="cover"]');
    if (firstNav) firstNav.click();
  });
})();
