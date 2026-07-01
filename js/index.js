console.log("Index Dashboard V2.1 Home counters loaded");

function formatLap(ms)
{
    if (ms === null || ms === undefined) return "-";

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

    return tracks[track] || track;
}

function sessionShort(session)
{
    if (session === "Practice") return "🟢 P";
    if (session === "Qualifying") return "🟡 Q";
    if (session === "Race") return "🔴 R";

    return session || "-";
}

function formatDate(dateText)
{
    if (!dateText) return "-";
    return dateText.substring(0, 10);
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

function isTrustedSafety(row)
{
    return row.confidence === "high" || row.confidence === "medium";
}

function renderDashboardCards(data)
{
    const stats = data.site_stats || {};
    const meta = data.meta || {};

    const safetyRows = data.active_safety_rating || [];
    const trustedRows = safetyRows.filter(isTrustedSafety);

    const trustedCount = stats.trusted_drivers_total !== undefined
        ? stats.trusted_drivers_total
        : trustedRows.filter(row => row.grade === "S" || row.grade === "A").length;

    const riskyCount = stats.risky_drivers_total !== undefined
        ? stats.risky_drivers_total
        : trustedRows.filter(row => row.grade === "C" || row.grade === "D").length;

    const totalLaps = stats.safety_laps_total || stats.lap_entries_total || 0;
    const lastUpdate = formatDate(meta.generated_at);
    const topTrack = stats.top_track ? formatTrack(stats.top_track) : "-";
    const topCar = stats.top_car_model !== null && stats.top_car_model !== undefined
        ? getCarName(stats.top_car_model)
        : "-";

    const container = document.querySelector("#dashboardCards");

    container.innerHTML = `
        <div class="dashboard-grid">

            <div class="dashboard-card accent-card">
                <div class="dashboard-card-title">Active Drivers</div>
                <div class="dashboard-card-value">${stats.drivers_active || 0}</div>
                <div class="dashboard-card-note">Total: ${stats.drivers_total || 0}</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Sessions</div>
                <div class="dashboard-card-value">${stats.sessions_total || 0}</div>
                <div class="dashboard-card-note">Imported sessions</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Total Laps</div>
                <div class="dashboard-card-value">${totalLaps}</div>
                <div class="dashboard-card-note">Analyzed laps</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Servers</div>
                <div class="dashboard-card-value">${stats.servers_total || 0}</div>
                <div class="dashboard-card-note">ACC servers</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Tracks</div>
                <div class="dashboard-card-value">${stats.tracks_total || 0}</div>
                <div class="dashboard-card-note">Collected tracks</div>
            </div>

            <div class="dashboard-card accent-card">
                <div class="dashboard-card-title">Trusted</div>
                <div class="dashboard-card-value">${trustedCount}</div>
                <div class="dashboard-card-note">S / A trusted drivers</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Risky</div>
                <div class="dashboard-card-value">${riskyCount}</div>
                <div class="dashboard-card-note">Trusted C / D grade</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Last Update</div>
                <div class="dashboard-card-value dashboard-card-date">${lastUpdate}</div>
                <div class="dashboard-card-note">Data generated</div>
            </div>

        </div>

        <div class="quick-activity-grid">
            <div class="quick-activity-chip">
                <span>Top Track</span>
                <b>${topTrack}</b>
                <small>${stats.top_track_sessions || 0} sessions</small>
            </div>

            <div class="quick-activity-chip">
                <span>Top Car</span>
                <b>${topCar}</b>
                <small>${stats.top_car_entries || 0} entries</small>
            </div>

            <div class="quick-activity-chip">
                <span>New Drivers 7d</span>
                <b>${stats.new_drivers_last_7_days || 0}</b>
                <small>first seen drivers</small>
            </div>

            <div class="quick-activity-chip">
                <span>Sessions 7d</span>
                <b>${stats.sessions_last_7_days || 0}</b>
                <small>recent sessions</small>
            </div>
        </div>
    `;
}

function renderSafetySnapshot(data)
{
    renderTopSafety(data);
    renderRiskySafety(data);
}

function renderTopSafety(data)
{
    const tbody = document.querySelector("#topSafetyTable tbody");
    tbody.innerHTML = "";

    let rows = data.active_safety_rating || [];

    rows = rows
        .filter(isTrustedSafety)
        .sort((a, b) => {
            if (b.safety_score !== a.safety_score)
            {
                return b.safety_score - a.safety_score;
            }

            return b.total_laps - a.total_laps;
        })
        .slice(0, 8);

    if (rows.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="6">No trusted safety data found</td>
        </tr>
        `;
        return;
    }

    rows.forEach((row, index) => {
        const penaltiesTotal = row.penalties_count + row.post_race_penalties_count;

        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${row.driver}</td>
            <td><span class="grade-badge ${gradeClass(row.grade)}">${row.grade}</span></td>
            <td class="safety-score">${row.safety_score}</td>
            <td>${row.total_laps}</td>
            <td>${penaltiesTotal}</td>
        </tr>
        `;
    });
}

