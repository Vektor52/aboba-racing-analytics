console.log("Driver Analytics V2 loaded");

let analyticsData = null;
let currentMode = "active";
let sortMode = "activity";
let selectedDrivers = new Set();
let expandedDriver = null;

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

function formatDate(dateText)
{
    if (!dateText) return "-";
    return String(dateText).substring(0, 10);
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

function formatSession(session)
{
    if (session === "Practice") return "Practice";
    if (session === "Qualifying") return "Qualifying";
    if (session === "Race") return "Race";

    return session || "-";
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

function gradeClass(grade)
{
    if (grade === "S") return "grade-s";
    if (grade === "A") return "grade-a";
    if (grade === "B") return "grade-b";
    if (grade === "C") return "grade-c";
    return "grade-d";
}

function getProfiles()
{
    if (!analyticsData) return [];

    if (Array.isArray(analyticsData.driver_profiles)) {
        return analyticsData.driver_profiles;
    }

    return analyticsData.driver_stats || [];
}

function getSafetyMap()
{
    const map = new Map();
    const source = currentMode === "active"
        ? (analyticsData.active_safety_rating || [])
        : (analyticsData.lifetime_safety_rating || []);

    source.forEach(row => {
        if (row.driver) {
            map.set(row.driver, row);
        }
    });

    return map;
}

function getSearchText()
{
    const input = document.getElementById("driverSearch");
    if (!input) return "";
    return input.value.trim().toLowerCase();
}

function getFilteredDrivers()
{
    const search = getSearchText();
    const profiles = getProfiles();

    let rows = profiles.filter(row => {
        if (currentMode === "active" && !row.active) return false;

        if (search && !String(row.driver || "").toLowerCase().includes(search)) {
            return false;
        }

        return true;
    });

    rows.sort((a, b) => {
        if (sortMode === "pace") {
            return (a.best_lap || 999999999) - (b.best_lap || 999999999);
        }

        if (sortMode === "tracks") {
            return (b.tracks_count || 0) - (a.tracks_count || 0)
                || (b.sessions_count || 0) - (a.sessions_count || 0)
                || String(a.driver).localeCompare(String(b.driver));
        }

        return (b.sessions_count || 0) - (a.sessions_count || 0)
            || (b.entries_count || 0) - (a.entries_count || 0)
            || String(a.driver).localeCompare(String(b.driver));
    });

    return rows;
}

function getProfileByDriver(driver)
{
    return getProfiles().find(row => row.driver === driver) || null;
}

function renderMiniStat(label, value, note)
{
    return `
        <div class="driver-mini-card">
            <span>${escapeHtml(label)}</span>
            <b>${escapeHtml(value)}</b>
            <small>${escapeHtml(note || "")}</small>
        </div>
    `;
}

function renderTrackBestRows(profile)
{
    const rows = profile.track_bests || [];

    if (!rows.length) {
        return `<tr><td colspan="8">No track details yet</td></tr>`;
    }

    return rows.map(row => `
        <tr>
            <td>${escapeHtml(formatTrack(row.track))}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td>${formatLap(row.sector1)}</td>
            <td>${formatLap(row.sector2)}</td>
            <td>${formatLap(row.sector3)}</td>
            <td>${escapeHtml(getCarLabel(row.car_model))}</td>
            <td>${escapeHtml(formatSession(row.session))}</td>
            <td>${escapeHtml(formatDate(row.session_date))}</td>
        </tr>
    `).join("");
}

function renderCarUsageRows(profile)
{
    const rows = (profile.car_usage || []).slice(0, 8);

    if (!rows.length) {
        return `<tr><td colspan="5">No car data yet</td></tr>`;
    }

    return rows.map(row => `
        <tr>
            <td>${escapeHtml(getCarLabel(row.car_model))}</td>
            <td>${row.entries || 0}</td>
            <td>${row.tracks || 0}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td>${escapeHtml(formatTrack(row.best_track))}</td>
        </tr>
    `).join("");
}

function renderServerUsageRows(profile)
{
    const rows = (profile.server_usage || []).slice(0, 8);

    if (!rows.length) {
        return `<tr><td colspan="4">No server data yet</td></tr>`;
    }

    return rows.map(row => `
        <tr>
            <td>${escapeHtml(shortServerName(row.server_name))}</td>
            <td>${row.entries || 0}</td>
            <td>${row.tracks || 0}</td>
            <td>${escapeHtml(formatDate(row.last_seen))}</td>
        </tr>
    `).join("");
}

function renderSessionTypeRows(profile)
{
    const rows = profile.session_types || [];

    if (!rows.length) {
        return `<tr><td colspan="3">No session data yet</td></tr>`;
    }

    return rows.map(row => `
        <tr>
            <td>${escapeHtml(formatSession(row.session))}</td>
            <td>${row.entries || 0}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
        </tr>
    `).join("");
}

function renderDriverDetails(profile)
{
    return `
        <div class="driver-details-card">
            <div class="driver-details-header">
                <div>
                    <h3>${escapeHtml(profile.driver)}</h3>
                    <p>Detailed driver profile across ABOBA Racing servers</p>
                </div>
            </div>

            <div class="driver-mini-grid">
                ${renderMiniStat("Total laps", profile.total_laps || 0, "from safety laps")}
                ${renderMiniStat("Valid / Invalid", `${profile.valid_laps || 0} / ${profile.invalid_laps || 0}`, "lap validity")}
                ${renderMiniStat("Sessions", profile.sessions_count || 0, "imported sessions")}
                ${renderMiniStat("Tracks", profile.tracks_count || 0, "visited tracks")}
                ${renderMiniStat("Cars", profile.cars_count || 0, "used cars")}
                ${renderMiniStat("Servers", profile.servers_count || 0, "visited servers")}
            </div>

            <div class="driver-details-grid">
                <div class="panel-box driver-detail-panel driver-detail-panel-wide">
                    <h3>Best laps by track</h3>
                    <div class="mini-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Track</th>
                                    <th>Best Lap</th>
                                    <th>S1</th>
                                    <th>S2</th>
                                    <th>S3</th>
                                    <th>Car</th>
                                    <th>Session</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>${renderTrackBestRows(profile)}</tbody>
                        </table>
                    </div>
                </div>

                <div class="panel-box driver-detail-panel">
                    <h3>Used cars</h3>
                    <div class="mini-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Car</th>
                                    <th>Entries</th>
                                    <th>Tracks</th>
                                    <th>Best Lap</th>
                                    <th>Best Track</th>
                                </tr>
                            </thead>
                            <tbody>${renderCarUsageRows(profile)}</tbody>
                        </table>
                    </div>
                </div>

                <div class="panel-box driver-detail-panel">
                    <h3>Visited servers</h3>
                    <div class="mini-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Server</th>
                                    <th>Entries</th>
                                    <th>Tracks</th>
                                    <th>Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>${renderServerUsageRows(profile)}</tbody>
                        </table>
                    </div>
                </div>

                <div class="panel-box driver-detail-panel">
                    <h3>Session types</h3>
                    <div class="mini-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Session</th>
                                    <th>Entries</th>
                                    <th>Best Lap</th>
                                </tr>
                            </thead>
                            <tbody>${renderSessionTypeRows(profile)}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDrivers()
{
    if (!analyticsData) return;

    const tbody = document.querySelector("#driversTable tbody");
    const info = document.getElementById("driversInfo");
    const safetyMap = getSafetyMap();
    const rows = getFilteredDrivers();

    if (!tbody) return;

    tbody.innerHTML = "";

    rows.forEach((row, index) => {
        const safety = safetyMap.get(row.driver);
        const grade = safety ? safety.grade : "-";
        const safetyScore = safety ? safety.safety_score : null;
        const trustedTitle = safety ? `${grade} · ${safetyScore}` : "-";
        const checked = selectedDrivers.has(row.driver) ? "checked" : "";
        const isExpanded = expandedDriver === row.driver;

        const tr = document.createElement("tr");
        tr.className = isExpanded ? "driver-row driver-row-expanded" : "driver-row";
        tr.innerHTML = `
            <td class="compare-cell">
                <input type="checkbox" ${checked} data-driver="${escapeHtml(row.driver)}" onclick="toggleCompareByElement(event, this)">
            </td>
            <td>${index + 1}</td>
            <td class="driver-name-cell">${escapeHtml(row.driver)}</td>
            <td>${safety ? `<span class="grade-badge ${gradeClass(grade)}">${escapeHtml(grade)}</span> <span class="safety-score">${escapeHtml(safetyScore)}</span>` : "-"}</td>
            <td>${row.sessions_count || 0}</td>
            <td>${row.tracks_count || 0}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td>${escapeHtml(formatTrack(row.best_track))}</td>
            <td>${escapeHtml(getCarLabel(row.favorite_car_model || row.best_car_model))}</td>
            <td>${escapeHtml(formatTrack(row.favorite_track))}</td>
            <td>
                <button class="small-action-button" data-driver="${escapeHtml(row.driver)}" onclick="toggleDetailsByElement(event, this)">
                    ${isExpanded ? "Hide" : "Details"}
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        if (isExpanded) {
            const detailTr = document.createElement("tr");
            detailTr.className = "driver-details-row";
            detailTr.innerHTML = `
                <td colspan="11">
                    ${renderDriverDetails(row)}
                </td>
            `;
            tbody.appendChild(detailTr);
        }
    });

    if (info) {
        const modeText = currentMode === "active" ? "active drivers" : "all drivers";
        info.innerHTML = `Showing <b>${rows.length}</b> ${modeText}. Select drivers with checkboxes to compare sectors.`;
    }

    renderComparePanel();
}

