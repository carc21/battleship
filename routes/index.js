var express = require("express");
var router = express.Router();
var { Game } = require("../battleship");

var battleship = new Game();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Battleship",
    size: battleship.size
  });
});
router.post("/reset", function(req, res, next) {
  battleship = new Game();
  battleship.printMap();
  res.send("ok");
});

module.exports = io => {
  let sockets = {};

  io.on("connection", socket => {
    // console.log(battleship.getPlayers().map(player => player.getName()));

    // battleship.printMap();

    socket.emit("here is the size", battleship.size);

    socket.on("playername", name => {
      let id = socket.id;
      if (!battleship.hasPlayerWithName(name)) {
        battleship.addPlayer(id);
        battleship.getPlayer(id).setName(name);
        battleship.getPlayer(id).createShips(battleship, 5);
        socket.emit("playernamed", id);
        sockets[id] = socket;
      } else {
        socket.emit("player with same name");
      }
    });

    socket.on("get my player", function(id) {
      if (battleship.getPlayer(id)) {
        socket.emit("here is your player", battleship.getPlayer(id));
        // battleship.printMap();
      }
    });

    socket.on("dropbomb", params => {
      if (battleship.getPlayer(params.id)) {
        let x = parseInt(params.coords.x);
        let y = parseInt(params.coords.y);
        let resp = battleship.dropBomb(params.id, {
          x: x,
          y: y
        });
        socket.emit("hit", resp);
        resp.forEach(bombData => {
          socket.broadcast.emit("shiphit", {
            by: battleship.getPlayer(params.id).getName(),
            data: bombData,
            bombcoords: { x: x, y: y }
          });
        });
      }
    });
  });
  return router;
};
