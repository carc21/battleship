// elements
let gameBoard = document.querySelector(".ships");
let dropBtn = document.getElementById("dropBomb");
let resetBtn = document.getElementById("reset");
let nameInp = document.getElementById("name");
let nameBtn = document.getElementById("nameButton");
let log = document.getElementById("log");

let socket = io();
let game = {};
let mapSize = 0;
let scale = 20;
let ships = [];
let gameLog = [];
// -------------
// events - Game
// -------------
// event for recieving the board size
socket.on("here is the size", function(size) {
  mapSize = size;
});

// event to get player and ship details
socket.on("here is your player", player => {
  game.log(`Welcome ${player.name}`);

  nameInp.value = player.name;
  nameInp.disabled = true;

  player.ships.forEach(ship => {
    gameBoard.innerHTML += `<span class="ship" id="ship-${
      ship.id
    }" style="left:${(ship.coords.x - 1) * scale}px;top:${(ship.coords.y - 1) *
      scale}px;width:${ship.size.w * scale}px;height:${ship.size.h *
      scale}px;"><h5>${ship.name}</h5></span>`;
  });
  ships = player.ships;
  nameInp.disabled = "disabled";
  game.playernamed = true;
});
game.log = x => {
  gameLog.push(x);
  if (gameLog.length > 5) {
    gameLog = gameLog.slice(gameLog.length - 5);
  }
  log.innerHTML = "<ul>";
  for (let i = gameLog.length - 1; i >= 0; i--) {
    log.innerHTML += `<li>${gameLog[i]}</li>`;
  }
  log.innerHTML += "</ul>";
};

// -------------
// events - Name
// -------------
// set name button action
nameBtn.addEventListener("click", () => {
  if (game.playernamed) {
    return;
  }
  let name = nameInp.value || "";
  socket.emit("playername", name);
});

// get name from localStorage
if (localStorage.getItem("socket.id")) {
  socket.emit("get my player", localStorage.getItem("socket.id"));
}

// event when name is assigned successfully
socket.on("playernamed", id => {
  localStorage.setItem("socket.id", id);
  socket.emit("get my player", id);
});

// event when name is taken
socket.on("player with same name", () => {
  game.log(`Name taken, choose a different one.`);
});

// -------------
// events - Ships
// -------------
// drop bomb action
dropBtn.addEventListener("click", () => {
  let x = document.getElementById("x").value | 0;
  let y = document.getElementById("y").value | 0;
  if (localStorage.getItem("socket.id") && game.playernamed) {
    socket.emit("dropbomb", {
      id: localStorage.getItem("socket.id"),
      coords: { x: x, y: y }
    });
  } else {
    game.log(`You need to enter a name first.`);
  }
});

// event if a ship got hit by you
socket.on("hit", hit => {
  console.log(hit);

  if (hit.length < 1) {
    game.log(`Shot failed`);
  } else {
    game.log(`Successful shot`);
  }
});

// when a ship got hit
socket.on("shiphit", hit => {
  // find my ship if it got hit
  let ship = ships.find(myShip => myShip.id === hit.data.id);
  if (ship) {
    // log result
    game.log(`${ship.name} was hit by ${hit.by}`);
    // print an empji
    gameBoard.innerHTML += `<span style="position:absolute;left:${(hit
      .bombcoords.x -
      1) *
      scale}px;top:${(hit.bombcoords.y - 1) * scale}px">💥</span>`;
    // check if there is no health remaining
    if (hit.data.hp.every(val => val === "0")) {
      game.log(`${ship.name} was defeated`);
      document.getElementById("ship-" + hit.data.id).style.backgroundColor =
        "black";
    }
  }
});

resetBtn.addEventListener("click", () => {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", `/reset`);
  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      window.location.reload(false);
    }
  };
  xhr.send();
});
