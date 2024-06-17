// Challenge #10: Transport 50 people in 70 seconds or less
// 1st elevator for going down, 2nd elevator for going up
// naw - not so good - better with level 5 solution

({
  init: function (elevators, floors) {
    const elevator0 = elevators[0];
    const elevator1 = elevators[1];

    elevator0.goingUpIndicator(false);
    elevator0.goingDownIndicator(true);
    elevator1.goingUpIndicator(true);
    elevator1.goingDownIndicator(false);

    elevator0.goToFloor(6);

    elevator0.on('idle', () => {
      findHighestActive(elevator0, floors);
    });

    elevator1.on('idle', () => {
      elevator1.goToFloor(0);
    });

    elevators.forEach(elevator => {
      elevator.on('floor_button_pressed', floorNum =>
        useButtonsForQueue(elevator, floorNum)
      );

      elevator.on('passing_floor', (floorNum, direction) =>
        stopIfHasCapacity(floors, floorNum, elevator, direction)
      );

      // elevator.on('stopped_at_floor', function (floorNum) {});
    });
  },

  update: function (dt, elevators, floors) {}
});

function findHighestActive(elev, floors) {
  let highestFloor = 0;
  for (let i = floors.length - 1; i >= 0; i--) {
    console.log(`checking floor ${i}`);
    if (floors[i].buttonStates.down === 'activated') {
      console.log(`found a floor with down button: ${i}`);
      highestFloor = i;
      break;
    }
  }
  console.log(`going to ${highestFloor}`);
  elev.goToFloor(highestFloor);
}

function useButtonsForQueue(elev, floorNum) {
  const goingUp = floorNum > elev.currentFloor();
  elev.destinationQueue = elev.getPressedFloors();
  if (goingUp) elev.destinationQueue.sort((a, b) => a - b);
  else elev.destinationQueue.sort((a, b) => b - a);
  elev.checkDestinationQueue();
  // console.log(`@${elev.currentFloor()}:Queue:${elev.destinationQueue}`);
}

function stopIfHasCapacity(floors, floorNum, elev, movDirection) {
  const curButtons = floors[floorNum].buttonStates;
  const direction = elev.goingUpIndicator() ? 'up' : 'down';
  const hasCapacity = elev.loadFactor() < elev.maxPassengerCount() * 0.15;
  if (
    curButtons[direction] === 'activated' &&
    hasCapacity &&
    movDirection === direction
  ) {
    console.log(`Elev@floor ${elev.currentFloor()}: ontheway, has space`);
    elev.goToFloor(floorNum, true);
  }
}
