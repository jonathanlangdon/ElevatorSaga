// Challenge #15: Transport 120 people and let no one wait more than 14.0 seconds

// 5/10

({
  init: function (elevators, floors) {
    elevators.forEach(elevator => {
      initialFloorRequestSearch(elevators, elevator, floors);

      elevator.on('idle', () =>
        goToClosestRequest(elevators, elevator, floors)
      );

      elevator.on('floor_button_pressed', floorNum =>
        useButtonsForQueue(elevator, floorNum)
      );

      elevator.on('passing_floor', (floorNum, direction) =>
        stopIfHasCapacity(elevators, floors, floorNum, elevator, direction)
      );

      elevator.on('stopped_at_floor', function (floorNum) {
        if (elevator.destinationQueue.length === 0)
          if (elevator.goingUpIndicator()) setNewDirection(elevator, 'down');
          else setNewDirection(elevator, 'down');
        checkForRequestAtEnds(elevator, floors, floorNum);
        changeDirectionAtEnds(elevator, floors, floorNum);
      });
    });
  },

  update: function (dt, elevators, floors) {}
});

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

function setNewDirection(elev, direction) {
  elev.goingUpIndicator(direction === 'up');
  elev.goingDownIndicator(direction === 'down');
}

function findFloorWithRequest(elevators, elev, floors) {
  console.log(`Elev@${elev.currentFloor()}: Looking for requests`);
  let closestRequest = 999;
  for (let i = 0; i < floors.length; i++) {
    const goingUp = i > elev.currentFloor();
    if (oneAlreadyStoppingHere(elevators, i, goingUp ? 'up' : 'down')) {
      console.log(`Already one stopping at ${i} not stopping`);
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
  console.log(`closest request at ${closestRequest}`);
  return closestRequest;
}

function goToClosestRequest(elevators, elev, floors) {
  const closestRequest = findFloorWithRequest(elevators, elev, floors);
  const goingUp = closestRequest > elev.currentFloor();
  // console.log(`Closest request to ${elev.currentFloor()} is ${closestRequest}`);
  if (closestRequest < 999) {
    if (goingUp) setNewDirection(elev, 'up');
    else setNewDirection(elev, 'down');
    elev.goToFloor(closestRequest);
    console.log(
      `elev@${elev.currentFloor()} now has queue: ${elev.destinationQueue}`
    );
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
  const hasCapacity = elev.loadFactor() < 0.9;
  if (curButtons[goingUp ? 'up' : 'down'] === 'activated' && hasCapacity) {
    console.log(`Elev@floor ${elev.currentFloor()}: ontheway, has space`);
    elev.goToFloor(floorNum, true);
  }
}

function checkForRequestAtEnds(elev, floors, floorNum) {
  // console.log`Stopped floor ${floorNum}! Destinations in queue: ${elev.destinationQueue}`();

  // Check for request at very top/bottom
  const bottomFloorActive = floors[0].buttonStates.up === 'activated';
  const topFloorActive =
    floors[floors.length - 1].buttonStates.down === 'activated';
  if (elev.destinationDirection() === 'up' && topFloorActive) {
    // console.log(`Elev @ floor ${elev.currentFloor()}: Someone at top!`);
    elev.goToFloor(floors.length - 1);
  }
  if (elev.destinationDirection() === 'down' && bottomFloorActive) {
    // console.log(`Elev @ floor ${elev.currentFloor()}: Someone on 0 floor!`);
    elev.goToFloor(0);
  }
}

function changeDirectionAtEnds(elev, floors, floorNum) {
  if (floorNum === 0) {
    setNewDirection(elev, 'up');
  } else if (floorNum === floors.length - 1) {
    setNewDirection(elev, 'down');
  }
}
