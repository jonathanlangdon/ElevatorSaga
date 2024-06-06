// challenge 3m: fix timeout of inital run of finding request

let directionState = 'none';

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

({
  init: function (elevators, floors) {
    const elevator = elevators[0];

    // initial looking for button request
    floors.forEach(floor => {
      floor.on('up_button_pressed', function () {
        console.log('floor up button pushed!');
        if (directionState === 'none') {
          goToClosestRequest(elevator, floors);
        }
      });
      floor.on('down_button_pressed', function () {
        console.log('floor down button pushed!');
        if (directionState === 'none') {
          goToClosestRequest(elevator, floors);
        }
      });
    });

    // ----- IDLE ELEVATOR ------ //

    // Elevator completed all tasks and not doing anything
    elevator.on('idle', function () {
      console.log('Trigger: Elevator Idle');
      goToClosestRequest(elevator, floors);
    });

    // ----- PASSENGER PRESSED BUTTON ------ //

    // A passenger pressed a button inside elevator
    elevator.on('floor_button_pressed', function (floorNum) {
      this.goToFloor(floorNum);
      console.log(`Inside button pushed! New queue: ${this.destinationQueue}`);
      //re-order queue according to direction of movement
      if (directionState === 'up') {
        elevator.destinationQueue.sort((a, b) => a - b);
      } else if (directionState === 'down') {
        elevator.destinationQueue.sort((a, b) => b - a);
      }
      elevator.checkDestinationQueue();
      console.log(`Queue reordered: ${elevator.destinationQueue}`);
    });

    // ----- PASSING A FLOOR ------ //

    // Triggered slightly before the elevator will pass a floor.
    // Direction is either "up" or "down".
    elevator.on('passing_floor', function (floorNum, direction) {
      const curButtons = floors[floorNum].buttonStates;
      const hasCapacity = this.loadFactor() < this.maxPassengerCount() * 0.11;
      if (curButtons[direction] === 'activated' && hasCapacity) {
        console.log('on-the-way stop and has capacity');
        this.goToFloor(floorNum, true);
      }
    });

    // ----- STOPPED AT FLOOR ------ //

    // Triggered when the elevator has arrived at a floor.
    elevator.on('stopped_at_floor', function (floorNum) {
      console.log(
        `Stopped at floor ${floorNum}! Destinations in queue: ${this.destinationQueue}`
      );

      // Check for requests in current direction
      // first check for request at very top/bottom
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

      // if at very top or very bottom, change direction
      if (floorNum === 0) {
        setNewDirection(elevator, 'up');
      } else if (floorNum === floors.length - 1) {
        setNewDirection(elevator, 'down');
      }
    });
  },
  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
