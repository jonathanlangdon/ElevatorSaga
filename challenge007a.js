// challenge 7: Challenge #7: Transport 100 people using 63 elevator moves or less
// 7a => wait until full, then move to next floor... then wait till full
// challenge 7: Challenge #7: Transport 100 people using 63 elevator moves or less
// 7a => wait until full, then move to next floor... then wait till full

// 10/10

({
  init: function (elevators, floors) {
    elevators.forEach(elevator => {
      setNewDirection(elevator, 'up');

      elevator.on('idle', () => {});

      elevator.on('floor_button_pressed', floorNum => {});

      elevator.on('passing_floor', (floorNum, direction) => {});

      elevator.on('stopped_at_floor', floorNum => {
        moveIfAtCapacity(elevator, floorNum);
        changeDirectionAtEnds(elevator, floors, floorNum);
      });
    });
  },

  update: function (dt, elevators, floors) {}
});

function moveIfAtCapacity(elev, floorNum) {
  const atCapacity = elev.loadFactor() > 0.17;
  if (atCapacity) {
    if (elev.goingUpIndicator()) elev.goToFloor(floorNum + 1);
    else elev.goToFloor(floorNum - 1);
  }
}

function setNewDirection(elev, direction) {
  elev.goingUpIndicator(direction === 'up');
  elev.goingDownIndicator(direction === 'down');
}

function changeDirectionAtEnds(elev, floors, floorNum) {
  if (floorNum === 0) {
    setNewDirection(elev, 'up');
  } else if (floorNum === floors.length - 1) {
    setNewDirection(elev, 'down');
  }
}
