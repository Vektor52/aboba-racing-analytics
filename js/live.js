console.log("ABOBA Live Servers loaded v1.1");

(function () {
    const DATA_URL = "data/live_servers.json";
    const DEFAULT_REFRESH_MS = 10_000;
    const STALE_AFTER_MS = 90_000;

    const TRACK_ASSETS = {
        spa: "assets/tracks/spa.svg",
        zolder: "assets/tracks/zolder.svg",
        brands_hatch: "assets/tracks/brands-hatch.svg",
        monza: "assets/tracks/monza.svg",
        nurburgring_24h: "assets/tracks/nordschleife.svg"
    };

    const PHASE_LABELS = {
        "waiting for drivers": "Waiting for drivers",
        "pre session": "Pre session",
        "session": "Session",
        "post session": "Post session",
        "result": "Result",
        "unknown": "Unknown"
    };

    let latestPayload = null;
    let refreshTimer = null;

    function currentLanguage() {
        return typeof window.getSiteLanguage === "function"
            ? window.getSiteLanguage()
            : (document.documentElement.getAttribute("lang") || "en");
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function parseDate(value) {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function isStale(value) {
        const date = parseDate(value);
        if (!date) return true;
        return Date.now() - date.getTime() > STALE_AFTER_MS;
    }

    function formatTime(date) {
        if (!date) return "—";
        return new Intl.DateTimeFormat(currentLanguage() === "ru" ? "ru-RU" : "en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(date);
    }

    function formatDate(date) {
        if (!date) return "—";
        return new Intl.DateTimeFormat(currentLanguage() === "ru" ? "ru-RU" : "en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    }

    function formatRemaining(server) {
        const phase = String(server.session_phase || "").toLowerCase();
        const minutes = Math.max(0, Number(server.session_remaining_minutes) || 0);

        if (phase === "waiting for drivers" && minutes === 0) {
            return "Waiting for drivers";
        }

        const totalSeconds = Math.round(minutes * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [hours, remainingMinutes, seconds]
            .map(value => String(value).padStart(2, "0"))
            .join(":");
    }

    function phaseLabel(value) {
        const key = String(value || "Unknown").toLowerCase();
        return PHASE_LABELS[key] || value || "Unknown";
    }

    function statusFor(server) {
        if (!server.online) {
            return { className: "offline", label: "Offline" };
        }
        return { className: "online", label: "Online" };
    }

    function renderCard(server) {
        const state = statusFor(server);
        const stale = isStale(server.source_updated_at);
        const asset = TRACK_ASSETS[server.track_key] || "assets/tracks/generic.svg";
        const updated = parseDate(server.source_updated_at);
        const sessionType = server.session_type || "Unknown";
        const phase = phaseLabel(server.session_phase);
        const remaining = formatRemaining(server);

        return `
            <article class="live-server-card ${state.className}${stale ? " stale" : ""}">
                <div class="live-card-statusbar">
                    <span class="live-card-status ${state.className}">
                        <i></i>${escapeHtml(state.label)}
                    </span>
                    <span class="live-card-id">ACC</span>
                </div>

                <div class="live-track-visual" style="background-image:url('${asset}')">
                    <div class="live-track-overlay">
                        <h3>${escapeHtml(server.name)}</h3>
                        <p>${escapeHtml(server.track_name)}</p>
                    </div>
                </div>

                <div class="live-card-details">
                    <div class="live-detail-row">
                        <span><i>⚑</i> Session</span>
                        <strong class="accent">${escapeHtml(sessionType)}</strong>
                    </div>
                    <div class="live-detail-row">
                        <span><i>◉</i> Session Phase</span>
                        <strong>${escapeHtml(phase)}</strong>
                    </div>
                    <div class="live-detail-row">
                        <span><i>●</i> Players</span>
                        <strong>${escapeHtml(server.players)}</strong>
                    </div>
                    <div class="live-detail-row live-time-row">
                        <span><i>◷</i> Time Remaining</span>
                        <strong class="accent">${escapeHtml(remaining)}</strong>
                    </div>
                </div>

                <div class="live-card-updated${stale ? " stale" : ""}">
                    Updated: ${escapeHtml(formatTime(updated))}${stale ? " · Stale" : ""}
                </div>
            </article>
        `;
    }

    function render(payload) {
        latestPayload = payload;
        const meta = payload && payload.meta ? payload.meta : {};
        const servers = Array.isArray(payload && payload.servers) ? payload.servers : [];
        const generatedAt = parseDate(meta.generated_at);

        document.getElementById("onlineServers").textContent = meta.online_count ?? servers.filter(server => server.online).length;
        document.getElementById("offlineServers").textContent = meta.offline_count ?? servers.filter(server => !server.online).length;
        document.getElementById("playersOnline").textContent = meta.total_players ?? servers.reduce((sum, server) => sum + (Number(server.players) || 0), 0);
        document.getElementById("lastRefresh").textContent = formatTime(generatedAt);
        document.getElementById("lastRefreshDate").textContent = formatDate(generatedAt);
        document.getElementById("collectorInfo").textContent = `Collector snapshot: ${formatTime(generatedAt)}`;

        const grid = document.getElementById("liveServerGrid");
        const empty = document.getElementById("liveEmptyState");

        if (!servers.length) {
            grid.innerHTML = "";
            empty.hidden = false;
        } else {
            empty.hidden = true;
            grid.innerHTML = servers.map(renderCard).join("");
        }

        const globalState = document.getElementById("globalLiveStatus");
        const stale = !generatedAt || Date.now() - generatedAt.getTime() > STALE_AFTER_MS;
        globalState.className = `live-global-state ${stale ? "stale" : "online"}`;
        globalState.innerHTML = `<span class="live-state-dot"></span><span>${stale ? "Stale" : "Live"}</span>`;

        if (typeof window.applyI18n === "function") {
            window.applyI18n();
        }
    }

    function renderError(error) {
        console.error(error);
        const globalState = document.getElementById("globalLiveStatus");
        globalState.className = "live-global-state offline";
        globalState.innerHTML = '<span class="live-state-dot"></span><span>Offline</span>';

        const empty = document.getElementById("liveEmptyState");
        empty.hidden = false;
        empty.querySelector("strong").textContent = "Failed to load live server data";
        empty.querySelector("span").textContent = "Check that live_servers.json exists and the local web server is running.";

        if (typeof window.applyI18n === "function") {
            window.applyI18n();
        }
    }

    async function loadLiveData() {
        try {
            const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            render(await response.json());
        } catch (error) {
            renderError(error);
        }
    }

    function scheduleRefresh() {
        window.clearInterval(refreshTimer);
        const seconds = Number(latestPayload && latestPayload.meta && latestPayload.meta.refresh_seconds) || 10;
        refreshTimer = window.setInterval(loadLiveData, Math.max(DEFAULT_REFRESH_MS, seconds * 1000));
    }

    document.addEventListener("DOMContentLoaded", async () => {
        await loadLiveData();
        scheduleRefresh();
    });

    window.addEventListener("aboba-language-changed", () => {
        if (latestPayload) render(latestPayload);
    });
})();
