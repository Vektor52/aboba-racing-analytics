console.log("Track Records V2 loaded");

let analyticsData = null;
let currentMode = "current";

function formatLap(ms)
{
    if (ms === null || ms === undefined) return "-";

    let total = ms / 1000;
    let minutes = Math.floor(total / 60);
    let seconds = (total % 60).toFixed(3);

    return minutes + ":" + seconds.padStart(6, "0");
}

function formatSector(ms)
{
    if (ms === null || ms === undefined) return "-";
    return (ms / 1000).toFixed(3);
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
        indianapolis: "Indianapolis"
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

function shortServerName(serverName)
{
    if (!serverName) return "-";

    return serverName
        .replace("ABOBA RACING ", "")
        .replace(" /VOLGA-RUS/", "")
        .trim();
}

function formatDate(dateText)
{
    if (!dateText) return "-";

    return dateText.substring(0, 10);
}

function renderRecords(records, mode)
{
    let tbody = document.querySelector("#recordsTable tbody");
    let info = document.querySelector("#recordsInfo");

    tbody.innerHTML = "";

    if (!records || records.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="10">No records found</td>
        </tr>
        `;
        return;
    }

    records.forEach(row => {
        tbody.innerHTML += `
        <tr>
            <td>${formatTrack(row.track)}</td>
            <td>${row.driver}</td>
            <td>${getCarName(row.car_model)}</td>
            <td>${sessionShort(row.session)}</td>
            <td>${shortServerName(row.server_name)}</td>
            <td>${formatSector(row.sector1)}</td>
            <td>${formatSector(row.sector2)}</td>
            <td>${formatSector(row.sector3)}</td>
            <td>${formatLap(row.lap_ms)}</td>
            <td>${formatDate(row.driver_last_seen)}</td>
        </tr>
        `;
    });

    if (mode === "current")
    {
        info.innerHTML = `
            Showing current records from active drivers.
            Activity window: ${analyticsData.meta.activity_window_days} days.
            Active drivers: ${analyticsData.site_stats.drivers_active}.
        `;
    }
    else
    {
        info.innerHTML = `
            Showing all-time historical records.
            These records include active and inactive drivers.
        `;
    }
}

function showCurrentRecords()
{
    currentMode = "current";

    renderRecords(
        analyticsData.active_track_records,
        "current"
    );
}

function showAllTimeRecords()
{
    currentMode = "all_time";

    renderRecords(
        analyticsData.all_time_track_records,
        "all_time"
    );
}

fetch("data/acc_analytics.json?v=" + Date.now())
.then(response => response.json())
.then(data => {
    analyticsData = data;

    console.log("ACC Analytics loaded:", analyticsData);

    showCurrentRecords();
})
.catch(error => {
    console.error("ERROR loading acc_analytics.json:", error);
});