function toggleDetailsByElement(event, button)
{
    event.stopPropagation();
    const driver = button.getAttribute("data-driver");

    expandedDriver = expandedDriver === driver ? null : driver;
    renderDrivers();
}

function toggleCompareByElement(event, checkbox)
{
    event.stopPropagation();
    const driver = checkbox.getAttribute("data-driver");

    if (checkbox.checked) {
        selectedDrivers.add(driver);
    } else {
        selectedDrivers.delete(driver);
    }

    renderComparePanel();
}

function getCompareRows()
{
    const selected = Array.from(selectedDrivers)
        .map(driver => getProfileByDriver(driver))
        .filter(Boolean);

    const trackSet = new Set();

    selected.forEach(profile => {
        (profile.track_bests || []).forEach(row => {
            if (row.track) trackSet.add(row.track);
        });
    });

    const tracks = Array.from(trackSet).sort();
    const output = [];

    tracks.forEach(track => {
        const available = selected
            .map(profile => {
                const best = (profile.track_bests || []).find(row => row.track === track);

                return {
                    profile,
                    best
                };
            })
            .filter(item => item.best);

        const bestLap = available.length
            ? Math.min(...available.map(item => item.best.best_lap || 999999999))
            : null;

        selected.forEach(profile => {
            const best = (profile.track_bests || []).find(row => row.track === track);

            if (!best) {
                output.push({
                    track,
                    driver: profile.driver,
                    missing: true
                });
                return;
            }

            output.push({
                track,
                driver: profile.driver,
                best_lap: best.best_lap,
                gap: bestLap !== null ? best.best_lap - bestLap : null,
                sector1: best.sector1,
                sector2: best.sector2,
                sector3: best.sector3,
                car_model: best.car_model,
                session: best.session,
                session_date: best.session_date
            });
        });
    });

    return output;
}

