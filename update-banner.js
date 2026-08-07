/* =========================================
   FUJI LEARN - UPDATE BANNER (CENTERED MODAL)
   ========================================= */

let newWorker = null;

// Register the Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Changed to relative path './' to fix GitHub Pages subdirectory 404
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('[Update Banner] SW registered:', registration.scope);

            // Check for updates every 5 minutes
            setInterval(() => {
                registration.update();
            }, 5 * 60 * 1000);

            // Listen for waiting worker (new version downloaded)
            registration.addEventListener('updatefound', () => {
                newWorker = registration.installing;
                console.log('[Update Banner] New version found, downloading...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version is ready! Show the modal
                        showUpdateModal(registration);
                    }
                });
            });

            // Handle when new SW takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[Update Banner] New version activated, reloading page...');
                window.location.reload();
            });

        } catch (error) {
            console.error('[Update Banner] SW registration failed:', error);
        }
    });
}

// Show the centered update modal
function showUpdateModal(registration) {
    // Check if modal already exists
    if (document.getElementById('update-modal')) return;

    // Create modal overlay and card
    const modal = document.createElement('div');
    modal.id = 'update-modal';
    modal.className = 'update-modal-overlay';
    modal.innerHTML = `
        <div class="update-modal-card">
            <div class="update-icon-wrapper">
                <svg class="update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
            </div>
            <h3 class="update-title">Update Available!</h3>
            <p class="update-text">A new version of Fuji Learn is ready. Refresh to get the latest features and fixes.</p>
            <div class="update-actions">
                <button class="update-refresh-btn" onclick="triggerUpdate()">
                    Refresh Now
                </button>
                <button class="update-dismiss-btn" onclick="dismissModal()">
                    Later
                </button>
            </div>
        </div>
    `;

    // Add CSS styles for the centered modal
    const style = document.createElement('style');
    style.textContent = `
        .update-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 20px;
            box-sizing: border-box;
        }
        .update-modal-overlay.show {
            opacity: 1;
        }
        .update-modal-card {
            background: var(--bg-secondary, #18181b);
            border: 1px solid var(--border-subtle, #27272a);
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 320px;
            text-align: center;
            color: var(--text-primary, #ffffff);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .update-modal-overlay.show .update-modal-card {
            transform: scale(1);
        }
        .update-icon-wrapper {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #818cf8, #6366f1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        .update-icon {
            width: 28px;
            height: 28px;
            color: white;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .update-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: var(--text-primary, #ffffff);
        }
        .update-text {
            font-size: 0.9rem;
            color: var(--text-secondary, #a1a1aa);
            margin: 0 0 24px 0;
            line-height: 1.5;
        }
        .update-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .update-refresh-btn {
            background: var(--accent-primary, #818cf8);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: transform 0.1s, opacity 0.2s;
            width: 100%;
        }
        .update-refresh-btn:active {
            transform: scale(0.97);
            opacity: 0.9;
        }
        .update-dismiss-btn {
            background: transparent;
            border: none;
            color: var(--text-tertiary, #71717a);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            padding: 8px;
        }
        .update-dismiss-btn:hover {
            color: var(--text-secondary, #a1a1aa);
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Store registration for the global function
    window.__updateRegistration = registration;
}

// Global function to trigger update (called by modal button)
window.triggerUpdate = function() {
    if (window.__updateRegistration && window.__updateRegistration.waiting) {
        // Tell service worker to skip waiting and activate
        window.__updateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
};

// Global function to dismiss modal
window.dismissModal = function() {
    const modal = document.getElementById('update-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};