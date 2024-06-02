const n = 50;
const array = [];
let timeoutId = null;
let isSorting = false;
let sortingSpeed = 30; 

init();

let audioCtx = null;

function playNote(freq) {
    if (audioCtx == null) {
        audioCtx = new (
            AudioContext ||
            webkitAudioContext ||
            window.webkitAudioContext
        )();
    }
    const dur = 0.1;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(
        0, audioCtx.currentTime + dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init() {
    if (isSorting && timeoutId !== null) {
        clearTimeout(timeoutId);
        isSorting = false;
        timeoutId = null;
    }
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function play(selectedAlgorithm) {
    if (isSorting) return;

    const copy = [...array];
    let moves;
    switch (selectedAlgorithm) {
        case 'bubble':
            moves = bubbleSort(copy);
            break;
        case 'insertion':
            moves = insertionSort(copy);
            break;
        case 'heap':
            moves = heapSort(copy);
            break;
        default:
            console.error('Invalid algorithm selected');
            return;
    }
    isSorting = true;
    animate(moves);
}

function animate(moves) {
    if (moves.length == 0) {
        showBars();
        isSorting = false;
        return;
    }
    const move = moves.shift();
    const [i, j] = move.indices;

    if (move.type == "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    }

    playNote(200 + array[i] * 500);
    playNote(200 + array[j] * 500);

    showBars(move);
    timeoutId = setTimeout(function () {
        animate(moves);
    }, 101 - sortingSpeed); // Adjust speed based on slider value
}

function bubbleSort(array) {
    const moves = [];
    do {
        var swapped = false;
        for (let i = 1; i < array.length; i++) {
            if (array[i - 1] > array[i]) {
                swapped = true;
                moves.push({ indices: [i - 1, i], type: "swap" });
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
            }
        }
    } while (swapped);
    return moves;
}

function insertionSort(array) {
    const moves = [];
    for (let i = 1; i < array.length; i++) {
        const key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            moves.push({ indices: [j, j + 1], type: "swap" });
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
    return moves;
}

function heapSort(array) {
    const moves = [];
    const N = array.length;

    function heapify(i, N) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < N && array[left] > array[largest])
            largest = left;

        if (right < N && array[right] > array[largest])
            largest = right;

        if (largest !== i) {
            moves.push({ indices: [i, largest], type: "swap" });
            [array[i], array[largest]] = [array[largest], array[i]];
            heapify(largest, N);
        }
    }

    for (let i = Math.floor(N / 2) - 1; i >= 0; i--)
        heapify(i, N);

    for (let i = N - 1; i > 0; i--) {
        moves.push({ indices: [0, i], type: "swap" });
        [array[0], array[i]] = [array[i], array[0]];
        heapify(0, i);
    }

    return moves;
}

function showBars(move) {
    const container = document.getElementById("container");
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");

        if (move && move.indices.includes(i)) {
            bar.style.backgroundColor =
                move.type == "swap" ? "orange" : "lightblue";
        }
        container.appendChild(bar);
    }
}


document.getElementById('myRange').addEventListener('input', function() {
    sortingSpeed = this.value;
    document.getElementById('demo').innerText = sortingSpeed;
});