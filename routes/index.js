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

let sockets = {};

module.exports = io => {
  io.on("connection", socket => {
    // console.log(battleship.getPlayers().map(player => player.getName()));

    // battleship.printMap();

    socket.on("playername", name => {
      let id = socket.id;
      if (!battleship.hasPlayerWithName(name)) {
        battleship.addPlayer(id, name);
        battleship.getPlayer(id).setName(name);
        battleship.getPlayer(id).createShips(battleship, 5);
        socket.emit("playerNamed", id);
        sockets[id] = socket;
      } else {
        socket.emit("player with same name");
      }
    });

    socket.on("get my player", function(id) {
      // console.log(battleship.players);
      if (battleship.getPlayer(id)) {
        socket.emit("here is your player", battleship.getPlayer(id));
        battleship.printMap();
      }
    });

    socket.on("dropbomb", params => {
      let resp = battleship.dropBomb(
        params.id,
        parseInt(params.x),
        parseInt(params.y)
      );
      socket.emit("hit", resp);
      socket.broadcast.emit("shiphit", {
        by: battleship.getPlayer(params.id).getName(),
        success: true
      });
    });
  });
  return router;
};
