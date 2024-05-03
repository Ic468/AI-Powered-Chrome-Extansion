document.addEventListener('DOMContentLoaded', function () {
    // Fetch the result from storage when the popup loads
    chrome.storage.local.get("results", function (data) {
        document.getElementById("resultsBox").value = data.results || "No results to display.";
    });
});
document.getElementById("resultsBox").addEventListener('input', function () {
    // Clear storage when the data has been edited or dealt with
    chrome.storage.local.remove("results");
});