function formatGap(ms)
{
    if (ms === null || ms === undefined) return "-";
    if (ms === 0) return "Best";

    return "+" + (ms / 1000).toFixed(3);
}

function renderComparePanel()
{
    const panel = document.getElementById("comparePanel");
    const summary = document.getElementById("compareSummary");
    const tbody = document.querySelector("#compareTable tbody");

    if (!panel || !summary || !tbody) return;

    const count = selectedDrivers.size;

    if (count === 0) {
        panel.classList.add("hidden");
        tbody.innerHTML = "";
        return;
    }

    panel.classList.remove("hidden");

    if (count < 2) {
        summary.innerHTML = `Selected <b>${count}</b> driver. Select at least 2 drivers for comparison.`;
        tbody.innerHTML = `
            <tr>
                <td colspan="9">Select one more driver to compare best laps and sectors.</td>
            </tr>
        `;
        return;
    }

    const rows = getCompareRows();
    summary.innerHTML = `Selected <b>${count}</b> drivers. Comparing best laps by track with sector times.`;

    if (!rows.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">No comparable track data found.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map(row => {
        if (row.missing) {
            return `
                <tr class="compare-missing-row">
                    <td>${escapeHtml(formatTrack(row.track))}</td>
                    <td>${escapeHtml(row.driver)}</td>
                    <td colspan="7">No result on this track</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${escapeHtml(formatTrack(row.track))}</td>
                <td>${escapeHtml(row.driver)}</td>
                <td class="lap-time">${formatLap(row.best_lap)}</td>
                <td>${formatGap(row.gap)}</td>
                <td>${formatLap(row.sector1)}</td>
                <td>${formatLap(row.sector2)}</td>
                <td>${formatLap(row.sector3)}</td>
                <td>${escapeHtml(getCarLabel(row.car_model))}</td>
                <td>${escapeHtml(formatSession(row.session))}</td>
            </tr>
        `;
    }).join("");
}

function compareSelected()
{
    renderComparePanel();

    const panel = document.getElementById("comparePanel");
    if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function clearCompare()
{
    selectedDrivers.clear();
    renderDrivers();
}

function showActiveDrivers()
{
    currentMode = "active";
    renderDrivers();
}

function showAllDrivers()
{
    currentMode = "all";
    renderDrivers();
}

function sortByActivity()
{
    sortMode = "activity";
    renderDrivers();
}

function sortByPace()
{
    sortMode = "pace";
    renderDrivers();
}

function sortByTracks()
{
    sortMode = "tracks";
    renderDrivers();
}

fetch("data/acc_analytics.json?v=" + Date.now())
    .then(response => response.json())
    .then(data => {
        analyticsData = data;
        renderDrivers();
    })
    .catch(error => {
        console.error("Driver Analytics loading error:", error);
        const info = document.getElementById("driversInfo");
        if (info) {
            info.textContent = "Failed to load acc_analytics.json";
        }
    });
