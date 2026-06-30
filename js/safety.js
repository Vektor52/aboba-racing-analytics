console.log("Safety Rating V1 loaded");

let analyticsData = null;

let currentSafetyMode = "active";
let currentViewMode = "trusted";
let currentSortMode = "safety";

function formatDate(dateText)
{
    if (!dateText) return "-";
    return dateText.substring(0, 10);
}

function confidenceWeight(confidence)
{
    if (confidence === "high") return 4;
    if (confidence === "medium") return 3;
    if (confidence === "low") return 2;
    if (confidence === "very_low") return 1;
    return 0;
}

function confidenceLabel(confidence)
{
    if (confidence === "high") return "🟢 High";
    if (confidence === "medium") return "🟡 Medium";
    if (confidence === "low") return "🟠 Low";
    if (confidence === "very_low") return "🔴 Very low";
    return "-";
}

function gradeClass(grade)
{
    if (grade === "S") return "grade-s";
    if (grade === "A") return "grade-a";
    if (grade === "B") return "grade-b";
    if (grade === "C") return "grade-c";
    return "grade-d";
}

function getSafetySource()
{
    if (!analyticsData) return [];

    if (currentSafetyMode === "lifetime")
    {
        return analyticsData.lifetime_safety_rating || [];
    }

    return analyticsData.active_safety_rating || [];
}

function getVisibleSafety()
{
    let rows = getSafetySource();

    if (currentViewMode === "trusted")
    {
        rows = rows.filter(row => {
            return row.confidence === "high" || row.confidence === "medium";
        });
    }

    const search = document
        .querySelector("#safetySearch")
        .value
        .trim()
        .toLowerCase();

    if (search.length > 0)
    {
        rows = rows.filter(row => {
            return row.driver.toLowerCase().includes(search);
        });
    }

    return rows;
}

function sortSafety(rows)
{
    let sorted = [...rows];

    if (currentSortMode === "safety")
    {
        sorted.sort((a, b) => {
            if (confidenceWeight(b.confidence) !== confidenceWeight(a.confidence))
            {
                return confidenceWeight(b.confidence) - confidenceWeight(a.confidence);
            }

            if (b.safety_score !== a.safety_score)
            {
                return b.safety_score - a.safety_score;
            }

            return b.total_laps - a.total_laps;
        });
    }

    if (currentSortMode === "laps")
    {
        sorted.sort((a, b) => {
            if (b.total_laps !== a.total_laps)
            {
                return b.total_laps - a.total_laps;
            }

            return b.safety_score - a.safety_score;
        });
    }

    if (currentSortMode === "penalties")
    {
        sorted.sort((a, b) => {
            if (a.penalties_per_100 !== b.penalties_per_100)
            {
                return a.penalties_per_100 - b.penalties_per_100;
            }

            if (a.invalid_laps_per_100 !== b.invalid_laps_per_100)
            {
                return a.invalid_laps_per_100 - b.invalid_laps_per_100;
            }

            return b.total_laps - a.total_laps;
        });
    }

    return sorted;
}

function renderSafetyCards()
{
    const container = document.querySelector("#safetyCards");

    const rows = analyticsData.active_safety_rating || [];

    const trusted = rows.filter(row => {
        return row.confidence === "high" || row.confidence === "medium";
    });

    const sCount = trusted.filter(row => row.grade === "S").length;
    const aCount = trusted.filter(row => row.grade === "A").length;
    const riskyCount = trusted.filter(row => row.grade === "C" || row.grade === "D").length;

    const totalLaps = rows.reduce((sum, row) => sum + row.total_laps, 0);
    const totalPenalties = rows.reduce((sum, row) => sum + row.penalties_count + row.post_race_penalties_count, 0);

    container.innerHTML = `
        <div class="dashboard-grid">

            <div class="dashboard-card">
                <div class="dashboard-card-title">Rated Drivers</div>
                <div class="dashboard-card-value">${rows.length}</div>
                <div class="dashboard-card-note">All safety entries</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Trusted</div>
                <div class="dashboard-card-value">${trusted.length}</div>
                <div class="dashboard-card-note">Medium / high confidence</div>
            </div>

            <div class="dashboard-card accent-card">
                <div class="dashboard-card-title">S Grade</div>
                <div class="dashboard-card-value">${sCount}</div>
                <div class="dashboard-card-note">Clean drivers</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">A Grade</div>
                <div class="dashboard-card-value">${aCount}</div>
                <div class="dashboard-card-note">Safe drivers</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Risky</div>
                <div class="dashboard-card-value">${riskyCount}</div>
                <div class="dashboard-card-note">C / D grade</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Safety Laps</div>
                <div class="dashboard-card-value">${totalLaps}</div>
                <div class="dashboard-card-note">Analyzed laps</div>
            </div>

            <div class="dashboard-card">
                <div class="dashboard-card-title">Penalties</div>
                <div class="dashboard-card-value">${totalPenalties}</div>
                <div class="dashboard-card-note">Normal + post-race</div>
            </div>

        </div>
    `;
}

