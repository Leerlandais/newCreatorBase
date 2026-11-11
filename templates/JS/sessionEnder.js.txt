const SESSION_CHECK_INTERVAL = 10000;
const sessionExpiresAt = parseInt((document.getElementById("sessionExpiresAt").textContent));
console.log("pageRefresher loaded ; timeout set at : ", sessionExpiresAt);
function checkSessionExpiry() {
    if (Date.now() >= sessionExpiresAt) {
        location.replace("https://leerlandais.com/dokus");
    }
}

setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);

window.addEventListener("focus", checkSessionExpiry);

window.addEventListener("pageshow", checkSessionExpiry);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        checkSessionExpiry();
    }
});