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

const phonicsMap = {
    "a": "ah", "b": "b", "c": "k", "d": "d", "e": "eh", "f": "ffff", "g": "g", "h": "h", "i": "ih",
    "j": "j", "k": "k", "l": "lll", "m": "mmmm", "n": "nnnn", "o": "off", "p": "p", "r": "rrr",
    "s": "sssss", "t": "t", "u": "uh", "v": "vvvv", "w": "w", "x": "ks", "y": "yuh", "z": "zzzz",
    "sh": "shhhhh", "ch": "ch", "th": "th", "ee": "eee", "ir": "er", "ur": "er", "ow": "oh",
    "ll": "lll", "ss": "sssss", "ea": "eee", "or": "orr", "ou": "ow", "ue": "ooo", "oe": "oh"
};

let wordList = [...rawData].sort(() => Math.random() - 0.5);
let currentIdx = 0;
let userPhonemes = [];
let scoreHistory = []; // Tracks Scarlett's answers

function speak(text, isPhoneme = false, rate = 0.7) {
    return new Promise((resolve) => {
        const msg = new SpeechSynthesisUtterance();
        msg.text = (isPhoneme && phonicsMap[text.toLowerCase()]) ? phonicsMap[text.toLowerCase()] : text;
        msg.lang = 'en-GB';
        msg.rate = rate;
        msg.onend = resolve;
        window.speechSynthesis.speak(msg);
    });
}

async function blendWord() {
    const item = wordList[currentIdx];
    for (let p of item.phonemes) { await speak(p, true, 0.5); }
    await speak(item.word, false, 0.8);
}

function playWholeWord() { speak(wordList[currentIdx].word); }

function celebrate() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    document.getElementById('princess-char').classList.add('dance');
    setTimeout(() => document.getElementById('princess-char').classList.remove('dance'), 2000);
}

function loadWord() {
    const item = wordList[currentIdx];
    document.getElementById('count-num').innerText = currentIdx + 1;
    document.getElementById('pic-display').innerText = item.pic;
    document.getElementById('word-label').innerText = item.word;
    document.getElementById('word-label').style.visibility = "visible";
    document.getElementById('feedback-msg').innerText = "";

    const p1 = document.getElementById('p1-tiles');
    p1.innerHTML = '';
    item.phonemes.forEach(p => {
        const wrap = document.createElement('div');
        wrap.className = 'tile-wrapper';
        const t = document.createElement('div');
        t.className = 'tile'; t.innerText = p;
        t.onclick = () => speak(p, true);
        const btn = document.createElement('div');
        btn.className = p.length > 1 ? 'sound-dash' : 'sound-dot';
        wrap.appendChild(t); wrap.appendChild(btn);
        p1.appendChild(wrap);
    });
    resetPart2();
}

function goToStep(n) {
    document.getElementById('word-label').style.visibility = (n === 1) ? "visible" : "hidden";
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('part' + n).classList.add('active');
    if(n === 3) document.getElementById('typing-input').focus();
}

function resetPart2() {
    userPhonemes = [];
    document.getElementById('drop-zone').innerHTML = '';
    const bank = document.getElementById('p2-bank');
    bank.innerHTML = '';
    let scrambled = [...wordList[currentIdx].phonemes].sort(() => Math.random() - 0.5);
    scrambled.forEach(p => {
        const t = document.createElement('div');
        t.className = 'tile'; t.innerText = p;
        t.onclick = () => {
            speak(p, true); userPhonemes.push(p); t.style.visibility = 'hidden';
            const drop = document.createElement('div'); drop.className = 'tile'; drop.innerText = p;
            document.getElementById('drop-zone').appendChild(drop);
            if(userPhonemes.length === wordList[currentIdx].phonemes.length) {
                if(userPhonemes.join('') === wordList[currentIdx].phonemes.join('')) {
                    celebrate(); setTimeout(() => goToStep(3), 1000);
                } else {
                    speak("Try again Scarlett!");
                    document.getElementById('princess-char').classList.add('shake');
                    setTimeout(() => { document.getElementById('princess-char').classList.remove('shake'); resetPart2(); }, 500);
                }
            }
        };
        bank.appendChild(t);
    });
}

function checkFinalTyping() {
    const val = document.getElementById('typing-input').value.toLowerCase().trim();
    const correct = wordList[currentIdx].word;

    if (val === correct) {
        // If they got it right, log it as a success
        if (!scoreHistory[currentIdx]) scoreHistory[currentIdx] = { word: correct, user: val, status: '✅' };
        
        celebrate(); speak("Brilliant!");
        currentIdx++;
        setTimeout(() => {
            if (currentIdx < wordList.length) {
                document.getElementById('typing-input').value = '';
                loadWord(); goToStep(1);
            } else {
                showResults();
            }
        }, 1500);
    } else {
        // Log the mistake (only the first mistake is logged for the report)
        if (!scoreHistory[currentIdx]) {
            scoreHistory[currentIdx] = { word: correct, user: val || "(blank)", status: '❌' };
        }
        document.getElementById('princess-char').classList.add('shake');
        setTimeout(() => document.getElementById('princess-char').classList.remove('shake'), 500);
        speak(`Look for the sound ${correct[val.length] || correct[0]}`);
    }
}

function showResults() {
    document.getElementById('game-ui').style.display = 'none';
    const resultPage = document.getElementById('result-page');
    resultPage.classList.add('active');
    
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    
    scoreHistory.forEach(item => {
        const row = document.createElement('div');
        row.className = 'result-row';
        
        let displayUser = item.user;
        // Logic to show exactly where the mistake was
        if(item.status === '❌') {
            let highlighted = "";
            for(let i=0; i < item.word.length; i++) {
                if(item.user[i] !== item.word[i]) {
                    highlighted += `<span class="highlight">${item.user[i] || "_"}</span>`;
                    highlighted += item.user.substring(i+1);
                    break;
                }
                highlighted += item.user[i];
            }
            displayUser = highlighted;
        }

        row.innerHTML = `
            <span>${item.status} <strong>${item.word}</strong></span>
            <span>
                ${item.status === '❌' ? `<span class="wrong-text">${displayUser}</span>` : ''}
                <span class="correct-text">${item.word}</span>
            </span>
        `;
        list.appendChild(row);
    });
    speak("Scarlett, you finished! Look at your royal report.");
}

window.onload = loadWord;