function renderRiskySafety(data)
{
    const tbody = document.querySelector("#riskySafetyTable tbody");
    tbody.innerHTML = "";

    let rows = data.active_safety_rating || [];

    rows = rows
        .filter(isTrustedSafety)
        .filter(row => row.grade === "C" || row.grade === "D")
        .sort((a, b) => {
            if (a.safety_score !== b.safety_score)
            {
                return a.safety_score - b.safety_score;
            }

            return b.total_laps - a.total_laps;
        })
        .slice(0, 8);

    if (rows.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="6">No risky trusted drivers found</td>
        </tr>
        `;
        return;
    }

    rows.forEach((row, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${row.driver}</td>
            <td><span class="grade-badge ${gradeClass(row.grade)}">${row.grade}</span></td>
            <td class="safety-score">${row.safety_score}</td>
            <td>${row.invalid_laps_per_100}</td>
            <td>${row.penalties_per_100}</td>
        </tr>
        `;
    });
}

function renderCurrentRecords(data)
{
    const tbody = document.querySelector("#currentRecordsTable tbody");
    tbody.innerHTML = "";

    const records = data.active_track_records || [];

    records.forEach(row => {
        tbody.innerHTML += `
        <tr>
            <td>${formatTrack(row.track)}</td>
            <td>${row.driver}</td>
            <td>${getCarName(row.car_model)}</td>
            <td>${sessionShort(row.session)}</td>
            <td class="lap-time">${formatLap(row.lap_ms)}</td>
        </tr>
        `;
    });

    if (records.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="5">No current records found</td>
        </tr>
        `;
    }
}

function renderCars(data)
{
    const tbody = document.querySelector("#carsTable tbody");
    tbody.innerHTML = "";

    const cars = (data.active_car_stats || []).slice(0, 10);

    cars.forEach(row => {
        tbody.innerHTML += `
        <tr>
            <td>${getCarName(row.car_model)}</td>
            <td>${row.drivers}</td>
            <td>${row.entries}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td>${row.best_driver}</td>
        </tr>
        `;
    });

    if (cars.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="5">No car stats found</td>
        </tr>
        `;
    }
}

function renderServers(data)
{
    const tbody = document.querySelector("#serversTable tbody");
    tbody.innerHTML = "";

    const servers = data.servers || [];

    servers.forEach(row => {
        tbody.innerHTML += `
        <tr>
            <td>${shortServerName(row.server_name)}</td>
            <td>${row.sessions_count}</td>
            <td>${row.tracks_count}</td>
            <td>${formatDate(row.first_seen)}</td>
            <td>${formatDate(row.last_seen)}</td>
        </tr>
        `;
    });

    if (servers.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="5">No servers found</td>
        </tr>
        `;
    }
}

function renderUpdatedInfo(data)
{
    const info = document.querySelector("#updatedInfo");

    info.innerHTML = `
        Data generated: <b>${data.meta.generated_at}</b>.
        Current records and safety snapshot use active window since <b>${data.meta.active_cutoff}</b>.
        Safety model: <b>${data.meta.safety_model || "-"}</b>.
    `;
}

fetch("data/acc_analytics.json?v=" + Date.now())
.then(response => response.json())
.then(data => {
    console.log("ACC Analytics loaded:", data);

    renderDashboardCards(data);
    renderSafetySnapshot(data);
    renderCurrentRecords(data);
    renderCars(data);
    renderServers(data);
    renderUpdatedInfo(data);
})
.catch(error => {
    console.error("ERROR loading acc_analytics.json:", error);
});