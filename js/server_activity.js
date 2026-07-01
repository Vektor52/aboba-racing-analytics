console.log("Server Activity V2.5 loaded");

let activityData = null;
let currentActivityPeriod = 90;

function escapeHtml(value)
{
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatLap(ms)
{
    if (ms === null || ms === undefined || ms <= 0) return "-";

    let total = ms / 1000;
    let minutes = Math.floor(total / 60);
    let seconds = (total % 60).toFixed(3);

    return minutes + ":" + seconds.padStart(6, "0");
}

function formatTrack(track)
{
    const tracks = {
        spa: "Spa-Francorchamps",
        zolder: "Zolder",
        monza: "Monza",
        imola: "Imola",
        nurburgring: "Nürburgring",
        brands_hatch: "Brands Hatch",
        silverstone: "Silverstone",
        paul_ricard: "Paul Ricard",
        misano: "Misano",
        barcelona: "Barcelona",
        hungaroring: "Hungaroring",
        zandvoort: "Zandvoort",
        kyalami: "Kyalami",
        donington: "Donington Park",
        suzuka: "Suzuka",
        oulton_park: "Oulton Park",
        cota: "Circuit of the Americas",
        watkins_glen: "Watkins Glen",
        indianapolis: "Indianapolis",
        nurburgring_24h: "Nürburgring 24H"
    };

    return tracks[track] || track || "-";
}

function getCarLabel(carModel)
{
    if (carModel === null || carModel === undefined) return "-";

    if (typeof window.getCarName === "function") {
        return window.getCarName(carModel);
    }

    return "Model " + carModel;
}

function shortServerName(serverName)
{
    if (!serverName) return "-";

    return serverName
        .replace("ABOBA RACING ", "")
        .replace(" /VOLGA-RUS/", "")
        .trim();
}

function formatNumber(value)
{
    if (value === null || value === undefined) return "0";

    return Number(value).toLocaleString("en-US");
}

function parseDateOnly(value)
{
    if (!value) return null;

    const parts = String(value).substring(0, 10).split("-");

    if (parts.length !== 3) return null;

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}

function dateToKey(date)
{
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMaxActivityDate()
{
    const rows = activityData.activity_by_date || [];

    if (rows.length === 0) return null;

    return parseDateOnly(rows[rows.length - 1].date);
}

function getCutoffDate()
{
    if (currentActivityPeriod === "all") return null;

    const maxDate = getMaxActivityDate();

    if (!maxDate) return null;

    const cutoff = new Date(maxDate);
    cutoff.setDate(cutoff.getDate() - Number(currentActivityPeriod) + 1);

    return cutoff;
}

function isDateInPeriod(dateText)
{
    const cutoff = getCutoffDate();

    if (!cutoff) return true;

    const date = parseDateOnly(dateText);

    if (!date) return false;

    return date >= cutoff;
}

function getServerFilter()
{
    const select = document.getElementById("serverFilter");
    return select ? select.value : "";
}

function getTrackFilter()
{
    const select = document.getElementById("trackFilter");
    return select ? select.value : "";
}

function hasActiveFilters()
{
    return Boolean(getServerFilter() || getTrackFilter());
}

function populateFilters()
{
    const serverSelect = document.getElementById("serverFilter");
    const trackSelect = document.getElementById("trackFilter");

    if (!serverSelect || !trackSelect) return;

    const servers = Array.from(
        new Set((activityData.activity_detail || [])
            .map(row => row.server_name)
            .filter(Boolean))
    ).sort();

    const tracks = Array.from(
        new Set((activityData.activity_detail || [])
            .map(row => row.track)
            .filter(Boolean))
    ).sort();

    serverSelect.innerHTML = `<option value="">All servers</option>` + servers.map(server => {
        return `<option value="${escapeHtml(server)}">${escapeHtml(shortServerName(server))}</option>`;
    }).join("");

    trackSelect.innerHTML = `<option value="">All tracks</option>` + tracks.map(track => {
        return `<option value="${escapeHtml(track)}">${escapeHtml(formatTrack(track))}</option>`;
    }).join("");
}

function getFilteredDetailRows()
{
    const serverFilter = getServerFilter();
    const trackFilter = getTrackFilter();

    return (activityData.activity_detail || []).filter(row => {
        if (!isDateInPeriod(row.date)) return false;
        if (serverFilter && row.server_name !== serverFilter) return false;
        if (trackFilter && row.track !== trackFilter) return false;

        return true;
    });
}

function groupRows(rows, keyGetter, createItem, applyRow)
{
    const map = new Map();

    rows.forEach(row => {
        const key = keyGetter(row);

        if (!key) return;

        if (!map.has(key)) {
            map.set(key, createItem(row));
        }

        applyRow(map.get(key), row);
    });

    return Array.from(map.values());
}

function getDateRows()
{
    if (!hasActiveFilters()) {
        return (activityData.activity_by_date || [])
            .filter(row => isDateInPeriod(row.date));
    }

    const rows = getFilteredDetailRows();

    const dateRows = groupRows(
        rows,
        row => row.date,
        row => ({
            date: row.date,
            sessions: 0,
            drivers: 0,
            laps: 0,
            servers: new Set(),
            tracks: new Set()
        }),
        (item, row) => {
            item.sessions += row.sessions || 0;
            item.drivers += row.drivers || 0;
            item.laps += row.laps || 0;
            if (row.server_name) item.servers.add(row.server_name);
            if (row.track) item.tracks.add(row.track);
        }
    );

    dateRows.forEach(row => {
        row.servers = row.servers.size;
        row.tracks = row.tracks.size;
    });

    dateRows.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return dateRows;
}

function getServerRows()
{
    const rows = getFilteredDetailRows();

    const serverRows = groupRows(
        rows,
        row => row.server_name,
        row => ({
            server_name: row.server_name,
            sessions: 0,
            drivers: 0,
            laps: 0,
            tracks: new Set(),
            last_seen: row.date
        }),
        (item, row) => {
            item.sessions += row.sessions || 0;
            item.drivers += row.drivers || 0;
            item.laps += row.laps || 0;
            if (row.track) item.tracks.add(row.track);
            if (row.date && row.date > item.last_seen) item.last_seen = row.date;
        }
    );

    serverRows.forEach(row => {
        row.tracks = row.tracks.size;
    });

    serverRows.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

    return serverRows;
}

function getTrackRows()
{
    const rows = getFilteredDetailRows();

    const trackRows = groupRows(
        rows,
        row => row.track,
        row => ({
            track: row.track,
            sessions: 0,
            drivers: 0,
            laps: 0,
            best_lap: row.best_lap || null,
            best_driver: row.best_driver || null
        }),
        (item, row) => {
            item.sessions += row.sessions || 0;
            item.drivers += row.drivers || 0;
            item.laps += row.laps || 0;

            if (row.best_lap && (!item.best_lap || row.best_lap < item.best_lap)) {
                item.best_lap = row.best_lap;
                item.best_driver = row.best_driver;
            }
        }
    );

    trackRows.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

    return trackRows;
}

function getSessionTypeRows()
{
    const rows = getFilteredDetailRows();

    const sessionRows = groupRows(
        rows,
        row => row.session_type,
        row => ({
            session_type: row.session_type || "Unknown",
            sessions: 0,
            drivers: 0,
            laps: 0
        }),
        (item, row) => {
            item.sessions += row.sessions || 0;
            item.drivers += row.drivers || 0;
            item.laps += row.laps || 0;
        }
    );

    const order = {
        Practice: 1,
        Qualifying: 2,
        Race: 3,
        Unknown: 99
    };

    sessionRows.sort((a, b) => {
        return (order[a.session_type] || 99) - (order[b.session_type] || 99);
    });

    return sessionRows;
}

function getCarRows()
{
    return (activityData.activity_by_car || [])
        .slice()
        .sort((a, b) => (b.entries || 0) - (a.entries || 0))
        .slice(0, 20);
}

function renderActivityCards()
{
    const dateRows = getDateRows();
    const serverRows = getServerRows();
    const trackRows = getTrackRows();
    const carRows = getCarRows();

    const sessions = dateRows.reduce((sum, row) => sum + (row.sessions || 0), 0);
    const drivers = Math.max(0, ...dateRows.map(row => row.drivers || 0));
    const laps = dateRows.reduce((sum, row) => sum + (row.laps || 0), 0);
    const servers = serverRows.length;
    const tracks = trackRows.length;
    const cars = carRows.length;

    const container = document.getElementById("activityCards");

    container.innerHTML = `
        <div class="dashboard-card accent-card">
            <div class="dashboard-card-title">Sessions</div>
            <div class="dashboard-card-value">${formatNumber(sessions)}</div>
            <div class="dashboard-card-note">Selected period</div>
        </div>

        <div class="dashboard-card">
            <div class="dashboard-card-title">Drivers</div>
            <div class="dashboard-card-value">${formatNumber(drivers)}</div>
            <div class="dashboard-card-note">Peak daily drivers</div>
        </div>

        <div class="dashboard-card">
            <div class="dashboard-card-title">Laps</div>
            <div class="dashboard-card-value">${formatNumber(laps)}</div>
            <div class="dashboard-card-note">Analyzed laps</div>
        </div>

        <div class="dashboard-card">
            <div class="dashboard-card-title">Servers</div>
            <div class="dashboard-card-value">${formatNumber(servers)}</div>
            <div class="dashboard-card-note">Active in filter</div>
        </div>

        <div class="dashboard-card">
            <div class="dashboard-card-title">Tracks</div>
            <div class="dashboard-card-value">${formatNumber(tracks)}</div>
            <div class="dashboard-card-note">Driven tracks</div>
        </div>

        <div class="dashboard-card">
            <div class="dashboard-card-title">Cars</div>
            <div class="dashboard-card-value">${formatNumber(cars)}</div>
            <div class="dashboard-card-note">Top car models</div>
        </div>
    `;
}

function renderInfo()
{
    const info = document.getElementById("activityInfo");
    const dateRows = getDateRows();

    if (!info) return;

    if (dateRows.length === 0) {
        info.innerHTML = "No activity data for selected filters.";
        return;
    }

    const first = dateRows[0].date;
    const last = dateRows[dateRows.length - 1].date;
    const period = currentActivityPeriod === "all"
        ? "all available data"
        : `last ${currentActivityPeriod} days`;

    info.innerHTML = `Showing <b>${period}</b> · ${escapeHtml(first)} → ${escapeHtml(last)}`;
}

function renderGroupedBarChart(elementId, rows)
{
    const container = document.getElementById(elementId);

    if (!container) return;

    if (!rows || rows.length === 0) {
        container.innerHTML = `<div class="empty-chart">No data</div>`;
        return;
    }

    const width = 920;
    const height = 320;
    const left = 42;
    const right = 18;
    const top = 24;
    const bottom = 54;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const series = [
        { key: "sessions", label: "Sessions" },
        { key: "drivers", label: "Drivers" },
        { key: "laps", label: "Laps" }
    ];

    const maxBySeries = {};

    series.forEach(item => {
        maxBySeries[item.key] = Math.max(...rows.map(row => row[item.key] || 0), 1);
    });

    const groupWidth = chartWidth / rows.length;
    const barGap = Math.min(4, Math.max(2, groupWidth * 0.05));
    const innerPadding = Math.min(10, Math.max(4, groupWidth * 0.12));
    const availableBarWidth = Math.max(3, groupWidth - innerPadding * 2 - barGap * 2);
    const barWidth = Math.max(2, availableBarWidth / 3);

    function x(index, seriesIndex)
    {
        const groupX = left + index * groupWidth + innerPadding;
        return groupX + seriesIndex * (barWidth + barGap);
    }

    function y(normalized)
    {
        return top + chartHeight - normalized * chartHeight;
    }

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(part => {
        const yy = top + chartHeight - part * chartHeight;
        return `<line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}" class="chart-grid-line" />`;
    }).join("");

    const bars = rows.map((row, index) => {
        return series.map((item, seriesIndex) => {
            const value = row[item.key] || 0;
            const normalized = value / maxBySeries[item.key];
            const barHeight = Math.max(value > 0 ? 2 : 0, normalized * chartHeight);
            const xx = x(index, seriesIndex);
            const yy = top + chartHeight - barHeight;

            return `<rect class="activity-bar activity-bar-${item.key}" x="${xx}" y="${yy}" width="${barWidth}" height="${barHeight}" rx="3">
                <title>${row.date} · ${item.label}: ${value}</title>
            </rect>`;
        }).join("");
    }).join("");

    const tickCount = Math.min(8, rows.length);
    const step = Math.max(1, Math.floor(rows.length / tickCount));
    const ticks = rows.map((row, index) => {
        if (index % step !== 0 && index !== rows.length - 1) return "";
        const center = left + index * groupWidth + groupWidth / 2;
        return `<text x="${center}" y="${height - 18}" class="chart-axis-label" text-anchor="middle">${escapeHtml(row.date.substring(5))}</text>`;
    }).join("");

    container.innerHTML = `
        <div class="chart-legend">
            <span class="legend-sessions">Sessions</span>
            <span class="legend-drivers">Drivers</span>
            <span class="legend-laps">Laps</span>
        </div>
        <svg viewBox="0 0 ${width} ${height}" class="activity-svg" preserveAspectRatio="none">
            ${gridLines}
            <line x1="${left}" y1="${top + chartHeight}" x2="${width - right}" y2="${top + chartHeight}" class="chart-axis-line" />
            ${bars}
            ${ticks}
        </svg>
        <p class="chart-note">Bars are grouped by date. Heights are normalized per metric so sessions, drivers and laps remain readable together.</p>
    `;
}
function renderHorizontalBars(elementId, rows, labelFn, valueKey, maxRows)
{
    const container = document.getElementById(elementId);

    if (!container) return;

    const visibleRows = rows
        .filter(row => (row[valueKey] || 0) > 0)
        .slice(0, maxRows || 10);

    if (visibleRows.length === 0) {
        container.innerHTML = `<div class="empty-chart">No data</div>`;
        return;
    }

    const maxValue = Math.max(...visibleRows.map(row => row[valueKey] || 0), 1);

    container.innerHTML = `
        <div class="bar-list">
            ${visibleRows.map(row => {
                const value = row[valueKey] || 0;
                const width = Math.max(3, value * 100 / maxValue);

                return `
                    <div class="bar-row">
                        <div class="bar-label" title="${escapeHtml(labelFn(row))}">${escapeHtml(labelFn(row))}</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width:${width}%"></div>
                        </div>
                        <div class="bar-value">${formatNumber(value)}</div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function renderHeatmap()
{
    const container = document.getElementById("activityHeatmap");

    if (!container) return;

    const rows = (activityData.activity_heatmap || []).filter(row => {
        return true;
    });

    if (rows.length === 0) {
        container.innerHTML = `<div class="empty-chart">No data</div>`;
        return;
    }

    const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
    const weekdayShort = {
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
        0: "Sun"
    };

    const map = new Map();

    rows.forEach(row => {
        if (!isDateInPeriod(activityData.activity_summary ? activityData.activity_summary.last_activity : null)) {
            // The heatmap is intentionally global by available period.
        }

        map.set(`${row.weekday_number}-${row.hour}`, row.sessions || 0);
    });

    const maxValue = Math.max(...Array.from(map.values()), 1);

    let html = `<div class="heatmap-scroll"><div class="heatmap-grid">`;
    html += `<div class="heatmap-corner"></div>`;

    weekdayOrder.forEach(day => {
        html += `<div class="heatmap-header">${weekdayShort[day]}</div>`;
    });

    for (let hour = 0; hour < 24; hour++) {
        html += `<div class="heatmap-hour">${String(hour).padStart(2, "0")}:00</div>`;

        weekdayOrder.forEach(day => {
            const value = map.get(`${day}-${hour}`) || 0;
            const ratio = value / maxValue;
            const level = value === 0
                ? 0
                : Math.max(1, Math.ceil(ratio * 5));

            html += `<div class="heatmap-cell heatmap-level-${level}" title="${weekdayShort[day]} ${String(hour).padStart(2, "0")}:00 · ${value} sessions">${value || ""}</div>`;
        });
    }

    html += `</div></div>`;

    container.innerHTML = html;
}

function renderActivityTable()
{
    const tbody = document.querySelector("#activityTable tbody");

    if (!tbody) return;

    const rows = getFilteredDetailRows()
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 250);

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">No activity data</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(row => {
        return `
            <tr>
                <td>${escapeHtml(row.date)}</td>
                <td>${escapeHtml(shortServerName(row.server_name))}</td>
                <td>${escapeHtml(formatTrack(row.track))}</td>
                <td>${escapeHtml(row.session_type || "-")}</td>
                <td>${formatNumber(row.sessions || 0)}</td>
                <td>${formatNumber(row.drivers || 0)}</td>
                <td>${formatNumber(row.laps || 0)}</td>
                <td class="lap-time">${formatLap(row.best_lap)}</td>
                <td>${escapeHtml(row.best_driver || "-")}</td>
            </tr>
        `;
    }).join("");
}

