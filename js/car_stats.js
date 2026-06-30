console.log("Cars Analytics V2 loaded");

let analyticsData = null;
let currentCarsMode = "active";
let currentSortMode = "popularity";

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

function getCurrentCars()
{
    if (!analyticsData) return [];

    if (currentCarsMode === "active")
    {
        return analyticsData.active_car_stats || [];
    }

    return analyticsData.all_time_car_stats || [];
}

function sortCars(cars)
{
    let sorted = [...cars];

    if (currentSortMode === "popularity")
    {
        sorted.sort((a, b) => {
            if (b.drivers !== a.drivers)
            {
                return b.drivers - a.drivers;
            }

            if (b.entries !== a.entries)
            {
                return b.entries - a.entries;
            }

            return a.best_lap - b.best_lap;
        });
    }

    if (currentSortMode === "speed")
    {
        sorted.sort((a, b) => {
            return a.best_lap - b.best_lap;
        });
    }

    return sorted;
}

function renderCars()
{
    const tbody = document.querySelector("#carsTable tbody");
    const info = document.querySelector("#carsInfo");

    tbody.innerHTML = "";

    let cars = getCurrentCars();
    cars = sortCars(cars);

    if (!cars || cars.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="8">No car statistics found</td>
        </tr>
        `;

        return;
    }

    cars.forEach((row, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${getCarName(row.car_model)}</td>
            <td>${row.drivers}</td>
            <td>${row.entries}</td>
            <td class="lap-time">${formatLap(row.best_lap)}</td>
            <td class="lap-time">${formatLap(row.avg_lap)}</td>
            <td>${formatTrack(row.best_track)}</td>
            <td>${row.best_driver}</td>
        </tr>
        `;
    });

    let modeText = "Active drivers only";
    let sortText = "popularity";

    if (currentCarsMode === "all_time")
    {
        modeText = "All-time data";
    }

    if (currentSortMode === "speed")
    {
        sortText = "best lap";
    }

    info.innerHTML = `
        Mode: <b>${modeText}</b>.
        Sorted by: <b>${sortText}</b>.
        Cars shown: <b>${cars.length}</b>.
        Data generated: <b>${analyticsData.meta.generated_at}</b>.
    `;
}

function showActiveCars()
{
    currentCarsMode = "active";
    renderCars();
}

function showAllTimeCars()
{
    currentCarsMode = "all_time";
    renderCars();
}

function sortByPopularity()
{
    currentSortMode = "popularity";
    renderCars();
}

function sortBySpeed()
{
    currentSortMode = "speed";
    renderCars();
}

fetch("data/acc_analytics.json?v=" + Date.now())
.then(response => response.json())
.then(data => {
    analyticsData = data;

    console.log("ACC Analytics loaded:", analyticsData);

    renderCars();
})
.catch(error => {
    console.error("ERROR loading acc_analytics.json:", error);
});