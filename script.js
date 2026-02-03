const rawData = [
    { word: "a skirt", phonemes: ["a", "s", "k", "ir", "t"], pic: "👗" },
    { word: "purple", phonemes: ["p", "ur", "p", "l", "e"], pic: "💜" },
    { word: "a dress", phonemes: ["a", "d", "r", "e", "ss"], pic: "💃" },
    { word: "shorts", phonemes: ["sh", "or", "t", "s"], pic: "🩳" },
    { word: "jeans", phonemes: ["j", "ea", "n", "s"], pic: "👖" },
    { word: "a shirt", phonemes: ["a", "sh", "ir", "t"], pic: "👔" },
    { word: "blue", phonemes: ["b", "l", "ue"], pic: "💙" },
    { word: "a cap", phonemes: ["a", "c", "a", "p"], pic: "🧢" },
    { word: "yellow", phonemes: ["y", "e", "ll", "ow"], pic: "💛" },
    { word: "trousers", phonemes: ["t", "r", "ou", "s", "er", "s"], pic: "👖" },
    { word: "shoes", phonemes: ["sh", "oe", "s"], pic: "👟" },
    { word: "green", phonemes: ["g", "r", "ee", "n"], pic: "💚" }
];

// Mapping pure sounds for ResponsiveVoice
const phonicsMap = {
    "a": "ah", "b": "buh", "c": "k", "d": "duh", "e": "eh", "f": "ffff", "g": "guh", "h": "huh", "i": "ih",
    "j": "juh", "k": "kuh", "l": "lll", "m": "mmmm", "n": "nnnn", "o": "off", "p": "puh", "r": "rrr",
    "s": "sssss", "t": "t", "u": "uh", "v": "vvvv", "w": "wuh", "x": "ks", "y": "yuh", "z": "zzzz",
    "sh": "shhhhh", "ch": "chuh", "th": "thhh", "ee": "eee", "ir": "er", "ur": "er", "ow": "oh",
    "ll": "lll", "ss": "sssss", "ea": "eee", "or": "orr", "ou": "ow", "ue": "ooo", "oe": "oh"
};

let wordList = [...rawData].sort(() => Math.random() - 0.5);
let currentIdx = 0;
let userPhonemes = [];
let gamePhase = 1; // 1: Build, 2: Type
let buildHistory = [];
let typingHistory = [];

function speak(text, isPhoneme = false) {
    let sound = text;
    if (isPhoneme && phonicsMap[text.toLowerCase()]) {
        sound = phonicsMap[text.toLowerCase()];
    }
    // Using ResponsiveVoice UK English Female
    responsiveVoice.speak(sound, "UK English Female", {rate: 0.8, pitch: 1.1});
}

function playWholeWord() { speak(wordList[currentIdx].word); }

async function blendWord() {
    const item = wordList[currentIdx];
    for (let p of item.phonemes) {
        speak(p, true);
        await new Promise(r => setTimeout(r, 800));
    }
    speak(item.word);
}

function celebrate() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    document.getElementById('princess-char').classList.add('dance');
    setTimeout(() => document.getElementById('princess-char').classList.remove('dance'), 2000);
}

function loadWord() {
    const item = wordList[currentIdx];
    document.getElementById('count-num').innerText = currentIdx + 1;
    document.getElementById('pic-display').innerText = item.pic;
    
    if (gamePhase === 1) {
        document.getElementById('step-indicator').innerText = "Part 1: Learn";
        document.getElementById('word-label').innerText = item.word;
        document.getElementById('word-label').style.visibility = "visible";
        showSection('part1');
        
        const p1Tiles = document.getElementById('p1-tiles');
        p1Tiles.innerHTML = '';
        item.phonemes.forEach(p => {
            const wrap = document.createElement('div'); wrap.className = 'tile-wrapper';
            const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
            t.onclick = () => speak(p, true);
            const btn = document.createElement('div'); btn.className = p.length > 1 ? 'sound-dash' : 'sound-dot';
            wrap.appendChild(t); wrap.appendChild(btn);
            p1Tiles.appendChild(wrap);
        });
    } else {
        document.getElementById('step-indicator').innerText = "Step 3: Typing Challenge";
        document.getElementById('word-label').style.visibility = "hidden";
        showSection('part3');
    }
}

