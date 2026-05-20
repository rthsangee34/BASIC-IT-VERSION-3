/* 
  IPOS Simulator - Core Logic
  Manages state, animations, and data processing
*/

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    // Initialize UI
    toggleInputs();
});

let currentChallenges = [
    { target: "ANTIGRAVITY", input: "antigravity", op: "upper", desc: "MISSION: Convert the text 'antigravity' to uppercase." },
    { target: "25", input: "10,15", op: "add", desc: "MISSION: Sum of 10 and 15." },
    { target: "1,2,5,9", input: "5,2,9,1", op: "sort", desc: "MISSION: Sort the list 5, 2, 9, 1." }
];
let currentChallengeIdx = 0;
let progress = 0;

// MODE SWITCHER
function setMode(mode) {
    document.documentElement.className = `active-mode-${mode}`;
    
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}-btn`).classList.add('active');
    
    // Toggle displays
    const hero = document.getElementById('hero');
    const practiceBox = document.getElementById('practice-container');
    
    if(mode === 'learn') {
        hero.style.display = 'block';
        practiceBox.style.display = 'none';
        document.querySelectorAll('.learn-content').forEach(el => el.style.display = 'block');
    } else {
        hero.style.display = 'none';
        practiceBox.style.display = 'block';
        document.querySelectorAll('.learn-content').forEach(el => el.style.display = 'none');
        updateChallenge();
    }
}

// TOGGLE INPUT TYPES
function toggleInputs() {
    const type = document.getElementById('input-type').value;
    
    // Views
    document.getElementById('view-text').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('view-number').style.display = type === 'number' ? 'block' : 'none';
    document.getElementById('view-list').style.display = type === 'list' ? 'block' : 'none';
    
    // Options
    document.getElementById('ops-text').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('ops-math').style.display = type === 'number' ? 'block' : 'none';
    document.getElementById('ops-list').style.display = type === 'list' ? 'block' : 'none';
    
    // Set first valid option as selected
    const opSelect = document.getElementById('op-select');
    if(type === 'text') opSelect.value = 'upper';
    if(type === 'number') opSelect.value = 'add';
    if(type === 'list') opSelect.value = 'sort';
}

// THE MAIN IPOS FLOW ANIMATION SYNC
async function startFlow() {
    // 1. INPUT PHASE
    highlightPanel('input');
    setStatus("Reading input data...");
    await wait(1000);
    
    // 2. PROCESS PHASE - PARTIALLY MOVE
    createParticle('input', 'process');
    highlightPanel('process');
    setStatus("Processing... CPU working...");
    document.getElementById('cog-icon').classList.add('rotating');
    await wait(2000);
    
    // 3. DO THE WORK
    const result = executeOperation();
    
    // 4. OUTPUT PHASE
    createParticle('process', 'output');
    highlightPanel('output');
    showOutput(result);
    document.getElementById('cog-icon').classList.remove('rotating');
    setStatus("Task Complete.");
    await wait(1000);
    
    // 5. STORAGE PHASE
    createParticle('output', 'storage');
    highlightPanel('storage');
    saveToHistory(result);
    await wait(1000);
    
    // FINAL
    clearHighlights();
    checkChallenge(result);
}

// EXECUTION LOGIC
function executeOperation() {
    const type = document.getElementById('input-type').value;
    const op = document.getElementById('op-select').value;
    let result = "";

    if (type === 'text') {
        let val = document.getElementById('data-text').value || "";
        if (op === 'upper') result = val.toUpperCase();
        else if (op === 'lower') result = val.toLowerCase();
        else if (op === 'reverse') result = val.split('').reverse().join('');
    } 
    else if (type === 'number') {
        let a = parseFloat(document.getElementById('num-a').value) || 0;
        let b = parseFloat(document.getElementById('num-b').value) || 0;
        if (op === 'add') result = (a + b).toString();
        else if (op === 'multiply') result = (a * b).toString();
    }
    else if (type === 'list') {
        let listStr = document.getElementById('data-list').value || "";
        let arr = listStr.split(',').map(x => x.trim()).filter(x => x !== "");
        if (op === 'sort') result = arr.sort((a,b) => a.localeCompare(b, undefined, {numeric:true})).join(',');
        else if (op === 'max') {
            let nums = arr.map(Number);
            result = Math.max(...nums).toString();
        }
    }
    
    return result || "NULL";
}

// UI HELPERS
function highlightPanel(id) {
    clearHighlights();
    document.getElementById(`panel-${id}`).classList.add('active');
}

function clearHighlights() {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
}

function setStatus(text) {
    document.getElementById('status-text').innerText = text;
}

function showOutput(val) {
    const placeholder = document.getElementById('output-placeholder');
    const valueEl = document.getElementById('output-value');
    
    placeholder.style.display = 'none';
    valueEl.style.display = 'block';
    valueEl.innerText = val;
    valueEl.classList.remove('result-value');
    void valueEl.offsetWidth; // Trigger reflow
    valueEl.classList.add('result-value');
}

// STORAGE LOGIC
function saveToHistory(result) {
    const history = JSON.parse(localStorage.getItem('ipos_history') || '[]');
    const item = {
        type: document.getElementById('input-type').value,
        op: document.getElementById('op-select').value,
        output: result,
        time: new Date().toLocaleTimeString()
    };
    
    history.unshift(item);
    if(history.length > 5) history.pop();
    
    localStorage.setItem('ipos_history', JSON.stringify(history));
    renderHistory(history);
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('ipos_history') || '[]');
    renderHistory(history);
}

function renderHistory(history) {
    const list = document.getElementById('storage-history');
    list.innerHTML = "";
    
    if(history.length === 0) {
        list.innerHTML = "<p style='font-size:0.8rem; color:var(--text-muted); text-align:center;'>No history saved yet.</p>";
        return;
    }
    
    history.forEach(item => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <div class="h-meta">
                <span>${item.type.toUpperCase()} | ${item.op.toUpperCase()}</span>
                <span>${item.time}</span>
            </div>
            <div style="color:var(--storage-color); font-weight:600;">Res: ${item.output}</div>
        `;
        list.appendChild(el);
    });
}