function renderSafety()
{
    const tbody = document.querySelector("#safetyTable tbody");
    const info = document.querySelector("#safetyInfo");

    tbody.innerHTML = "";

    let rows = getVisibleSafety();
    rows = sortSafety(rows);

    if (!rows || rows.length === 0)
    {
        tbody.innerHTML = `
        <tr>
            <td colspan="14">No safety rating data found</td>
        </tr>
        `;

        info.innerHTML = "No safety data found.";
        return;
    }

    rows.forEach((row, index) => {
        const totalPenalties = row.penalties_count + row.post_race_penalties_count;

        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${row.driver}</td>
            <td><span class="grade-badge ${gradeClass(row.grade)}">${row.grade}</span></td>
            <td class="safety-score">${row.safety_score}</td>
            <td>${confidenceLabel(row.confidence)}</td>
            <td>${row.total_laps}</td>
            <td>${row.valid_laps}</td>
            <td>${row.invalid_laps}</td>
            <td>${row.invalid_laps_per_100}</td>
            <td>${totalPenalties}</td>
            <td>${row.penalties_per_100}</td>
            <td>${row.sessions_count}</td>
            <td>${row.tracks_count}</td>
            <td>${formatDate(row.last_seen)}</td>
        </tr>
        `;
    });

    let sourceText = "Active 90-day window";
    let viewText = "trusted drivers only";
    let sortText = "safety score";

    if (currentSafetyMode === "lifetime")
    {
        sourceText = "Lifetime";
    }

    if (currentViewMode === "all")
    {
        viewText = "all drivers";
    }

    if (currentSortMode === "laps")
    {
        sortText = "laps count";
    }

    if (currentSortMode === "penalties")
    {
        sortText = "penalties per 100 laps";
    }

    info.innerHTML = `
        Source: <b>${sourceText}</b>.
        View: <b>${viewText}</b>.
        Sorted by: <b>${sortText}</b>.
        Drivers shown: <b>${rows.length}</b>.
        Model: <b>${analyticsData.meta.safety_model}</b>.
        Data generated: <b>${analyticsData.meta.generated_at}</b>.
    `;
}

function showTrusted()
{
    currentViewMode = "trusted";
    renderSafety();
}

function showAll()
{
    currentViewMode = "all";
    renderSafety();
}

function showLifetime()
{
    currentSafetyMode = "lifetime";
    renderSafety();
}

function showActive()
{
    currentSafetyMode = "active";
    renderSafety();
}

function sortBySafety()
{
    currentSortMode = "safety";
    renderSafety();
}

function sortByLaps()
{
    currentSortMode = "laps";
    renderSafety();
}

function sortByPenalties()
{
    currentSortMode = "penalties";
    renderSafety();
}

fetch("data/acc_analytics.json?v=" + Date.now())
.then(response => response.json())
.then(data => {
    analyticsData = data;

    console.log("ACC Analytics loaded:", analyticsData);

    renderSafetyCards();
    renderSafety();
})
.catch(error => {
    console.error("ERROR loading acc_analytics.json:", error);
});