function goToPart2() {
    document.getElementById('step-indicator').innerText = "Part 2: Build it!";
    document.getElementById('word-label').style.visibility = "hidden";
    showSection('part2');
    resetPart2();
}

function resetPart2() {
    userPhonemes = [];
    document.getElementById('drop-zone').innerHTML = '';
    const bank = document.getElementById('p2-bank');
    bank.innerHTML = '';
    let scrambled = [...wordList[currentIdx].phonemes].sort(() => Math.random() - 0.5);
    scrambled.forEach(p => {
        const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
        t.onclick = () => {
            speak(p, true); userPhonemes.push(p); t.style.visibility = 'hidden';
            const drop = document.createElement('div'); drop.className = 'tile'; drop.innerText = p;
            document.getElementById('drop-zone').appendChild(drop);
            if (userPhonemes.length === wordList[currentIdx].phonemes.length) {
                checkBuild();
            }
        };
        bank.appendChild(t);
    });
}

function checkBuild() {
    const correct = wordList[currentIdx].phonemes.join('');
    const user = userPhonemes.join('');
    if (user === correct) {
        celebrate();
        buildHistory.push({word: wordList[currentIdx].word, status: '✅'});
        currentIdx++;
        setTimeout(() => {
            if (currentIdx < wordList.length) loadWord();
            else showReport(1);
        }, 1500);
    } else {
        speak("Try again Scarlett!");
        buildHistory.push({word: wordList[currentIdx].word, status: '❌', user: user});
        document.getElementById('princess-char').classList.add('shake');
        setTimeout(() => {
            document.getElementById('princess-char').classList.remove('shake');
            resetPart2();
        }, 500);
    }
}

function checkTyping() {
    const val = document.getElementById('typing-input').value.toLowerCase().trim();
    const correct = wordList[currentIdx].word;
    if (val === correct) {
        celebrate();
        typingHistory.push({word: correct, status: '✅'});
        currentIdx++;
        setTimeout(() => {
            document.getElementById('typing-input').value = '';
            if (currentIdx < wordList.length) loadWord();
            else showReport(2);
        }, 1500);
    } else {
        typingHistory.push({word: correct, status: '❌', user: val || "___"});
        document.getElementById('princess-char').classList.add('shake');
        speak("Listen for the sound " + correct[val.length]);
        setTimeout(() => document.getElementById('princess-char').classList.remove('shake'), 500);
    }
}

function showReport(phase) {
    document.getElementById('play-area').style.display = 'none';
    const resPage = document.getElementById('results-page');
    resPage.classList.add('active');
    const content = document.getElementById('report-content');
    content.innerHTML = "";
    
    const data = (phase === 1) ? buildHistory : typingHistory;
    document.getElementById('res-title').innerText = (phase === 1) ? "Building Phase Report" : "Final Typing Report";

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<span>${item.status} ${item.word}</span> ${item.status === '❌' ? `<span class="mistake-txt">Scarlett wrote: ${item.user}</span>` : ''}`;
        content.appendChild(div);
    });

    if (phase === 2) {
        document.getElementById('phase-btn').innerText = "Play All Again! ✨";
        document.getElementById('phase-btn').onclick = () => location.reload();
    }
}

function startTypingPhase() {
    gamePhase = 2; currentIdx = 0;
    document.getElementById('results-page').classList.remove('active');
    document.getElementById('play-area').style.display = 'block';
    loadWord();
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

window.onload = () => {
    loadWord();
    setTimeout(() => speak("Welcome Scarlett! Let's help the Queen find her clothes!"), 1000);
};