/* 
 File: script.js
 GUI Assignment: scrabble
 Christopher Huerta
 12/17/25
this holds all my functions and and jquerey functions to make the scrabble tiles and boards
work properly
 */

//this keeps gamescore
let gameScore = 0;

//holds all unused tiles
let tilesLeft = [];

//goes through each letter in the tile pile
for (let letter in ScrabbleTiles) {
  let info = ScrabbleTiles[letter];

  //add letter value to tiles
  for (let i = 0; i < info["number-remaining"]; i++) {
    tilesLeft.push({
      letter: letter,
      value: info.value
    });
  }
}

// what allows for the random tile selction in the rack
function getRandomTile() {
  let randIndex = Math.floor(Math.random() * tilesLeft.length);
  return tilesLeft.splice(randIndex, 1)[0];
}

//what sets up the tile rack creates the 7 tiles and picks them at random
let rackTiles = [];
for (let i = 0; i < 7; i++) {
  rackTiles.push(getRandomTile());
}

//makes sure the tile your grabbing has the correct image location
function getTileImg(letter) {
  if (letter === "_") {
    return "Scrabble_Tiles/Scrabble_Tile_Blank.jpg";
  }
  return `Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;
}

//creates the image part of the tile and adds it to the rack
let rackArea = document.getElementById("rack-overlay");
rackTiles.forEach(tile => {
  let img = document.createElement("img");
  img.src = getTileImg(tile.letter);
  img.dataset.letter = tile.letter;
  img.dataset.value = tile.value;
  rackArea.appendChild(img);
});

//sets the board overlay and creates the bonus elements
let board = document.getElementById("board-overlay");
board.innerHTML = "";

let bonuses = {
  2: "DW",
  6: "DL",
  8: "DL",
  12: "DW"
};

//creates the board squares to match the image
for (let i = 0; i < 15; i++) {
  let square = document.createElement("div");
  square.classList.add("board-square");
  square.dataset.index = i;
  square.dataset.bonus = bonuses[i] || "NONE";
  board.appendChild(square);
}


$(function () {

  //makes tiles draggable
  $("#rack-overlay img").draggable({
    revert: "invalid",
    containment: "document",
    zIndex: 100
  });

  //makes the board accept the tiles
  $(".board-square").droppable({
    accept: "#rack-overlay img",
    tolerance: "intersect",

    drop: function (e, ui) {
      let tile = ui.draggable;
      let square = $(this);
      let spot = parseInt(square.data("index"));

      //only allows to place tile when there a tile next to it
      if (!isNextToTile(spot)) {
        tile.draggable("option", "revert", true);
        return;
      }

      //if there is an image on the board position wont allow to place another
      if (square.children("img").length > 0) {
        tile.draggable("option", "revert", true);
        return;
      }

      //snaps the tile to the board position
      tile.appendTo(square);
      tile.css({ top: 0, left: 0, position: "absolute" });
      tile.draggable("option", "revert", false);

      //updates score
      updatePoints();
    }
  });
  //this allows the tiles to dragged back from the playing board
  $("#rack-overlay").droppable({
    accept: ".board-square img",
    tolerance: "intersect",

    drop: function (e, ui) {
      let tile = ui.draggable;
      tile.appendTo("#rack-overlay");
      tile.css({ position: "relative", top: 0, left: 0 });
      updatePoints();
    }
  });

});

//updates the points of the current word
function updatePoints() {
  let score = 0;
  let wordMult = 1;
  let word = "";

  //loops through all board squares
  document.querySelectorAll(".board-square").forEach(sq => {
    let tile = sq.querySelector("img");
    if (!tile) return;

    let val = parseInt(tile.dataset.value);
    let bonus = sq.dataset.bonus;

    word += tile.dataset.letter;

    //applies the board bonuses 
    if (bonus === "DL") val *= 2;
    if (bonus === "DW") wordMult *= 2;

    score += val;
  });

  score *= wordMult;

  //updates the current word and current score
  document.getElementById("current-word").textContent =
    word.length ? word : "—";

  document.getElementById("current-score").textContent = score;

  return score;
}

//moves to the next turn and keeps the current word for the score
function nextWord() {
  let roundScore = updatePoints();
  gameScore += roundScore;
  document.getElementById("total-score").textContent = gameScore;
  //clears the board tile
  document.querySelectorAll(".board-square img").forEach(t => t.remove());

  //refills the rack and resets the current score
  fillRack();
  updatePoints();
}

//refiles the rack back to 7 tiles
function fillRack() {
  let rack = document.getElementById("rack-overlay");
  let count = rack.querySelectorAll("img").length;

  for (let i = count; i < 7; i++) {
    if (tilesLeft.length === 0) return;

    let tile = getRandomTile();
    let img = document.createElement("img");
    img.src = getTileImg(tile.letter);
    img.dataset.letter = tile.letter;
    img.dataset.value = tile.value;
    rack.appendChild(img);
  }

  //renables tiles for dragging new tiles
  $("#rack-overlay img").draggable({
    revert: "invalid",
    containment: "document",
    zIndex: 100
  });
}

document.getElementById("next-word-btn").addEventListener("click", nextWord);

//only checks for next tile after first placement
function isNextToTile(newSpot) {
  let used = [];

  document.querySelectorAll(".board-square").forEach(sq => {
    if (sq.querySelector("img")) {
      used.push(parseInt(sq.dataset.index));
    }
  });

  //allows the first tile to go anywhere
  if (used.length === 0) return true;
  //makes sure the next tile is next to an existing tile
  return used.some(i => Math.abs(i - newSpot) === 1);
}

//restarts the game
function restartGame() {
  gameScore = 0;
  document.getElementById("total-score").textContent = 0;

  document.querySelectorAll(".board-square img").forEach(t => t.remove());
  document.getElementById("rack-overlay").innerHTML = "";
  //rebuilds the tile pile
  tilesLeft = [];
  for (let l in ScrabbleTiles) {
    let info = ScrabbleTiles[l];
    for (let i = 0; i < info["original-distribution"]; i++) {
      tilesLeft.push({ letter: l, value: info.value });
    }
  }
  //creates a new rack
  for (let i = 0; i < 7; i++) {
    let t = getRandomTile();
    let img = document.createElement("img");
    img.src = getTileImg(t.letter);
    img.dataset.letter = t.letter;
    img.dataset.value = t.value;
    document.getElementById("rack-overlay").appendChild(img);
  }

  $("#rack-overlay img").draggable({
    revert: "invalid",
    containment: "document",
    zIndex: 100
  });

  updatePoints();
}

document.getElementById("restart-btn").addEventListener("click", restartGame);
