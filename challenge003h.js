// challenge 3h: change direction of indicators at top and bottom

let directionState = 'none';

function setDirectionIndicators(elevator) {
  elevator.goingUpIndicator(directionState === 'up');
  elevator.goingDownIndicator(directionState === 'down');
}

function setNewDirection(elevator, newDirection) {
  directionState = newDirection;
  setDirectionIndicators(elevator);
}

({
  init: function (elevators, floors) {
    const elevator = elevators[0];

    // Elevator completed all tasks and not doing anything
    elevator.on('idle', function () {
      const curFloor = elevator.currentFloor();
      let closestFloorRequest = 999;
      // find a floor with activated button
      for (let i = 0; i < floors.length; i++) {
        const curButtons = floors[i].buttonStates;
        if (curButtons.up === 'activated' || curButtons.down === 'activated') {
          // find closest floor
          if (Math.abs(curFloor - floors[i].floorNum()) < closestFloorRequest) {
            closestFloorRequest = i;
          }
        }
      }
      if (closestFloorRequest < 999) {
        console.log(
          `Idle Elevator... closest request at ${closestFloorRequest}`
        );
        if (closestFloorRequest > curFloor) setNewDirection(elevator, 'up');
        else if (closestFloorRequest < curFloor)
          setNewDirection(elevator, 'down');
        elevator.goToFloor(closestFloorRequest);
      }
    });

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

    // Triggered slightly before the elevator will pass a floor.
    // Direction is either "up" or "down".
    elevator.on('passing_floor', function (floorNum, direction) {
      console.log(`Direction: ${this.destinationDirection()}`);
      const curButtons = floors[floorNum].buttonStates;
      const hasCapacity = this.loadFactor() < 0.85;
      if (curButtons[direction] === 'activated' && hasCapacity) {
        console.log('on-the-way stop and has capacity');
        this.goToFloor(floorNum, true);
      }
    });

    // Triggered when the elevator has arrived at a floor.
    elevator.on('stopped_at_floor', function (floorNum) {
      console.log(
        `Stopped at floor ${floorNum}! Destinations still in queue: ${this.destinationQueue}`
      );
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
