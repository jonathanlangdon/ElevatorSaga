// challenge 5a: fixed no global variable

function initialFloorRequestSearch(elevator, floors) {
  floors.forEach(floor => {
    floor.on('up_button_pressed', function () {
      if (
        elevator.destinationDirection() === 'stopped' &&
        elevator.destinationQueue.length === 0
      ) {
        goToClosestRequest(elevator, floors);
      }
    });
    floor.on('down_button_pressed', function () {
      if (
        elevator.destinationDirection() === 'stopped' &&
        elevator.destinationQueue.length === 0
      ) {
        goToClosestRequest(elevator, floors);
      }
    });
  });
}

function setNewDirection(elevator, direction) {
  elevator.goingUpIndicator(direction === 'up');
  elevator.goingDownIndicator(direction === 'down');
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
  }
}

function addToNewQueue(elevator, floorNum) {
  elevator.goToFloor(floorNum);
  if (elevator.destinationDirection() === 'up')
    elevator.destinationQueue.sort((a, b) => a - b);
  else if (elevator.destinationDirection() === 'down')
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
    `Stopped at floor ${floorNum}! Destinations in queue: ${elevator.destinationQueue}`
  );

  // Check for request at very top/bottom
  const bottomFloorActive = floors[0].buttonStates.up === 'activated';
  const topFloorActive =
    floors[floors.length - 1].buttonStates.down === 'activated';
  if (elevator.destinationDirection() === 'up' && topFloorActive) {
    console.log('Someone at top floor!');
    elevator.goToFloor(floors.length - 1);
  }
  if (elevator.destinationDirection() === 'down' && bottomFloorActive) {
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

    elevators.forEach(elevator => {
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
    });
  },

  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