function clearStorage() {
    localStorage.removeItem('ipos_history');
    renderHistory([]);
}

// ANIMATION: PARTICLE FLOW
function createParticle(fromId, toId) {
    const fromEl = document.getElementById(`panel-${fromId}`);
    const toEl = document.getElementById(`panel-${toId}`);
    
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = (fromRect.left + fromRect.width / 2 + window.scrollX) + 'px';
    particle.style.top = (fromRect.top + fromRect.height / 2 + window.scrollY) + 'px';
    
    // Set color based on journey
    const colorMap = {
        'input': '#3b82f6',
        'process': '#a855f7',
        'output': '#10b981'
    };
    const color = colorMap[fromId] || 'white';
    particle.style.background = color;
    particle.style.boxShadow = `0 0 15px ${color}`;
    
    document.body.appendChild(particle);
    
    const animate = particle.animate([
        { left: (fromRect.left + fromRect.width/2 + window.scrollX) + 'px', top: (fromRect.top + fromRect.height/2 + window.scrollY) + 'px', opacity: 1, scale: 1 },
        { left: (toRect.left + toRect.width/2 + window.scrollX) + 'px', top: (toRect.top + toRect.height/2 + window.scrollY) + 'px', opacity: 0.8, scale: 1.5 },
        { left: (toRect.left + toRect.width/2 + window.scrollX) + 'px', top: (toRect.top + toRect.height/2 + window.scrollY) + 'px', opacity: 0, scale: 0.2 }
    ], {
        duration: 1000,
        easing: 'ease-in-out'
    });
    
    animate.onfinish = () => particle.remove();
}

// CHALLENGE LOGIC (Practice Mode)
function updateChallenge() {
    const ch = currentChallenges[currentChallengeIdx];
    document.getElementById('challenge-desc').innerText = ch.desc;
    document.getElementById('progress').innerText = progress;
}

function checkChallenge(result) {
    if (document.documentElement.className.includes('active-mode-practice')) {
        const ch = currentChallenges[currentChallengeIdx];
        if (result === ch.target) {
            progress++;
            currentChallengeIdx = (currentChallengeIdx + 1) % currentChallenges.length;
            
            // Success Effect
            const desc = document.getElementById('challenge-desc');
            desc.style.background = "rgba(16, 185, 129, 0.2)";
            desc.innerHTML = "<i class='fas fa-check-circle'></i> CORRECT! Next Mission Locked...";
            
            setTimeout(() => {
                desc.style.background = "var(--bg-accent)";
                updateChallenge();
            }, 2000);
        }
    }
}

// UTILS
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
