// challenge 3n: refactor & create functions for all code inside events

let directionState = 'none';

function initialFloorRequestSearch(elevator, floors) {
  floors.forEach(floor => {
    floor.on('up_button_pressed', function () {
      if (directionState === 'none') {
        goToClosestRequest(elevator, floors);
      }
    });
    floor.on('down_button_pressed', function () {
      if (directionState === 'none') {
        goToClosestRequest(elevator, floors);
      }
    });
  });
}

function setDirectionIndicators(elevator) {
  elevator.goingUpIndicator(directionState === 'up');
  elevator.goingDownIndicator(directionState === 'down');
}

function setNewDirection(elevator, newDirection) {
  directionState = newDirection;
  setDirectionIndicators(elevator);
}

function findFloorWithRequest(elev, floors) {
  let closestRequest = 999;
  for (let i = 0; i < floors.length; i++) {
    console.log('Looking for requests');
    const curButtons = floors[i].buttonStates;
    if (curButtons.up === 'activated' || curButtons.down === 'activated') {
      if (
        Math.abs(elev.currentFloor() - i) <
        Math.abs(elev.currentFloor() - closestRequest)
      ) {
        closestRequest = i;
      }
    }
  }
  return closestRequest;
}

function goToClosestRequest(elev, floors) {
  const closestRequest = findFloorWithRequest(elev, floors);
  console.log(`Closest request at ${closestRequest}`);
  if (closestRequest < 999) {
    if (closestRequest > elev.currentFloor()) setNewDirection(elev, 'up');
    else setNewDirection(elev, 'down');
    elev.goToFloor(closestRequest);
  } // else goToClosestRequest(elev, floors);
}

function addToNewQueue(elevator, floorNum) {
  elevator.goToFloor(floorNum);
  if (directionState === 'up') elevator.destinationQueue.sort((a, b) => a - b);
  else if (directionState === 'down')
    elevator.destinationQueue.sort((a, b) => b - a);
  elevator.checkDestinationQueue();
  console.log(`New Queue: ${elevator.destinationQueue}`);
}

function stopIfHasCapacity(floors, floorNum, elevator, direction) {
  const curButtons = floors[floorNum].buttonStates;
  const hasCapacity =
    elevator.loadFactor() < elevator.maxPassengerCount() * 0.11;
  if (curButtons[direction] === 'activated' && hasCapacity) {
    console.log('on-the-way stop and has capacity');
    elevator.goToFloor(floorNum, true);
  }
}

function checkForRequestAtEnds(elevator, floors, floorNum) {
  console.log(
    `Stopped at floor ${floorNum}! Destinations in queue: ${this.destinationQueue}`
  );

  // Check for request at very top/bottom
  const bottomFloorActive = floors[0].buttonStates.up === 'activated';
  const topFloorActive =
    floors[floors.length - 1].buttonStates.down === 'activated';
  if (directionState === 'up' && topFloorActive) {
    console.log('Someone at top floor!');
    elevator.goToFloor(floors.length - 1);
  }
  if (directionState === 'down' && bottomFloorActive) {
    console.log('Someone on bottom floor!');
    elevator.goToFloor(0);
  }
}

function changeDirectionAtEnds(elevator, floors, floorNum) {
  // if at very top or very bottom, change direction
  if (floorNum === 0) {
    setNewDirection(elevator, 'up');
  } else if (floorNum === floors.length - 1) {
    setNewDirection(elevator, 'down');
  }
}

/////////////////////////////////// INIT //////////////////////////
/////////////////////////////////// INIT //////////////////////////
/////////////////////////////////// INIT //////////////////////////

({
  init: function (elevators, floors) {
    // TODO move floors into global variable
    const elevator = elevators[0];

    initialFloorRequestSearch(elevator, floors);

    // ----- IDLE ELEVATOR ------ //
    elevator.on('idle', () => goToClosestRequest(elevator, floors));

    // ----- PASSENGER PRESSED BUTTON INSIDE ELEVATOR ------ //
    elevator.on('floor_button_pressed', floorNum =>
      addToNewQueue(elevator, floorNum)
    );

    // ----- PASSING AN OCCUPIED FLOOR ------ //
    elevator.on('passing_floor', (floorNum, direction) =>
      stopIfHasCapacity(floors, floorNum, elevator, direction)
    );

    // ----- STOPPED AT FLOOR ------ //
    elevator.on('stopped_at_floor', function (floorNum) {
      checkForRequestAtEnds(elevator, floors, floorNum);
      changeDirectionAtEnds(elevator, floors, floorNum);
    });
  },

  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
