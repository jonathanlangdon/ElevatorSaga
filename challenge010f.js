// Challenge #10: Transport 50 people in 70 seconds or less
// 10f -> tweaking when big elevator goes back to zero
// 3/10

({
  init: function (elevators, floors) {
    // const elevator0 = elevators[0];
    const elevator1 = elevators[1];

    elevator1.on('stopped_at_floor', floorNum => {
      lowCapacityGoBackToZero(elevator1);
    });

    elevators.forEach(elevator => {
      initialFloorRequestSearch(elevators, elevator, floors);

      elevator.on('idle', () =>
        goToClosestRequest(elevators, elevator, floors)
      );

      elevator.on('passing_floor', (floorNum, direction) =>
        stopIfHasCapacity(elevators, floors, floorNum, elevator, direction)
      );

      elevator.on('floor_button_pressed', floorNum =>
        useButtonsForQueue(elevator, floorNum)
      );

      elevator.on('stopped_at_floor', function (floorNum) {
        changeDirectionAtEnds(elevator, floors, floorNum);
      });
    });
  },

  update: function (dt, elevators, floors) {}
});

function lowCapacityGoBackToZero(elev) {
  if (
    elev.loadFactor() < 0.5 &&
    elev.currentFloor() < 6 &&
    elev.currentFloor() !== 0
  ) {
    setNewDirection(elev, 'down');
    elev.goToFloor(0, true);
  }
}

function oneAlreadyStoppingHere(elevators, floorNum, direction) {
  for (const elev of elevators) {
    if (elev.destinationQueue.includes(floorNum)) {
      if (elev.goingUpIndicator() && direction === 'up') {
        return true;
      }
      if (elev.goingDownIndicator() && direction === 'down') {
        return true;
      }
    }
  }
  return false;
}

function setNewDirection(elev, direction) {
  elev.goingUpIndicator(direction === 'up');
  elev.goingDownIndicator(direction === 'down');
}

function findFloorWithRequest(elevators, elev, floors) {
  // console.log(`Elev@${elev.currentFloor()}: Looking for requests`);
  let closestRequest = 999;
  for (let i = 0; i < floors.length; i++) {
    const goingUp = i > elev.currentFloor();
    if (oneAlreadyStoppingHere(elevators, i, goingUp ? 'up' : 'down')) {
      // console.log(`Already one stopping at ${i} not stopping`);
      continue;
    }
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
  // console.log(`closest request at ${closestRequest}`);
  return closestRequest;
}

function initialFloorRequestSearch(elevators, elev, floors) {
  floors.forEach(floor => {
    floor.on('up_button_pressed', function () {
      if (
        elev.destinationDirection() === 'stopped' &&
        elev.destinationQueue.length === 0
      ) {
        goToClosestRequest(elevators, elev, floors);
      }
    });
    floor.on('down_button_pressed', function () {
      if (
        elev.destinationDirection() === 'stopped' &&
        elev.destinationQueue.length === 0
      ) {
        goToClosestRequest(elevators, elev, floors);
      }
    });
  });
}

function goToClosestRequest(elevators, elev, floors) {
  const closestRequest = findFloorWithRequest(elevators, elev, floors);
  const goingUp = closestRequest > elev.currentFloor();
  // console.log(`Closest request to ${elev.currentFloor()} is ${closestRequest}`);
  if (closestRequest < 999) {
    if (goingUp) setNewDirection(elev, 'up');
    else setNewDirection(elev, 'down');
    elev.goToFloor(closestRequest);
    // console.log(`elev@${elev.currentFloor()} queue: ${elev.destinationQueue}`);
  }
}

function useButtonsForQueue(elev, floorNum) {
  const goingUp = floorNum > elev.currentFloor();
  if (goingUp) setNewDirection(elev, 'up');
  else setNewDirection(elev, 'down');
  elev.destinationQueue = elev.getPressedFloors();
  if (goingUp) elev.destinationQueue.sort((a, b) => a - b);
  else elev.destinationQueue.sort((a, b) => b - a);
  elev.checkDestinationQueue();
  if (elev.maxPassengerCount() > 7) {
    lowCapacityGoBackToZero(elev);
  }
  // console.log(`@${elev.currentFloor()}:Queue:${elev.destinationQueue}`);
}

function stopIfHasCapacity(elevators, floors, floorNum, elev, direction) {
  // console.log(
  //   `passing stop? elev@${elev.currentFloor()} checking oneAlreadyStopping: ${floorNum}, ${direction}`
  // );
  if (oneAlreadyStoppingHere(elevators, floorNum, direction)) {
    console.log(`no stop at ${floorNum}${direction}: another doing it`);
    return;
  }
  const curButtons = floors[floorNum].buttonStates;
  const goingUp = elev.destinationQueue[0] > elev.currentFloor();
  const hasCapacity =
    elev.loadFactor() < (elev.maxPassengerCount() > 6 ? 0.3 : 0.8);
  if (curButtons[goingUp ? 'up' : 'down'] === 'activated' && hasCapacity) {
    // console.log(`Elev@floor ${elev.currentFloor()}: ontheway, has space`);
    elev.goToFloor(floorNum, true);
  }
}

function changeDirectionAtEnds(elev, floors, floorNum) {
  if (floorNum === 0) {
    setNewDirection(elev, 'up');
  } else if (floorNum === floors.length - 1) {
    setNewDirection(elev, 'down');
  }
}
