// accessibility-widget.js
(function() {
    'use strict';
    
    // Проверяем, не добавлен ли уже виджет
    if (window.accessibilityWidgetLoaded) return;
    window.accessibilityWidgetLoaded = true;
    
    // Получаем base URL автоматически
    const scriptSrc = document.currentScript?.src;
    const baseUrl = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1) : '';
    
    // Создаем элементы виджета
    const widgetHTML = `
        <div class="accessibility-widget-container">
            <div class="accessibility-toggle" id="accessibilityToggle" role="button" aria-label="Accessibility Settings" tabindex="0">
                <span class="access-symbol">♿</span>
            </div>
        </div>

        <div class="accessibility-overlay" id="accessibilityOverlay"></div>

        <div class="accessibility-panel" id="accessibilityPanel" aria-hidden="true">
            <div class="panel-header">
                <h2 class="panel-title" id="panelTitle">Accessibility Settings</h2>
                <button class="close-btn" id="closePanel" aria-label="Close">×</button>
            </div>

            <div class="panel-section">
                <h3 class="section-title" id="textSizeTitle">Text Size</h3>
                <button class="access-btn" data-action="font-size" data-value="1" id="textIncrease">Increase Text (+)</button>
                <button class="access-btn" data-action="font-size" data-value="0" id="textNormal">Normal Text</button>
                <button class="access-btn" data-action="font-size" data-value="-1" id="textDecrease">Decrease Text (-)</button>
            </div>

            <div class="panel-section">
                <h3 class="section-title" id="contrastTitle">Color & Contrast</h3>
                <button class="access-btn" data-action="contrast" data-value="dark" id="contrastDark">Dark Contrast</button>
                <button class="access-btn" data-action="contrast" data-value="light" id="contrastLight">Light Contrast</button>
                <button class="access-btn" data-action="contrast" data-value="monochrome" id="contrastMono">Monochrome</button>
                <button class="access-btn" data-action="contrast" data-value="reset" id="contrastReset">Reset Colors</button>
            </div>

            <div class="panel-section">
                <h3 class="section-title" id="readingTitle">Reading</h3>
                <button class="access-btn" data-action="dyslexia-font" data-font="dyslexic" id="dyslexiaFontDyslexic">Dyslexic Font</button>
                <button class="access-btn" data-action="dyslexia-font" data-font="comicsans" id="dyslexiaFontComic">Comic Sans Font</button>
                <button class="access-btn" data-action="dyslexia-font" data-font="normal" id="dyslexiaFontNormal">Normal Font</button>
                <button class="access-btn" data-action="highlight-links" id="highlightLinks">Highlight Links</button>
                <button class="access-btn" data-action="big-cursor" id="bigCursor">Big Cursor</button>
            </div>

            <div class="panel-section language-selector">
                <h3 class="section-title" id="languageTitle">Language</h3>
                <button class="language-btn" data-lang="en" id="langEnglish">English</button>
                <button class="language-btn" data-lang="he" id="langHebrew">עברית</button>
                <button class="language-btn" data-lang="ru" id="langRussian">Русский</button>
            </div>

            <div class="panel-section">
                <button class="access-btn" data-action="reset" id="resetAll" style="background: #ff4444; color: white;">
                    Reset All Settings
                </button>
            </div>
        </div>
    `;

    // Создаем стили с динамическим URL
    const widgetCSS = `
        <style>
            @font-face {
    font-family: 'DyslexicFont';
    src: url('${baseUrl}dyslexia-hebrew-extended.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

            .accessibility-widget-container {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 100000;
                font-family: Arial, sans-serif;
            }

            .accessibility-toggle {
                width: 60px;
                height: 60px;
                background: #0056b3;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                border: 2px solid #fff;
            }

            .accessibility-toggle:hover {
                background: #003d82;
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }

            .accessibility-toggle:active {
                transform: scale(0.95);
            }

            .access-symbol {
                font-size: 28px;
                color: white;
                filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
            }

            .accessibility-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: none;
            }

            .accessibility-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                padding: 25px;
                z-index: 100001;
                border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
                max-width: 350px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                display: none;
            }

            .accessibility-panel[aria-hidden="false"] {
                display: block;
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #eee;
            }

            .panel-title {
                margin: 0;
                font-size: 1.5em;
                color: #333;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #666;
                padding: 5px;
                line-height: 1;
            }

            .close-btn:hover {
                color: #000;
            }

            .panel-section {
                margin-bottom: 25px;
            }

            .section-title {
                margin: 0 0 12px 0;
                font-size: 1.2em;
                color: #444;
                font-weight: 600;
            }

            .access-btn {
                display: block;
                width: 100%;
                padding: 12px 15px;
                margin: 8px 0;
                background: #f8f9fa;
                border: 2px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
                text-align: center;
            }

            .access-btn:hover {
                background: #e9ecef;
                border-color: #0056b3;
            }

            .language-selector {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }

            .language-btn {
                display: inline-block;
                margin: 5px;
                padding: 8px 12px;
                background: #f0f0f0;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
            }

            .language-btn:hover {
                background: #e0e0e0;
            }

            .language-btn.active {
                background: #0056b3;
                color: white;
                border-color: #003d82;
            }

            .accessibility-dyslexic {
                font-family: 'DyslexicFont', 'Comic Sans MS', 'Arial Rounded MT Bold', Arial, sans-serif !important;
                letter-spacing: 0.05em !important;
                line-height: 1.8 !important;
                font-size: 1.1em !important;
            }

            .accessibility-comicsans {
                font-family: 'Comic Sans MS', 'Comic Sans', cursive, Arial, sans-serif !important;
                letter-spacing: 0.03em !important;
                line-height: 1.7 !important;
            }

            .accessibility-normal-font {
                font-family: inherit !important;
                letter-spacing: normal !important;
                line-height: normal !important;
                font-size: inherit !important;
            }

            .access-btn.active-font {
                background: #0056b3 !important;
                color: white !important;
                border-color: #003d82 !important;
            }

            .accessibility-highlight-links a {
                text-decoration: underline !important;
                background-color: yellow !important;
                color: #000 !important;
                padding: 2px 4px !important;
            }

            .accessibility-contrast-dark {
                background-color: #000 !important;
                color: #fff !important;
            }

            .accessibility-contrast-dark *:not(.accessibility-panel):not(.accessibility-panel *) {
                background-color: #000 !important;
                color: #fff !important;
                border-color: #fff !important;
            }

            .accessibility-contrast-light {
                background-color: #fff !important;
                color: #000 !important;
            }

            .accessibility-contrast-light *:not(.accessibility-panel):not(.accessibility-panel *) {
                background-color: #fff !important;
                color: #000 !important;
                border-color: #000 !important;
            }

            .accessibility-monochrome {
                filter: grayscale(100%) !important;
            }

            .accessibility-big-cursor {
                cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23000000'/%3E%3C/svg%3E") 12 12, auto !important;
            }

            .accessibility-big-cursor * {
                cursor: inherit !important;
            }

            [dir="rtl"] .accessibility-widget-container {
                right: auto;
                left: 20px;
            }

            [dir="rtl"] .accessibility-panel {
                text-align: right;
            }

            @media (max-width: 768px) {
                .accessibility-toggle {
                    width: 50px;
                    height: 50px;
                }
                
                .accessibility-panel {
                    width: 95%;
                    padding: 20px 15px;
                }
            }

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        </style>
    `;

    // Вставляем HTML и CSS в документ
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    document.head.insertAdjacentHTML('beforeend', widgetCSS);

    // Запускаем функциональность виджета после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibilityWidget);
    } else {
        initAccessibilityWidget();
    }

    function initAccessibilityWidget() {
        // Language translations
        const translations = {
            en: {
                panelTitle: "Accessibility Settings",
                textSizeTitle: "Text Size",
                contrastTitle: "Color & Contrast", 
                readingTitle: "Reading",
                languageTitle: "Language",
                textIncrease: "Increase Text (+)",
                textNormal: "Normal Text",
                textDecrease: "Decrease Text (-)",
                contrastDark: "Dark Contrast",
                contrastLight: "Light Contrast", 
                contrastMono: "Monochrome",
                contrastReset: "Reset Colors",
                dyslexiaFontDyslexic: "Dyslexic Font",
                dyslexiaFontComic: "Comic Sans Font",
                dyslexiaFontNormal: "Normal Font",
                highlightLinks: "Highlight Links",
                bigCursor: "Big Cursor",
                resetAll: "Reset All Settings",
                close: "Close",
                toggleLabel: "Accessibility Settings"
            },
            he: {
                panelTitle: "הגדרות נגישות",
                textSizeTitle: "גודל טקסט",
                contrastTitle: "צבע וניגודיות",
                readingTitle: "קריאה",
                languageTitle: "שפה",
                textIncrease: "הגדל טקסט (+)",
                textNormal: "גודל רגיל",
                textDecrease: "הקטן טקסט (-)",
                contrastDark: "ניגודיות כהה",
                contrastLight: "ניגודיות בהירה",
                contrastMono: "מונוכרום",
                contrastReset: "איפוס צבעים",
                dyslexiaFontDyslexic: "גופן דיסלקטי",
                dyslexiaFontComic: "גופן Comic Sans",
                dyslexiaFontNormal: "גופן רגיל",
                highlightLinks: "הדגש קישורים",
                bigCursor: "סמן גדול",
                resetAll: "אפס כל ההגדרות",
                close: "סגור",
                toggleLabel: "הגדרות נגישות"
            },
            ru: {
                panelTitle: "Настройки доступности",
                textSizeTitle: "Размер текста",
                contrastTitle: "Цвет и контраст",
                readingTitle: "Чтение",
                languageTitle: "Язык",
                textIncrease: "Увеличить текст (+)",
                textNormal: "Обычный текст", 
                textDecrease: "Уменьшить текст (-)",
                contrastDark: "Темный контраст",
                contrastLight: "Светлый контраст",
                contrastMono: "Монохромный",
                contrastReset: "Сбросить цвета",
                dyslexiaFontDyslexic: "Дислексический шрифт",
                dyslexiaFontComic: "Шрифт Comic Sans",
                dyslexiaFontNormal: "Обычный шрифт",
                highlightLinks: "Подчеркнуть ссылки",
                bigCursor: "Большой курсор",
                resetAll: "Сбросить все настройки",
                close: "Закрыть",
                toggleLabel: "Настройки доступности"
            }
        };

        const toggleBtn = document.getElementById('accessibilityToggle');
        const panel = document.getElementById('accessibilityPanel');
        const closeBtn = document.getElementById('closePanel');
        const overlay = document.getElementById('accessibilityOverlay');

        if (!toggleBtn || !panel || !closeBtn || !overlay) return;

        // ARIA live region for announcements
        const live = document.createElement('div');
        live.setAttribute('aria-live', 'polite');
        live.className = 'sr-only';
        document.body.appendChild(live);
        
        function announce(msg) { 
            live.textContent = ''; 
            setTimeout(() => live.textContent = msg, 50); 
        }

        // Apply translations
        function applyTranslations(lang) {
            const trans = translations[lang];
            if (!trans) return;

            const elements = {
                'panelTitle': trans.panelTitle,
                'textSizeTitle': trans.textSizeTitle,
                'contrastTitle': trans.contrastTitle,
                'readingTitle': trans.readingTitle,
                'languageTitle': trans.languageTitle,
                'textIncrease': trans.textIncrease,
                'textNormal': trans.textNormal,
                'textDecrease': trans.textDecrease,
                'contrastDark': trans.contrastDark,
                'contrastLight': trans.contrastLight,
                'contrastMono': trans.contrastMono,
                'contrastReset': trans.contrastReset,
                'dyslexiaFontDyslexic': trans.dyslexiaFontDyslexic,
                'dyslexiaFontComic': trans.dyslexiaFontComic,
                'dyslexiaFontNormal': trans.dyslexiaFontNormal,
                'highlightLinks': trans.highlightLinks,
                'bigCursor': trans.bigCursor,
                'resetAll': trans.resetAll
            };

            for (const [id, text] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            }

            if (closeBtn) closeBtn.setAttribute('aria-label', trans.close);
            if (toggleBtn) toggleBtn.setAttribute('aria-label', trans.toggleLabel);
            
            // Set direction for RTL languages
            if (lang === 'he') {
                panel.setAttribute('dir', 'rtl');
            } else {
                panel.setAttribute('dir', 'ltr');
            }
        }

        // Set active language button
        function setActiveLanguage(lang) {
            document.querySelectorAll('.language-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.lang === lang) {
                    btn.classList.add('active');
                }
            });
        }

        // Toggle panel
        function togglePanel() {
            const isHidden = panel.getAttribute('aria-hidden') === 'true';
            panel.setAttribute('aria-hidden', !isHidden);
            overlay.style.display = isHidden ? 'block' : 'none';
            
            if (isHidden) {
                panel.focus();
            }
        }

        // Close panel
        function closePanel() {
            panel.setAttribute('aria-hidden', 'true');
            overlay.style.display = 'none';
        }

        // Event listeners
        toggleBtn.addEventListener('click', togglePanel);
        closeBtn.addEventListener('click', closePanel);
        overlay.addEventListener('click', closePanel);

        // Keyboard navigation
        toggleBtn.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                togglePanel();
            }
        });

        // Language selection
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;
                applyTranslations(lang);
                setActiveLanguage(lang);
                localStorage.setItem('accessibilityLanguage', lang);
                announce(`Language changed to ${lang}`);
            });
        });

        // Handle accessibility actions
        panel.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' && e.target !== closeBtn) {
                const action = e.target.dataset.action;
                const value = e.target.dataset.value;
                const font = e.target.dataset.font;

                switch(action) {
                    case 'font-size':
                        changeFontSize(value);
                        break;
                    case 'contrast':
                        changeContrast(value);
                        break;
                    case 'dyslexia-font':
                        changeDyslexiaFont(font);
                        break;
                    case 'highlight-links':
                        toggleClass('accessibility-highlight-links', 'userHighlightLinks');
                        break;
                    case 'big-cursor':
                        toggleClass('accessibility-big-cursor', 'userBigCursor');
                        break;
                    case 'reset':
                        resetAll();
                        break;
                }
            }
        });

        // Accessibility functions
        function changeFontSize(value) {
            const html = document.documentElement;
            let currentSize = parseFloat(getComputedStyle(html).fontSize) || 16;
            const step = 2;

            if (value === '1') currentSize += step;
            else if (value === '-1') currentSize -= step;
            else currentSize = 16;

            html.style.fontSize = currentSize + 'px';
            localStorage.setItem('userFontSize', currentSize);
            announce(`Font size changed to ${currentSize}px`);
        }

        function changeContrast(mode) {
            const body = document.body;
            body.classList.remove('accessibility-contrast-dark', 'accessibility-contrast-light', 'accessibility-monochrome');
            
            if (mode !== 'reset') {
                body.classList.add('accessibility-' + (mode === 'monochrome' ? 'monochrome' : 'contrast-' + mode));
            }
            
            localStorage.setItem('userContrast', mode);
            announce(`Contrast mode: ${mode}`);
        }

        function changeDyslexiaFont(fontType) {
            document.body.classList.remove('accessibility-dyslexic', 'accessibility-comicsans', 'accessibility-normal-font');
            
            document.querySelectorAll('[data-action="dyslexia-font"]').forEach(btn => {
                btn.classList.remove('active-font');
            });
            
            if (fontType !== 'normal') {
                document.body.classList.add('accessibility-' + fontType);
                const activeBtn = document.querySelector(`[data-font="${fontType}"]`);
                if (activeBtn) activeBtn.classList.add('active-font');
            }
            
            localStorage.setItem('userDyslexiaFont', fontType);
            announce(`Font: ${fontType}`);
        }

        function toggleClass(className, storageKey) {
            document.body.classList.toggle(className);
            localStorage.setItem(storageKey, document.body.classList.contains(className));
            announce(`${className} ${document.body.classList.contains(className) ? 'enabled' : 'disabled'}`);
        }

        function resetAll() {
            document.body.className = document.body.className.replace(/\baccessibility-\w+/g, '');
            document.documentElement.style.fontSize = '';
            
            document.querySelectorAll('[data-action="dyslexia-font"]').forEach(btn => {
                btn.classList.remove('active-font');
            });
            
            ['userFontSize', 'userContrast', 'userDyslexiaFont', 'userHighlightLinks', 'userBigCursor'].forEach(key => {
                localStorage.removeItem(key);
            });
            
            announce('All settings reset');
        }

        // Load saved preferences
        function loadSavedPreferences() {
            const savedSize = localStorage.getItem('userFontSize');
            if (savedSize) {
                document.documentElement.style.fontSize = savedSize + 'px';
            }

            const savedContrast = localStorage.getItem('userContrast');
            if (savedContrast && savedContrast !== 'reset') {
                changeContrast(savedContrast);
            }

            const savedFont = localStorage.getItem('userDyslexiaFont');
            if (savedFont && savedFont !== 'normal') {
                changeDyslexiaFont(savedFont);
            }

            ['userHighlightLinks', 'userBigCursor'].forEach(key => {
                if (localStorage.getItem(key) === 'true') {
                    const className = key.replace('user', '').toLowerCase();
                    document.body.classList.add('accessibility-' + className);
                }
            });

            // Load language preference
            const savedLang = localStorage.getItem('accessibilityLanguage') || 'en';
            applyTranslations(savedLang);
            setActiveLanguage(savedLang);
        }

        // Load preferences
        loadSavedPreferences();

        // Close panel on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') {
                closePanel();
            }
        });
    }
})();
