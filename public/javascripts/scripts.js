var socket = io();

var mapSize = 0;
var ships = [];

// elements
let gameBoard = document.querySelector(".ships");
let button = document.getElementById("dropBomb");
let resetButton = document.getElementById("reset");
let nameButton = document.getElementById("nameButton");
let nameTxt = document.getElementById("name");

// events
socket.on("hit", hit => {
  if (!hit.gotHit) {
    alert(`Shot failed`);
  } else {
    gameBoard.innerHTML += `<span style="position:absolute;left:${hit.x *
      20}px;top:${hit.y * 20}px">💥</span>`;
    alert(`${hit.shipName} was hit!`);
  }
});

socket.on("playerNamed", id => {
  localStorage.setItem("socket.id", id);
});

socket.on("here is your player", player => {
  player.ships.forEach(ship => {
    gameBoard.innerHTML += `<span class="ship" style="top:${ship.coords.x *
      20}px;left:${ship.coords.y * 20}px;width:${ship.size.w *
      20}px;height:${ship.size.h * 20}px;"><h5>${ship.name}</h5></span>`;
  });
});

nameButton.addEventListener("click", () => {
  socket.emit("playername", nameTxt.value);
  localStorage.setItem("socket.id", nameTxt.value);
});

button.addEventListener("click", () => {
  let x = document.getElementById("x").value | 0;
  let y = document.getElementById("y").value | 0;
  if (localStorage.getItem("socket.id")) {
    socket.emit("dropbomb", {
      id: localStorage.getItem("socket.id"),
      coords: { x: x, y: y }
    });
  } else {
    console.log(`You need to enter a name first.`);
  }
});

if (localStorage.getItem("socket.id")) {
  nameTxt.value = localStorage.getItem("socket.id");
  socket.emit("playername", nameTxt.value);
  socket.emit("get my player", id);
}

resetButton.addEventListener("click", () => {
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
