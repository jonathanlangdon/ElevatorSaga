// challenge 5c: Don't let 2 elevators stop at same floor

let endsIdleTargeted = [];

function initialFloorRequestSearch(elevator, floors) {
  floors.forEach(floor => {
    floor.on('up_button_pressed', function () {
      if (
        elevator.destinationDirection() === 'stopped' &&
        elevator.destinationQueue.length === 0 &&
        !endsIdleTargeted.includes(floor.floorNum())
      ) {
        goToClosestRequest(elevator, floors);
      }
    });
    floor.on('down_button_pressed', function () {
      if (
        elevator.destinationDirection() === 'stopped' &&
        elevator.destinationQueue.length === 0 &&
        !endsIdleTargeted.includes(floor.floorNum())
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
  // console.log(`Elev at floor ${elev.currentFloor()}: Looking for requests`);
  let closestRequest = 999;
  for (let i = 0; i < floors.length; i++) {
    if (endsIdleTargeted.includes(i)) continue;
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
  const goingUp = closestRequest > elev.currentFloor();
  // console.log(
  //   `Closest request to floor ${elev.currentFloor()} is ${closestRequest}`
  // );
  if (closestRequest < 999) {
    if (goingUp) setNewDirection(elev, 'up');
    else setNewDirection(elev, 'down');
    addToNewQueue(elev, closestRequest);
    endsIdleTargeted.push(closestRequest);
  }
}

function addToNewQueue(elevator, floorNum) {
  elevator.goToFloor(floorNum);
  const goingUp = floorNum > elevator.currentFloor();
  if (goingUp) setNewDirection(elevator, 'up');
  else setNewDirection(elevator, 'down');
  if (goingUp) elevator.destinationQueue.sort((a, b) => a - b);
  else elevator.destinationQueue.sort((a, b) => b - a);
  elevator.checkDestinationQueue();
  // console.log(
  //   `Elevator @ floor ${elevator.currentFloor()}: New Queue: ${
  //     elevator.destinationQueue
  //   }`
  // );
}

function stopIfHasCapacity(floors, floorNum, elevator, direction) {
  if (endsIdleTargeted.includes(floorNum)) {
    console.log(`not stopping at ${floorNum}: someone else stopping here`);
    return;
  }
  const curButtons = floors[floorNum].buttonStates;
  const hasCapacity =
    elevator.loadFactor() < elevator.maxPassengerCount() * 0.11;
  if (curButtons[direction] === 'activated' && hasCapacity) {
    console.log(
      `Elevator @ floor ${elevator.currentFloor()}: on-the-way stop and has capacity`
    );
    elevator.goToFloor(floorNum, true);
    endsIdleTargeted.push(floorNum);
  }
}

function checkForRequestAtEnds(elevator, floors, floorNum) {
  console
    .log
    // `Stopped at floor ${floorNum}! Destinations in queue: ${elevator.destinationQueue}`
    ();

  // Check for request at very top/bottom
  const bottomFloorActive = floors[0].buttonStates.up === 'activated';
  const topFloorActive =
    floors[floors.length - 1].buttonStates.down === 'activated';
  if (elevator.destinationDirection() === 'up' && topFloorActive) {
    console.log(
      `Elevator @ floor ${elevator.currentFloor()}: Someone at top floor!`
    );
    addToNewQueue(elevator, floors.length - 1);
  }
  if (elevator.destinationDirection() === 'down' && bottomFloorActive) {
    console.log(
      `Elevator @ floor ${elevator.currentFloor()}: Someone on bottom floor!`
    );
    addToNewQueue(elevator, 0);
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

function removeFromTargetArray(floorNum) {
  let index = endsIdleTargeted.indexOf(floorNum);
  if (index !== -1) {
    endsIdleTargeted.splice(index, 1);
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
        removeFromTargetArray(floorNum);
        checkForRequestAtEnds(elevator, floors, floorNum);
        changeDirectionAtEnds(elevator, floors, floorNum);
      });
    });
  },

  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
