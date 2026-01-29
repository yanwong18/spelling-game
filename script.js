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

// PURE PHONICS MAPPING (Tricking TTS to say pure sounds)
const pureSounds = {
    "a": "ah", "b": "b", "c": "k", "d": "d", "e": "eh", 
    "f": "ffff", "g": "g", "h": "h", "i": "ih", "j": "j", 
    "k": "k", "l": "lll", "m": "mmmm", "n": "nnnn", "o": "off", 
    "p": "p", "qu": "kw", "r": "rrr", "s": "sssss", "t": "t", 
    "u": "uh", "v": "vvvv", "w": "w", "x": "ks", "y": "yuh", "z": "zzzz",
    "sh": "shhhhh", "ch": "ch", "th": "th", "ng": "ng", 
    "ai": "ay", "ee": "eee", "igh": "eye", "oa": "oh", "oo": "ooo",
    "ar": "arr", "or": "orr", "ur": "er", "ow": "ow", "oi": "oy",
    "ear": "eer", "air": "air", "ure": "your", "er": "er",
    "ir": "er", "ss": "sssss", "ll": "lll", "ea": "eee", "ue": "ooo",
    "ou": "ow", "oe": "oh"
};

let wordList = [...rawData].sort(() => Math.random() - 0.5);
let currentIdx = 0;
let userPhonemes = [];

function speak(t, isPhoneme = false, rate = 0.7) {
    return new Promise((resolve) => {
        const m = new SpeechSynthesisUtterance();
        let textToSay = t;
        if (isPhoneme && pureSounds[t.toLowerCase()]) {
            textToSay = pureSounds[t.toLowerCase()];
        }
        m.text = textToSay;
        m.lang = 'en-GB';
        m.rate = rate;
        m.onend = resolve;
        window.speechSynthesis.speak(m);
    });
}

// Blending Engine
async function blendSequence() {
    const item = wordList[currentIdx];
    for (let p of item.phonemes) {
        await speak(p, true, 0.5);
    }
    await speak(item.word, false, 0.8);
}

function loadWord() {
    const item = wordList[currentIdx];
    document.getElementById('pic-display').innerText = item.pic;
    document.getElementById('word-label').innerText = item.word;
    document.getElementById('word-label').style.display = "block";
    document.getElementById('feedback').innerText = "";

    const p1 = document.getElementById('p1-tiles');
    p1.innerHTML = '';
    item.phonemes.forEach(p => {
        const wrapper = document.createElement('div');
        wrapper.className = 'tile-wrapper';
        
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerText = p;
        tile.onclick = () => speak(p, true);
        
        const button = document.createElement('div');
        // If phoneme is 2+ letters, use a "bar", else a "dot"
        button.className = p.length > 1 ? 'sound-bar' : 'sound-button';
        
        wrapper.appendChild(tile);
        wrapper.appendChild(button);
        p1.appendChild(wrapper);
    });
    resetStep2();
}

function toStep(n) {
    if (n > 1) document.getElementById('word-label').style.display = "none";
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('part' + n).classList.add('active');
    if(n === 3) document.getElementById('typing-box').focus();
}

function resetStep2() {
    userPhonemes = [];
    document.getElementById('drop-zone').innerHTML = '';
    const bank = document.getElementById('p2-bank');
    bank.innerHTML = '';
    let scrambled = [...wordList[currentIdx].phonemes].sort(() => Math.random() - 0.5);
    scrambled.forEach(p => {
        const d = document.createElement('div');
        d.className = 'tile'; d.innerText = p;
        d.onclick = () => {
            speak(p, true); userPhonemes.push(p); d.style.visibility = 'hidden';
            const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
            document.getElementById('drop-zone').appendChild(t);
            if(userPhonemes.length === wordList[currentIdx].phonemes.length) {
                if(userPhonemes.join('') === wordList[currentIdx].phonemes.join('')) {
                    celebrate(); setTimeout(() => toStep(3), 1000);
                } else {
                    speak("Try again!");
                    document.getElementById('monster').classList.add('shake');
                    setTimeout(() => { document.getElementById('monster').classList.remove('shake'); resetStep2(); }, 500);
                }
            }
        };
        bank.appendChild(d);
    });
}

function celebrate() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    document.getElementById('monster').classList.add('dance');
    setTimeout(() => document.getElementById('monster').classList.remove('dance'), 2000);
}

function checkTyping() {
    const val = document.getElementById('typing-box').value.toLowerCase().trim();
    const correct = wordList[currentIdx].word;
    if (val === correct) {
        celebrate();
        speak("Brilliant Scarlett!");
        currentIdx++;
        setTimeout(() => {
            if (currentIdx < wordList.length) {
                document.getElementById('typing-box').value = '';
                loadWord(); toStep(1);
            } else {
                document.getElementById('game-card').innerHTML = "<h1>🏆 Winner!</h1><p>Scarlett, you finished!</p>";
            }
        }, 2000);
    } else {
        document.getElementById('monster').classList.add('shake');
        let nextChar = correct[val.length] || correct[0];
        speak(`Listen for the sound ${nextChar}`, true);
    }
}

window.onload = () => {
    loadWord();
    setTimeout(() => speak("Hi Scarlett! Let's say the sounds."), 500);
};