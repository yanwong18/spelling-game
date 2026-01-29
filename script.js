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

// Shuffle words so they appear in a random order
let wordList = [...rawData].sort(() => Math.random() - 0.5);
let currentIdx = 0;
let buildProgress = [];

function speak(t) {
    const m = new SpeechSynthesisUtterance(t);
    m.lang = 'en-GB'; m.rate = 0.8;
    window.speechSynthesis.speak(m);
}

function playWord() { 
    speak(wordList[currentIdx].word); 
}

function showFeedback(msg, isError = false) {
    const f = document.getElementById('feedback');
    f.innerText = msg;
    f.style.color = isError ? "var(--red)" : "var(--green)";
}

function celebrate() {
    confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#3498db', '#2ecc71', '#ff4757', '#9b59b6', '#f1c40f']
    });
    const m = document.getElementById('monster');
    m.innerText = "🤩"; m.classList.add('dance');
    setTimeout(() => { m.innerText = "👾"; m.classList.remove('dance'); }, 2000);
}

function loadWord() {
    const item = wordList[currentIdx];
    document.getElementById('counter').innerText = currentIdx + 1;
    document.getElementById('pic-display').innerText = item.pic;
    
    // Part 1: Show word label
    document.getElementById('word-hint').innerText = item.word;
    document.getElementById('word-hint').style.visibility = "visible";
    showFeedback("");

    const p1 = document.getElementById('p1-tiles');
    p1.innerHTML = '';
    item.phonemes.forEach(p => {
        const d = document.createElement('div');
        d.className = 'tile'; d.innerText = p;
        d.onclick = () => speak(p);
        p1.appendChild(d);
    });
    resetStep2();
}

function toStep(n) {
    // Part 2 & 3: Hide word label to encourage memory
    const hint = document.getElementById('word-hint');
    if (n > 1) {
        hint.style.visibility = "hidden";
    } else {
        hint.style.visibility = "visible";
    }

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('part' + n).classList.add('active');
    if(n === 3) document.getElementById('typing-box').focus();
}

function resetStep2() {
    buildProgress = [];
    document.getElementById('drop-zone').innerHTML = '';
    const bank = document.getElementById('p2-bank');
    bank.innerHTML = '';
    
    let scrambled = [...wordList[currentIdx].phonemes].sort(() => Math.random() - 0.5);
    scrambled.forEach(p => {
        const d = document.createElement('div');
        d.className = 'tile'; d.innerText = p;
        d.onclick = () => {
            speak(p); buildProgress.push(p); d.style.visibility = 'hidden';
            const t = document.createElement('div'); t.className = 'tile'; t.innerText = p;
            document.getElementById('drop-zone').appendChild(t);

            if(buildProgress.length === wordList[currentIdx].phonemes.length) {
                if(buildProgress.join('') === wordList[currentIdx].phonemes.join('')) {
                    celebrate(); 
                    speak("Well done Scarlett! Now let's type it.");
                    setTimeout(() => toStep(3), 1200);
                } else {
                    speak("Not quite! Let's try again.");
                    const m = document.getElementById('monster');
                    m.classList.add('shake');
                    setTimeout(() => { m.classList.remove('shake'); resetStep2(); }, 500);
                }
            }
        };
        bank.appendChild(d);
    });
}

function checkTyping() {
    const val = document.getElementById('typing-box').value.toLowerCase().trim();
    const correct = wordList[currentIdx].word;

    if (val === correct) {
        celebrate();
        speak("Brilliant Scarlett! You got it!");
        currentIdx++;
        setTimeout(() => {
            if (currentIdx < wordList.length) {
                document.getElementById('typing-box').value = '';
                loadWord(); toStep(1);
            } else {
                document.getElementById('game-card').innerHTML = 
                    `<h1 class='main-title'>YOU WON!</h1>
                     <div style='font-size:100px;'>🏆</div>
                     <p style='font-size:24px;'>Scarlett, you are a Phonics Superstar!</p>
                     <button class='btn btn-next' onclick='location.reload()'>Play Again</button>`;
                speak("Congratulations Scarlett! You finished the game!");
            }
        }, 2000);
    } else {
        const m = document.getElementById('monster');
        m.classList.add('shake');
        setTimeout(() => m.classList.remove('shake'), 500);
        
        if (val.length === 0) {
            showFeedback("Type the word, Scarlett!", true);
        } else if (correct.startsWith(val)) {
            showFeedback("Great start! What's next?", false);
            speak("Good start! Keep going.");
        } else {
            // Find the mistake to give a hint
            let hintChar = "";
            for(let i=0; i<correct.length; i++) {
                if(val[i] !== correct[i]) {
                    hintChar = (correct[i] === " ") ? "a space" : correct[i];
                    break;
                }
            }
            showFeedback(`Hint: Look for the letter '${hintChar}'`, true);
            speak(`Try again Scarlett! Look for the sound ${hintChar}`);
        }
    }
}

// Initial Greeting
window.onload = () => {
    loadWord();
    setTimeout(() => {
        speak("Welcome to your game, Scarlett! Let's help the monster get dressed.");
    }, 500);
};