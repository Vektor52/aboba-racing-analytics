console.log("Driver Analytics V2 loaded");

let analyticsData = null;
let currentDriverMode = "active";
let currentSortMode = "activity";

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

    return tracks[track] || track || "-";
}

function formatDate(dateText)
{
    if (!dateText) return "-";
    return dateText.substring(0, 10);
}

function driverStatus(row)
{
    if (row.active)
    {
        return "🟢 Active";
    }

    return "⚪ Inactive";
}

function getCurrentDrivers()
{
    if (!analyticsData) return [];

    let drivers = analyticsData.driver_stats || [];

    if (currentDriverMode === "active")
    {
        drivers = drivers.filter(row => row.active);
    }

    const search = document
        .querySelector("#driverSearch")
        .value
        .trim()
        .toLowerCase();

    if (search.length > 0)
    {
        drivers = drivers.filter(row => {
            return row.driver.toLowerCase().includes(search);
        });
    }

    return drivers;
}

function sortDrivers(drivers)
{
    let sorted = [...drivers];

    if (currentSortMode === "activity")
    {
        sorted.sort((a, b) => {
            if (b.sessions_count !== a.sessions_count)
            {
                return b.sessions_count - a.sessions_count;
            }

            if (b.entries_count !== a.entries_count)
            {
                return b.entries_count - a.entries_count;
            }

            return a.driver.localeCompare(b.driver);
        });
    }

    if (currentSortMode === "pace")
    {
        sorted.sort((a, b) => {
            return a.best_lap - b.best_lap;
        });
    }

    if (currentSortMode === "tracks")
    {
        sorted.sort((a, b) => {
            if (b.tracks_count !== a.tracks_count)
            {
                return b.tracks_count - a.tracks_count;
            }

            return b.sessions_count - a.sessions_count;
        });
    }

    return sorted;
}

function renderDrivers()
{
    const tbody = document.querySelector("#driversTable tbody");
    const info = document.querySelector("#driversInfo");

    tbody.innerHTML = "";

    let drivers = getCurrentDrivers();
    drivers = sortDrivers(drivers);

    if (!drivers || drivers.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="12">No drivers found</td>
        </tr>
        `;

        info.innerHTML = "No drivers found.";
        return;
    }

    drivers.forEach((row, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${row.driver}</td>
            <td>${driverStatus(row)}</td>
            <td>${row.sessions_count}</td>
            <td>${row.tracks_count}</td>
            <td>${row.cars_count}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td>${formatTrack(row.best_track)}</td>
            <td>${getCarName(row.best_car_model)}</td>
            <td>${formatTrack(row.favorite_track)}</td>
            <td>${getCarName(row.favorite_car_model)}</td>
            <td>${formatDate(row.last_seen)}</td>
        </tr>
        `;
    });

    let modeText = "Active drivers only";
    let sortText = "activity";

    if (currentDriverMode === "all")
    {
        modeText = "All drivers";
    }

    if (currentSortMode === "pace")
    {
        sortText = "best lap";
    }

    if (currentSortMode === "tracks")
    {
        sortText = "tracks count";
    }

    info.innerHTML = `
        Mode: <b>${modeText}</b>.
        Sorted by: <b>${sortText}</b>.
        Drivers shown: <b>${drivers.length}</b>.
        Data generated: <b>${analyticsData.meta.generated_at}</b>.
    `;
}

function showActiveDrivers()
{
    currentDriverMode = "active";
    renderDrivers();
}

function showAllDrivers()
{
    currentDriverMode = "all";
    renderDrivers();
}

function sortByActivity()
{
    currentSortMode = "activity";
    renderDrivers();
}

function sortByPace()
{
    currentSortMode = "pace";
    renderDrivers();
}

function sortByTracks()
{
    currentSortMode = "tracks";
    renderDrivers();
}

fetch("data/acc_analytics.json?v=" + Date.now())
.then(response => response.json())
.then(data => {
    analyticsData = data;

    console.log("ACC Analytics loaded:", analyticsData);

    renderDrivers();
})
.catch(error => {
    console.error("ERROR loading acc_analytics.json:", error);
});