const slotSymbols = [
  ['😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', '😊', '🙂'],
  ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑'],
  ['⭐️', '🌟', '✨', '💫', '⚡️', '☄️', '🌠', '🌌', '🌙', '🌕', '🌖', '🌗']
];

const audio = new Audio('./slot-machine-payout-81725.mp3');
const socket = io('https://spinz-wheel-server-fad3c875d012.herokuapp.com/');
let spun = false;

// Assuming balance is defined somewhere in your code
let balance = 10; // Replace with the actual balance value

function createSymbolElement(symbol) {
  const div = document.createElement('div');
  div.classList.add('symbol');
  div.textContent = symbol;
  return div;
}

function playSlotSound() {
  audio.currentTime = 0;
  audio.play();
}

function spin() {
  if (spun) {
    reset();
  }

  // Assuming balance is defined somewhere in your code
  const storedToken = localStorage.getItem('yourTokenKey');
  if (balance < 1) {
    alert('Insufficient balance');
    return; // Added return to stop further execution
  }

  balance -= 1;
  const dynamicBalanceElement = document.getElementById('dynamic-balance');
  dynamicBalanceElement.textContent = balance;

  playSlotSound();

  const slots = document.querySelectorAll('.slot');
  let completedSlots = 0;

  slots.forEach((slot, index) => {
    const symbols = slot.querySelector('.symbols');
    const symbolHeight = symbols.querySelector('.symbol')?.clientHeight || 0; // Added fallback value
    const symbolCount = symbols.childElementCount;

    symbols.innerHTML = '';

    symbols.appendChild(createSymbolElement('❓'));

    for (let i = 0; i < 3; i++) {
      slotSymbols[index].forEach(symbol => {
        symbols.appendChild(createSymbolElement(symbol));
      });
    }

    const totalDistance = symbolCount * symbolHeight;
    const randomOffset = -Math.floor(Math.random() * (symbolCount - 1) + 1) * symbolHeight;
    symbols.style.top = `${randomOffset}px`;

    symbols.addEventListener('transitionend', () => {
      completedSlots++;
      if (completedSlots === slots.length) {
        logDisplayedSymbols();
      }
    }, { once: true });
  });

  spun = true;
}

function reset() {
  const slots = document.querySelectorAll('.slot');

  slots.forEach(slot => {
    const symbols = slot.querySelector('.symbols');
    symbols.style.transition = 'none';
    symbols.style.top = '0';
    symbols.offsetHeight;
    symbols.style.transition = '';
  });

  spun = false; // Reset the spun flag
}

function logDisplayedSymbols() {
  const slots = document.querySelectorAll('.slot');
  const displayedSymbols = [];

  slots.forEach((slot, index) => {
    const symbols = slot.querySelector('.symbols');
    const symbolIndex = Math.floor(Math.abs(parseInt(symbols.style.top, 10)) / slot.clientHeight) % slotSymbols[index].length;
    const displayedSymbol = slotSymbols[index][symbolIndex];
    displayedSymbols.push(displayedSymbol);
  });

  console.log(displayedSymbols);
}

// Assuming you want to call spin on some user action or event
// spin();
