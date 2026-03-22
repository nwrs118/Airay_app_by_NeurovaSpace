// --- INITIALISATION & STORAGE ---
const mainContainer = document.getElementById('mainContainer');
const clockDisplay = document.getElementById('digitalClock');
const timezoneSelect = document.getElementById('timezoneSelect');
const daysGrid = document.getElementById('daysGrid');
const monthTitle = document.querySelector('.month-title');
const notificationsList = document.getElementById('notificationsList');

let currentMonth = "MARCH";
let selectedDayKey = "";
let selectedTimezone = "local";

const daysInMonths = { 
    "JANUARY": 31, "FEBRUARY": 28, "MARCH": 31, "APRIL": 30, 
    "MAY": 31, "JUNE": 30, "JULY": 31, "AUGUST": 31, 
    "SEPTEMBER": 30, "OCTOBER": 31, "NOVEMBER": 30, "DECEMBER": 31 
};

// --- 1. SETTINGS & PERSISTENCE ---
function loadSavedSettings() {
    const savedColor = localStorage.getItem('themeColor');
    const savedBg = localStorage.getItem('customBg');
    if (savedColor) applyColor(savedColor);
    if (savedBg) mainContainer.style.backgroundImage = `url('${savedBg}')`;
}

function applyColor(color) {
    document.documentElement.style.setProperty('--sidebar-glass', color + 'e6');
    document.documentElement.style.setProperty('--dark-purple', color);
    const picker = document.getElementById('colorPicker');
    if(picker) picker.value = color;
}

document.getElementById('colorPicker').oninput = (e) => {
    applyColor(e.target.value);
    localStorage.setItem('themeColor', e.target.value);
};

document.getElementById('bgInput').onchange = (e) => {
    const url = e.target.value;
    mainContainer.style.backgroundImage = `url('${url}')`;
    localStorage.setItem('customBg', url);
};

// --- 2. HORLOGE ---
function updateClock() {
    let now = new Date();
    let options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    if (selectedTimezone !== "local") options.timeZone = selectedTimezone;
    clockDisplay.innerText = new Intl.DateTimeFormat('en-GB', options).format(now);
}
setInterval(updateClock, 1000);
timezoneSelect.onchange = (e) => {
    selectedTimezone = e.target.value;
    updateClock();
};

// --- 3. CALENDRIER & NOTES ---
function generateDays(monthName) {
    const dates = daysGrid.querySelectorAll('span');
    dates.forEach(d => d.remove());

    for (let i = 1; i <= daysInMonths[monthName]; i++) {
        const span = document.createElement('span');
        span.innerText = i;
        if (localStorage.getItem(`${monthName}-${i}`)) span.classList.add('event');
        span.onclick = () => openNotepad(i, monthName);
        daysGrid.appendChild(span);
    }
    updateNotifications();
}

function openNotepad(day, month) {
    selectedDayKey = `${month}-${day}`;
    document.getElementById('detailDate').innerText = `${month} ${day}`;
    document.getElementById('noteEditor').style.display = 'block';
    document.getElementById('noteInput').value = localStorage.getItem(selectedDayKey) || "";
    document.getElementById('noteInput').focus();
}

function saveNote() {
    const note = document.getElementById('noteInput').value;
    if (note.trim() === "") localStorage.removeItem(selectedDayKey);
    else localStorage.setItem(selectedDayKey, note);
    generateDays(currentMonth);
}

function deleteNote() {
    localStorage.removeItem(selectedDayKey);
    document.getElementById('noteInput').value = "";
    generateDays(currentMonth);
}

// --- 4. NOTIFICATIONS ---
function updateNotifications() {
    notificationsList.innerHTML = "";
    const keys = Object.keys(localStorage)
        .filter(key => key.includes("-") && key.split('-').length === 2)
        .sort();

    if (keys.length === 0) {
        notificationsList.innerHTML = "<p style='font-size:11px; opacity:0.5;'>No reminders...</p>";
        return;
    }

    keys.forEach(key => {
        const content = localStorage.getItem(key);
        const item = document.createElement('div');
        item.className = "note-item";
        item.innerHTML = `<b>${key}</b><span>${content.substring(0, 20)}...</span>`;
        item.onclick = () => {
            const [m, d] = key.split("-");
            changeMonth(m);
            openNotepad(d, m);
        };
        notificationsList.appendChild(item);
    });
}

// --- 5. NAVIGATION & UI ---
function changeMonth(monthName) {
    currentMonth = monthName;
    monthTitle.innerText = `${monthName} 2026`;
    generateDays(monthName);
    document.querySelectorAll('#monthList li').forEach(li => {
        li.classList.toggle('active', li.innerText === monthName);
    });
}

document.querySelectorAll('#monthList li').forEach(li => {
    li.onclick = function() {
        changeMonth(this.innerText);
        document.getElementById('sidebarMenu').classList.remove('open');
    };
});


document.querySelector('.clock-section').style.minWidth = "150px";
document.getElementById('menuBtn').onclick = () => document.getElementById('sidebarMenu').classList.toggle('open');
document.getElementById('settingsBtn').onclick = () => document.getElementById('settingsModal').style.display = 'flex';
document.getElementById('closeSettings').onclick = () => document.getElementById('settingsModal').style.display = 'none';

function resetData() { 
    if(confirm("Reset everything?")) { localStorage.clear(); location.reload(); } 
}

const closeAppBtn = document.getElementById('closeApp');
if (closeAppBtn) closeAppBtn.onclick = () => window.close();

loadSavedSettings();
changeMonth("MARCH");
updateClock();