console.log("ABOBA i18n loaded v8");

(function () {
    const STORAGE_KEY = "aboba_analytics_language";
    const SUPPORTED = ["en", "ru"];

    const RU = {
        "Home": "Главная",
        "Track Records": "Рекорды трасс",
        "Cars Analytics": "Аналитика машин",
        "Driver Analytics": "Аналитика пилотов",
        "Safety Rating": "Рейтинг безопасности",
        "Server Activity": "Активность серверов",

        "ABOBA Racing Analytics": "ABOBA Racing Analytics",
        "ACC server statistics, records and safety rating": "Статистика серверов ACC, рекорды и рейтинг безопасности",
        "ACC car usage, popularity and best lap statistics": "Статистика использования машин, популярности и лучших кругов ACC",
        "Driver activity, best laps, favorite cars and tracks": "Активность пилотов, лучшие круги, любимые машины и трассы",
        "Clean driving score based on valid laps and penalties": "Рейтинг чистого пилотирования на основе валидных кругов и штрафов",
        "Historical server activity from ACC result files": "Историческая активность серверов по result-файлам ACC",

        "Server Dashboard": "Панель серверов",
        "Safety Snapshot": "Сводка безопасности",
        "Top Safe Drivers": "Самые чистые пилоты",
        "Needs Attention": "Требуют внимания",
        "Current Track Records": "Текущие рекорды трасс",
        "Most Used Cars": "Популярные машины",
        "Servers": "Серверы",
        "Cars Overview": "Обзор машин",
        "Drivers Overview": "Обзор пилотов",
        "Safety Overview": "Обзор безопасности",
        "How Safety Rating works": "Как считается рейтинг безопасности",
        "Safety Rating v1.2 starts from 100 points and subtracts points for invalid laps, penalties and post-race penalties.": "Safety Rating v1.2 начинается со 100 очков и снижает рейтинг за невалидные круги, штрафы и post-race штрафы.",
        "Clean driving bonus is added when a driver has no penalties or post-race penalties:": "Бонус за чистую езду добавляется, если у пилота нет штрафов и post-race штрафов:",
        "+1 point for 5+ laps": "+1 балл за 5+ кругов",
        "+2 points for 10+ laps": "+2 балла за 10+ кругов",
        "+3 points for 15+ laps": "+3 балла за 15+ кругов",
        "Invalid laps are already included in the formula, so the bonus rewards clean participation without requiring every lap to be valid.": "Невалидные круги уже учтены в формуле, поэтому бонус награждает чистое участие без требования делать каждый круг валидным.",
        "Grades: S 95–100, A 85–94.9, B 75–84.9, C 60–74.9, D below 60.": "Классы: S 95–100, A 85–94.9, B 75–84.9, C 60–74.9, D ниже 60.",
        "Confidence depends only on total laps: very low under 20, low from 20, medium from 50, high from 80, veteran from 150, legend from 285, Server Legend 🏆 from 375 laps.": "Уверенность зависит только от количества кругов: very low меньше 20, low от 20, medium от 50, high от 80, veteran от 150, legend от 285, Server Legend 🏆 от 375 кругов.",
        "Current rating uses ACC result files only. Contacts, damage events and live incidents are not included yet and are planned for v3-live.": "Текущий рейтинг использует только result-файлы ACC. Контакты, damage events и live-инциденты пока не учитываются и запланированы для v3-live.",
        "Activity Dashboard": "Панель активности",
        "Activity Details": "Детали активности",

        "Active Drivers": "Активные пилоты",
        "Sessions": "Сессии",
        "Total Laps": "Всего кругов",
        "Laps": "Круги",
        "Servers": "Серверы",
        "Tracks": "Трассы",
        "Cars": "Машины",
        "Trusted": "Надёжные",
        "Risky": "Риск",
        "Last Update": "Обновлено",
        "Top Track": "Топ трасса",
        "Top Car": "Топ машина",
        "New Drivers 7d": "Новые пилоты 7д",
        "Sessions 7d": "Сессии 7д",
        "Total:": "Всего:",
        "Imported sessions": "Импортированные сессии",
        "Analyzed laps": "Проанализированные круги",
        "ACC servers": "ACC серверы",
        "Collected tracks": "Собранные трассы",
        "S / A trusted drivers": "Пилоты S / A",
        "Trusted C / D grade": "Пилоты C / D",
        "Data generated": "Дата генерации",
        "first seen drivers": "новые пилоты",
        "recent sessions": "недавние сессии",
        "entries": "записей",
        "sessions": "сессий",

        "Rank": "Место",
        "Driver": "Пилот",
        "Drivers": "Пилоты",
        "Grade": "Класс",
        "Safety": "Safety",
        "Penalties": "Штрафы",
        "Invalid / 100": "Inv. / 100",
        "Penalties / 100": "Pen. / 100",
        "Track": "Трасса",
        "Car": "Машина",
        "Session": "Сессия",
        "Lap Time": "Время круга",
        "Best Lap": "Лучший круг",
        "Avg Lap": "Средний круг",
        "Best Track": "Лучшая трасса",
        "Best Driver": "Лучший пилот",
        "Entries": "Записи",
        "Server": "Сервер",
        "First Seen": "Первый раз",
        "Last Seen": "Last",
        "Date": "Дата",
        "Confidence": "Уверенность",
        "Valid": "Valid",
        "Invalid": "Invalid",
        "Favorite Car": "Любимая машина",
        "Favorite Track": "Любимая трасса",
        "Compare": "Сравнить",
        "Details": "Детали",
        "Gap": "Отставание",

        "Active Cars": "Активные машины",
        "All-Time Cars": "Машины за всё время",
        "Sort by Popularity": "Сортировать по популярности",
        "Sort by Speed": "Сортировать по скорости",
        "Current Records": "Текущие рекорды",
        "All-Time Records": "Рекорды за всё время",
        "Trusted Rating": "Надёжный рейтинг",
        "All Drivers": "Все пилоты",
        "Lifetime": "За всё время",
        "Active Window": "Активный период",
        "Sort by Safety": "Сортировать по безопасности",
        "Sort by Laps": "Сортировать по кругам",
        "Sort by Penalties": "Сортировать по штрафам",
        "Sort by Activity": "Сортировать по активности",
        "Sort by Pace": "Сортировать по темпу",
        "Sort by Tracks": "Сортировать по трассам",
        "Compare selected": "Сравнить выбранных",
        "Clear selection": "Очистить выбор",
        "Search driver:": "Поиск пилота:",
        "Type driver name...": "Введите имя пилота...",
        "Selected Drivers Comparison": "Сравнение выбранных пилотов",

        "Detailed driver profile across ABOBA Racing servers": "Детальная карточка пилота на серверах ABOBA Racing",
        "Total laps": "Всего кругов",
        "from safety laps": "из кругов безопасности",
        "Valid / Invalid": "Валидные / невалидные",
        "lap validity": "валидность кругов",
        "visited tracks": "посещённые трассы",
        "used cars": "использованные машины",
        "visited servers": "посещённые серверы",
        "Best laps by track": "Лучшие круги по трассам",
        "Used cars": "Использованные машины",
        "Visited servers": "Посещённые серверы",
        "Session types": "Типы сессий",
        "No track details yet": "Пока нет данных по трассам",
        "No car data yet": "Пока нет данных по машинам",
        "No server data yet": "Пока нет данных по серверам",
        "No session data yet": "Пока нет данных по сессиям",
        "No comparable track data found.": "Нет данных для сравнения по трассам.",
        "No result on this track": "Нет результата на этой трассе",

        "Period": "Период",
        "7 days": "7 дней",
        "30 days": "30 дней",
        "90 days": "90 дней",
        "All": "Все",
        "All servers": "Все серверы",
        "All tracks": "Все трассы",
        "Mode": "Режим",
        "Reset": "Сброс",
        "Activity by Date": "Активность по датам",
        "Sessions, unique drivers and laps by day, grouped as bars": "Сессии, уникальные пилоты и круги по дням в виде столбиков",
        "Activity by Server": "Активность по серверам",
        "Top servers by selected period": "Топ серверов за выбранный период",
        "Activity by Track": "Активность по трассам",
        "Most active tracks": "Самые активные трассы",
        "Session Types": "Типы сессий",
        "Practice / Qualifying / Race activity": "Активность Practice / Qualifying / Race",
        "Top 20 cars by entries": "Топ-20 машин по записям",
        "Activity Heatmap": "Тепловая карта активности",
        "Sessions by weekday and hour. Darker cells mean more activity.": "Сессии по дням недели и часам. Чем темнее ячейка, тем выше активность.",
        "Active in filter": "Активны в фильтре",
        "Driven tracks": "Трассы с заездами",
        "Top car models": "Топ моделей машин",
        "No activity data for selected filters.": "Нет активности для выбранных фильтров.",
        "No data": "Нет данных",
        "No activity data": "Нет данных активности",
        "Bars are grouped by date. Heights are normalized per metric so sessions, drivers and laps remain readable together.": "Столбики сгруппированы по датам. Высота нормализована отдельно для каждой метрики, чтобы сессии, пилоты и круги были читаемы вместе.",
        "Practice": "Практика",
        "Qualifying": "Квалификация",
        "Race": "Гонка",
        "Mon": "Пн",
        "Tue": "Вт",
        "Wed": "Ср",
        "Thu": "Чт",
        "Fri": "Пт",
        "Sat": "Сб",
        "Sun": "Вс",
        "Failed to load acc_analytics.json": "Не удалось загрузить acc_analytics.json",

        "No trusted safety data found": "Нет данных по надёжным пилотам",
        "No risky trusted drivers found": "Нет рискованных пилотов с достаточной статистикой",
        "No current records found": "Текущие рекорды не найдены",
        "No car stats found": "Статистика машин не найдена",
        "No servers found": "Серверы не найдены",
        "Safety model:": "Модель безопасности:",
        "Generated:": "Сгенерировано:",

        "ABOBA Racing Analytics · Built by": "ABOBA Racing Analytics · Создано",
        "with help from": "при помощи"
    };

    const EN = {};

    Object.entries(RU).forEach(([en, ru]) => {
        EN[ru] = en;
    });

    function getSavedLanguage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (SUPPORTED.includes(saved)) {
                return saved;
            }
        } catch (error) {
            // localStorage can be blocked in some modes.
        }

        const browserLanguage = (navigator.language || navigator.userLanguage || "").toLowerCase();

        if (browserLanguage.startsWith("ru")) {
            return "ru";
        }

        return "en";
    }

    function saveLanguage(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            // Ignore storage errors.
        }
    }

    function getCurrentLanguage() {
        const lang = document.documentElement.getAttribute("data-lang") || getSavedLanguage();
        return SUPPORTED.includes(lang) ? lang : "en";
    }

    function preserveWhitespace(original, translated) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        return leading + translated + trailing;
    }

    function translatePatterns(text, lang) {
        if (lang === "ru") {
            return text
                .replace(/^Total:\s*(\d+)$/i, "Всего: $1")
                .replace(/^(\d+)\s+sessions$/i, "$1 сессий")
                .replace(/^(\d+)\s+entries$/i, "$1 записей")
                .replace(/^(\d+)\s+recent sessions$/i, "$1 недавних сессий")
                .replace(/^(\d+)\s+first seen drivers$/i, "$1 новых пилотов")
                .replace(/^Showing\s+last\s+(\d+)\s+days\s+·\s+(.+)$/i, "Показано: последние $1 дней · $2")
                .replace(/^Showing\s+all data\s+·\s+(.+)$/i, "Показано: все данные · $1")
                .replace(/^last\s+(\d+)\s+days$/i, "последние $1 дней")
                .replace(/^all data$/i, "все данные")
                .replace(/^Selected\s+(\d+)\s+drivers?\. Tracks are grouped so sector differences are easier to compare\.$/i, "Выбрано пилотов: $1. Трассы сгруппированы, чтобы было проще сравнивать сектора.")
                .replace(/^Showing\s*$/i, "Показано ")
                .replace(/^active drivers\. Select drivers with checkboxes to compare sectors\.$/i, "активных пилотов. Выберите пилотов галочками, чтобы сравнить сектора.")
                .replace(/^all drivers\. Select drivers with checkboxes to compare sectors\.$/i, "всех пилотов. Выберите пилотов галочками, чтобы сравнить сектора.");
        }

        return text
            .replace(/^Всего:\s*(\d+)$/i, "Total: $1")
            .replace(/^(\d+)\s+сессий$/i, "$1 sessions")
            .replace(/^(\d+)\s+записей$/i, "$1 entries")
            .replace(/^(\d+)\s+недавних сессий$/i, "$1 recent sessions")
            .replace(/^(\d+)\s+новых пилотов$/i, "$1 first seen drivers")
            .replace(/^Показано:\s+последние\s+(\d+)\s+дней\s+·\s+(.+)$/i, "Showing last $1 days · $2")
            .replace(/^Показано:\s+все данные\s+·\s+(.+)$/i, "Showing all data · $1")
            .replace(/^последние\s+(\d+)\s+дней$/i, "last $1 days")
            .replace(/^все данные$/i, "all data")
            .replace(/^Выбрано пилотов:\s*(\d+)\. Трассы сгруппированы, чтобы было проще сравнивать сектора\.$/i, "Selected $1 drivers. Tracks are grouped so sector differences are easier to compare.")
            .replace(/^Показано\s*$/i, "Showing ")
            .replace(/^активных пилотов\. Выберите пилотов галочками, чтобы сравнить сектора\.$/i, "active drivers. Select drivers with checkboxes to compare sectors.")
            .replace(/^всех пилотов\. Выберите пилотов галочками, чтобы сравнить сектора\.$/i, "all drivers. Select drivers with checkboxes to compare sectors.");
    }

    function translateCore(core, lang) {
        if (!core) return core;

        const dict = lang === "ru" ? RU : EN;

        if (dict[core]) {
            return dict[core];
        }

        return translatePatterns(core, lang);
    }

    function translateString(value, lang) {
        if (!value || !String(value).trim()) {
            return value;
        }

        const original = String(value);
        const core = original.trim();
        const translated = translateCore(core, lang);

        if (translated === core) {
            return original;
        }

        return preserveWhitespace(original, translated);
    }

    function shouldSkip(node) {
        let current = node.parentElement;

        while (current) {
            const tag = current.tagName;

            if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) {
                return true;
            }

            if (current.hasAttribute("data-no-i18n")) {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    let isApplying = false;

    function applyI18n(root) {
        if (isApplying) return;

        const lang = getCurrentLanguage();
        const start = root || document.body;

        if (!start) return;

        isApplying = true;

        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("data-lang", lang);

        document.querySelectorAll("[data-lang-option]").forEach(button => {
            const active = button.getAttribute("data-lang-option") === lang;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        document.title = translateString(document.title, lang);

        const walker = document.createTreeWalker(
            start,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (shouldSkip(node)) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    if (!node.nodeValue || !node.nodeValue.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const translated = translateString(textNode.nodeValue, lang);

            if (translated !== textNode.nodeValue) {
                textNode.nodeValue = translated;
            }
        });

        document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(input => {
            const translated = translateString(input.getAttribute("placeholder"), lang);
            input.setAttribute("placeholder", translated);
        });

        document.querySelectorAll("[title]").forEach(element => {
            if (element.hasAttribute("data-no-i18n")) return;
            const translated = translateString(element.getAttribute("title"), lang);
            element.setAttribute("title", translated);
        });

        isApplying = false;
    }

    function setSiteLanguage(lang) {
        if (!SUPPORTED.includes(lang)) return;

        document.documentElement.setAttribute("data-lang", lang);
        saveLanguage(lang);
        applyI18n(document.body);

        window.dispatchEvent(new CustomEvent("aboba-language-changed", {
            detail: { language: lang }
        }));
    }

    function installObserver() {
        const observer = new MutationObserver(() => {
            if (isApplying) return;

            window.clearTimeout(window.__abobaI18nTimer);
            window.__abobaI18nTimer = window.setTimeout(() => {
                applyI18n(document.body);
            }, 30);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    window.setSiteLanguage = setSiteLanguage;
    window.applyI18n = function () {
        applyI18n(document.body);
    };
    window.getSiteLanguage = getCurrentLanguage;

    function init() {
        const lang = getSavedLanguage();
        document.documentElement.setAttribute("data-lang", lang);
        applyI18n(document.body);
        installObserver();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
