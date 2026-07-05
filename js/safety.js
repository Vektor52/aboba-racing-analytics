console.log("ABOBA safety.js loaded v8");

let safetyData = null;
let safetySource = "active";
let safetyView = "all";
let safetySort = "laps";

const TRUSTED_CONFIDENCE = ["medium", "high", "veteran", "legend", "server_legend 🏆", "Server Legend 🏆"];
const CONFIDENCE_RANK = {
    "very_low": 0,
    "very low": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
    "veteran": 4,
    "legend": 5,
    "server_legend 🏆": 6,
    "server legend 🏆": 6,
    "Server Legend 🏆": 6
};

function fmtNumber(value) {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toLocaleString("en-US");
}

function fmtScore(value) {
    if (value === null || value === undefined || value === "") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function safeText(value) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function normalizeConfidence(value) {
    const raw = safeText(value);
    const key = raw.toLowerCase();

    if (key === "server_legend 🏆" || key === "server legend 🏆") return "Server Legend 🏆";
    if (key === "very_low" || key === "very low") return "Very low";

    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function confidenceRank(row) {
    const key = String(row.confidence || "").toLowerCase();
    return CONFIDENCE_RANK[key] ?? 0;
}

function isTrusted(row) {
    return TRUSTED_CONFIDENCE.includes(row.confidence) || confidenceRank(row) >= 2;
}

function isRisky(row) {
    return isTrusted(row) && ["C", "D"].includes(row.grade);
}

function getRows() {
    if (!safetyData) return [];

    const rows = safetySource === "lifetime"
        ? (safetyData.lifetime_safety_rating || [])
        : (safetyData.active_safety_rating || []);

    let result = [...rows];

    if (safetyView === "trusted") {
        result = result.filter(isTrusted);
    }

    const searchInput = document.getElementById("safetySearch");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    if (query) {
        result = result.filter(row => String(row.driver || "").toLowerCase().includes(query));
    }

    result.sort((a, b) => {
        if (safetySort === "safety") {
            return (b.safety_score || 0) - (a.safety_score || 0)
                || (b.total_laps || 0) - (a.total_laps || 0)
                || String(a.driver || "").localeCompare(String(b.driver || ""));
        }

        if (safetySort === "penalties") {
            return (a.penalties_per_100 || 0) - (b.penalties_per_100 || 0)
                || (a.penalties_count || 0) - (b.penalties_count || 0)
                || (b.total_laps || 0) - (a.total_laps || 0)
                || String(a.driver || "").localeCompare(String(b.driver || ""));
        }

        return confidenceRank(b) - confidenceRank(a)
            || (b.total_laps || 0) - (a.total_laps || 0)
            || (b.safety_score || 0) - (a.safety_score || 0)
            || String(a.driver || "").localeCompare(String(b.driver || ""));
    });

    return result;
}

function card(title, value, subtitle, accent) {
    return `
        <div class="stat-card ${accent ? "accent" : ""}">
            <div class="stat-title">${title}</div>
            <div class="stat-value">${value}</div>
            <div class="stat-subtitle">${subtitle}</div>
        </div>
    `;
}

function renderSafetyCards() {
    const container = document.getElementById("safetyCards");
    if (!container || !safetyData) return;

    const rows = safetySource === "lifetime"
        ? (safetyData.lifetime_safety_rating || [])
        : (safetyData.active_safety_rating || []);

    const trusted = rows.filter(isTrusted);
    const sGrade = rows.filter(row => row.grade === "S").length;
    const aGrade = rows.filter(row => row.grade === "A").length;
    const risky = rows.filter(isRisky).length;
    const safetyLaps = rows.reduce((sum, row) => sum + (Number(row.total_laps) || 0), 0);
    const penalties = rows.reduce((sum, row) => sum + (Number(row.penalties_count) || 0) + (Number(row.post_race_penalties_count) || 0), 0);

    container.className = "stats-grid";
    container.innerHTML = [
        card("Rated Drivers", fmtNumber(rows.length), "All safety entries", false),
        card("Trusted", fmtNumber(trusted.length), "Medium+ confidence", false),
        card("S Grade", fmtNumber(sGrade), "Clean drivers", true),
        card("A Grade", fmtNumber(aGrade), "Safe drivers", false),
        card("Risky", fmtNumber(risky), "C / D grade", false),
        card("Safety Laps", fmtNumber(safetyLaps), "Analyzed laps", false),
        card("Penalties", fmtNumber(penalties), "Normal + post-race", false)
    ].join("");
}

function gradeBadge(grade) {
    return `<span class="grade-badge grade-${safeText(grade).toLowerCase()}">${safeText(grade)}</span>`;
}

function confidenceBadge(row) {
    const label = normalizeConfidence(row.confidence);
    const rank = confidenceRank(row);

    let className = "confidence-low";
    if (rank >= 6) {
        className = "confidence-server-legend";
    } else if (rank >= 5) {
        className = "confidence-legend";
    } else if (rank >= 4) {
        className = "confidence-veteran";
    } else if (rank >= 3) {
        className = "confidence-high";
    } else if (rank >= 2) {
        className = "confidence-medium";
    }

    return `<span class="confidence-badge ${className}">${label}</span>`;
}

function renderSafetyTable(rows) {
    const tbody = document.querySelector("#safetyTable tbody");
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="14">No safety data found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map((row, index) => `
        <tr>
            <td>${index + 1}</td>
            <td class="table-name-cell">${safeText(row.driver)}</td>
            <td>${gradeBadge(row.grade)}</td>
            <td class="strong-value">${fmtScore(row.safety_score)}</td>
            <td>${confidenceBadge(row)}</td>
            <td>${fmtNumber(row.total_laps)}</td>
            <td>${fmtNumber(row.valid_laps)}</td>
            <td>${fmtNumber(row.invalid_laps)}</td>
            <td>${fmtScore(row.invalid_laps_per_100)}</td>
            <td>${fmtNumber(row.penalties_count)}</td>
            <td>${fmtScore(row.penalties_per_100)}</td>
            <td>${fmtNumber(row.sessions_count)}</td>
            <td>${fmtNumber(row.tracks_count)}</td>
            <td>${safeText(row.last_seen).slice(0, 10)}</td>
        </tr>
    `).join("");
}

function renderSafetyInfo(rows) {
    const info = document.getElementById("safetyInfo");
    if (!info || !safetyData) return;

    const meta = safetyData.meta || {};
    const sourceText = safetySource === "lifetime" ? "all-time data" : "active 90-day window";
    const viewText = safetyView === "trusted" ? "trusted drivers only" : "all drivers";
    const sortText = safetySort === "safety"
        ? "safety score"
        : safetySort === "penalties"
            ? "penalties per 100 laps"
            : "confidence / laps";

    info.innerHTML = `
        Source: <b>${sourceText}</b>.
        View: <b>${viewText}</b>.
        Sorted by: <b>${sortText}</b>.
        Drivers shown: <b>${fmtNumber(rows.length)}</b>.
        Model: <b>${safeText(meta.safety_model)}</b>.
        Data generated: <b>${safeText(meta.generated_at)}</b>.
    `;
}

function renderSafety() {
    const rows = getRows();
    renderSafetyCards();
    renderSafetyInfo(rows);
    renderSafetyTable(rows);

    if (typeof window.applyI18n === "function") {
        window.applyI18n();
    }
}

function showTrusted() {
    safetyView = "trusted";
    renderSafety();
}

function showAll() {
    safetyView = "all";
    renderSafety();
}

function showLifetime() {
    safetySource = "lifetime";
    renderSafety();
}

function showActive() {
    safetySource = "active";
    renderSafety();
}

function sortBySafety() {
    safetySort = "safety";
    renderSafety();
}

function sortByLaps() {
    safetySort = "laps";
    renderSafety();
}

function sortByPenalties() {
    safetySort = "penalties";
    renderSafety();
}

window.renderSafety = renderSafety;
window.showTrusted = showTrusted;
window.showAll = showAll;
window.showLifetime = showLifetime;
window.showActive = showActive;
window.sortBySafety = sortBySafety;
window.sortByLaps = sortByLaps;
window.sortByPenalties = sortByPenalties;

fetch("data/acc_analytics.json")
    .then(response => response.json())
    .then(data => {
        safetyData = data;
        safetySource = "active";
        safetyView = "all";
        safetySort = "laps";
        renderSafety();
    })
    .catch(error => {
        console.error(error);
        const info = document.getElementById("safetyInfo");
        if (info) info.textContent = "Failed to load acc_analytics.json";
    });
