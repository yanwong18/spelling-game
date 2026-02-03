const rawData = [
    { w: "a skirt", p: ["a", "s", "k", "ir", "t"], img: "👗" },
    { w: "purple", p: ["p", "ur", "p", "l", "e"], img: "💜" },
    { w: "a dress", p: ["a", "d", "r", "e", "ss"], img: "💃" },
    { w: "shorts", p: ["sh", "or", "t", "s"], img: "🩳" },
    { w: "jeans", p: ["j", "ea", "n", "s"], img: "👖" },
    { w: "a shirt", p: ["a", "sh", "ir", "t"], img: "👔" },
    { w: "blue", p: ["b", "l", "ue"], img: "💙" },
    { w: "a cap", p: ["a", "c", "a", "p"], img: "🧢" },
    { w: "yellow", p: ["y", "e", "ll", "ow"], img: "💛" },
    { w: "trousers", p: ["t", "r", "ou", "s", "er", "s"], img: "👖" },
    { w: "shoes", p: ["sh", "oe", "s"], img: "👟" },
    { w: "green", p: ["g", "r", "ee", "n"], img: "💚" }
];

/** 
 * NATURAL PHONICS MAPPING
 * Digraphs like 'ss' and 'll' are mapped to a single natural sound.
 */
const phonics = {
    "a": "ah", "b": "b", "c": "k", "d": "d", "e": "eh", "f": "f", "g": "g", "h": "h", "i": "i",
    "j": "j", "k": "k", "l": "l", "m": "m", "n": "n", "o": "o", "p": "p", "r": "r",
    "s": "s", "t": "t", "u": "uh", "v": "v", "w": "w", "x": "ks", "y": "y", "z": "z",
    "sh": "sh", "ss": "s", "ll": "l", "ee": "ee", "ea": "ee", "ir": "er", "ur": "er", "ow": "oh",
    "or": "or", "ou": "ow", "ue": "oo", "oe": "oh", "nn": "n"
};

let words = [...rawData].sort(() => Math.random() - 0.5);
let currentIdx = 0;
let buildResult = [];
let typingResult = [];
let userTiles = [];
let isTypingMode = false;
let ukVoice = null;

// Ensure voices are loaded and find a natural UK voice
function setVoice() {
    let voices = window.speechSynthesis.getVoices();
    ukVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')) || 
              voices.find(v => v.lang === 'en-GB') || 
              voices[0];
}
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = setVoice;
}

function speak(txt, isPhoneme = false) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance();
    
    // Natural Phonetic Logic: If it's a phoneme tile, use the natural mapping
    msg.text = (isPhoneme && phonics[txt.toLowerCase()]) ? phonics[txt.toLowerCase()] : txt;
    
    msg.voice = ukVoice;
    msg.lang = 'en-GB';
    msg.rate = 0.8; // Slightly slower for clarity
    msg.pitch = 1.1; // Friendly princess pitch
    window.speechSynthesis.speak(msg);
}

function startGame() {
    setVoice();
    showSection('play-area');
    loadWord();
    speak("Hi Scarlett! Let's help the Princess find her clothes!");
}

function loadWord() {
    const item = words[currentIdx];
    document.getElementById('count-num').innerText = currentIdx + 1;
    document.getElementById('pic-display').innerText = item.img;
    
    if (!isTypingMode) {
        document.getElementById('phase-name').innerText = "Part 1: Learn";
        document.getElementById('word-label').innerText = item.w;
        document.getElementById('word-label').style.visibility = "visible";
        showSubSection('step1-ui');
        
        const container = document.getElementById('p1-tiles');
        container.innerHTML = '';
        item.p.forEach(p => {
            const wrap = document.createElement('div'); wrap.className = 'tile-wrapper';
            const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
            t.onclick = () => speak(p, true);
            const dot = document.createElement('div'); dot.className = p.length > 1 ? 'sound-dash' : 'sound-dot';
            wrap.appendChild(t); wrap.appendChild(dot);
            container.appendChild(wrap);
        });
    } else {
        document.getElementById('phase-name').innerText = "Step 3: Typing Challenge";
        document.getElementById('word-label').style.visibility = "hidden";
        showSubSection('step3-ui');
    }
}

function toStep2() {
    document.getElementById('word-label').style.visibility = "hidden";
    showSubSection('step2-ui');
    resetBuild();
}

function resetBuild() {
    userTiles = [];
    document.getElementById('drop-zone').innerHTML = '';
    const bank = document.getElementById('p2-bank');
    bank.innerHTML = '';
    let scrambled = [...words[currentIdx].p].sort(() => Math.random() - 0.5);
    scrambled.forEach(p => {
        const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
        t.onclick = () => {
            speak(p, true);
            userTiles.push(p);
            t.style.visibility = 'hidden';
            const d = document.createElement('div'); d.className = 'tile'; d.innerText = p;
            document.getElementById('drop-zone').appendChild(d);
            if (userTiles.length === words[currentIdx].p.length) checkBuild();
        };
        bank.appendChild(t);
    });
}

function checkBuild() {
    const correct = words[currentIdx].p.join('');
    const user = userTiles.join('');
    if (user === correct) {
        confetti();
        if (!buildResult[currentIdx]) buildResult[currentIdx] = { w: words[currentIdx].w, s: "✅" };
        currentIdx++;
        setTimeout(() => {
            if (currentIdx < words.length) loadWord();
            else showReport(1);
        }, 1200);
    } else {
        speak("Try again Scarlett!");
        if (!buildResult[currentIdx]) buildResult[currentIdx] = { w: words[currentIdx].w, s: "❌", u: user };
        document.getElementById('princess-char').classList.add('shake');
        setTimeout(() => {
            document.getElementById('princess-char').classList.remove('shake');
            resetBuild();
        }, 600);
    }
}

function checkTyping() {
    const val = document.getElementById('typing-box').value.toLowerCase().trim();
    const correct = words[currentIdx].w;
    if (val === correct) {
        confetti();
        if (!typingResult[currentIdx]) typingResult[currentIdx] = { w: correct, s: "✅" };
        currentIdx++;
        setTimeout(() => {
            document.getElementById('typing-box').value = '';
            if (currentIdx < words.length) loadWord();
            else showReport(2);
        }, 1200);
    } else {
        if (!typingResult[currentIdx]) typingResult[currentIdx] = { w: correct, s: "❌", u: val || "___" };
        document.getElementById('princess-char').classList.add('shake');
        speak("Listen for the sound " + correct[val.length]);
        setTimeout(() => document.getElementById('princess-char').classList.remove('shake'), 600);
    }
}

function speakWord() { speak(words[currentIdx].w); }

function showReport(phase) {
    showSection('report-screen');
    const list = document.getElementById('report-list');
    list.innerHTML = '';
    const history = (phase === 1) ? buildResult : typingResult;
    document.getElementById('res-title').innerText = (phase === 1) ? "Building Phase Report" : "Final Typing Report";

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<span>${item.s} ${item.w}</span> ${item.s === '❌' ? `<span class="mistake-txt">Scarlett wrote: ${item.u}</span>` : ''}`;
        list.appendChild(div);
    });

    if (phase === 2) {
        document.getElementById('phase-btn').innerText = "Play All Again! ✨";
        document.getElementById('phase-btn').onclick = () => location.reload();
    }
}

function startTypingPhase() {
    isTypingMode = true;
    currentIdx = 0;
    showSection('play-area');
    loadWord();
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showSubSection(id) {
    ['step1-ui', 'step2-ui', 'step3-ui'].forEach(s => {
        document.getElementById(s).classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}