/**
 * Setup
 */
const debugEl = document.getElementById('debug');
// Mapping of indexes to icons: start from banana in the middle of the initial position and then upwards
const iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];
// Width of the icons
const icon_width = 79;
// Height of one icon in the strip
const icon_height = 79;
// Number of icons in the strip
const num_icons = 9;
// Max-speed in ms for animating one icon down
const time_per_icon = 80;
// Holds icon indexes
const indexes = [0, 0, 0];

/** 
 * Roll one reel
 */
const roll = (reel, offset = 0) => {
  // Minimum of 2 + the reel offset rounds
  const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  // Return promise so we can wait for all reels to finish
  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel);
    // Current background position
    const backgroundPositionY = parseFloat(style["background-position-y"]);
    // Target background position
    const targetBackgroundPositionY = backgroundPositionY + delta * icon_height;
    // Normalized background position, for reset
    const normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    // Delay animation with timeout, for some reason a delay in the animation property causes stutter
    setTimeout(() => {
      // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
      reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      // Set background position
      reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
    }, offset * 150);

    // After animation
    setTimeout(() => {
      // Reset position, so that it doesn't get higher without limit
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      // Resolve this promise
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

const socket = io('https://spinz-wheel-server-fad3c875d012.herokuapp.com/');

// Listen for the server's outcome event
socket.on('spinOutcome', async (outcome) => {
  debugEl.textContent = 'rolling...';

  const reelsList = document.querySelectorAll('.slots > .reel');

  try {
    // Ensure the balance is loaded from the HTML
    const dynamicBalanceElement = document.getElementById('dynamic-balance');
    let balance = parseInt(dynamicBalanceElement.textContent);

    if (isNaN(balance) || balance < 10) {
      alert("Something went wrong, refresh the page!");
    } else {
      // Subtract the bet amount
      balance -= 5;
      dynamicBalanceElement.textContent = balance;

      const deltas = await Promise.all([...reelsList].map((reel, i) => roll(reel, i)));

      // Add up indexes
      deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
      debugEl.textContent = indexes.map(i => iconMap[i]).join(' - ');

      // Win conditions
      if (indexes[0] == indexes[1] || indexes[1] == indexes[2]) {
        const winCls = indexes[0] == indexes[2] ? "win2" : "win1";
        document.querySelector(".slots").classList.add(winCls);
        setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 2000);
      }

      // Again!
      setTimeout(rollAll, 2000);
    }
  } catch (error) {
    console.error('Error rolling reels:', error);
  }
});

// Kickoff
setTimeout(rollAll, 1000);