function renderActivityPage()
{
    if (!activityData) return;

    renderInfo();
    renderActivityCards();

    renderGroupedBarChart(
        "activityDateChart",
        getDateRows()
    );

    renderHorizontalBars(
        "activityServerChart",
        getServerRows(),
        row => shortServerName(row.server_name),
        "sessions",
        10
    );

    renderHorizontalBars(
        "activityTrackChart",
        getTrackRows(),
        row => formatTrack(row.track),
        "sessions",
        10
    );

    renderHorizontalBars(
        "activitySessionTypeChart",
        getSessionTypeRows(),
        row => row.session_type,
        "sessions",
        8
    );

    renderHorizontalBars(
        "activityCarChart",
        getCarRows(),
        row => getCarLabel(row.car_model),
        "entries",
        20
    );

    renderHeatmap();
    renderActivityTable();
}

function setActivityPeriod(period)
{
    currentActivityPeriod = period;
    renderActivityPage();
}

function resetActivityFilters()
{
    currentActivityPeriod = 90;

    const serverSelect = document.getElementById("serverFilter");
    const trackSelect = document.getElementById("trackFilter");

    if (serverSelect) serverSelect.value = "";
    if (trackSelect) trackSelect.value = "";

    renderActivityPage();
}

fetch("data/acc_analytics.json?ts=" + Date.now())
    .then(response => response.json())
    .then(data => {
        activityData = data;

        populateFilters();
        renderActivityPage();
    })
    .catch(error => {
        console.error(error);

        const info = document.getElementById("activityInfo");

        if (info) {
            info.innerHTML = "Failed to load acc_analytics.json";
        }
    });
