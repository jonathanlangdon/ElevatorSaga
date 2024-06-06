// challenge 3j: load factor fixed for # people

let directionState = 'none';

function setDirectionIndicators(elevator) {
  elevator.goingUpIndicator(directionState === 'up');
  elevator.goingDownIndicator(directionState === 'down');
}

function setNewDirection(elevator, newDirection) {
  directionState = newDirection;
  setDirectionIndicators(elevator);
}

function goToClosestRequest() {}

({
  init: function (elevators, floors) {
    const elevator = elevators[0];

    // ----- IDLE ELEVATOR ------ //

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
        else setNewDirection(elevator, 'down');
        elevator.goToFloor(closestFloorRequest);
      }
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
      console.log(`Direction: ${this.destinationDirection()}`);
      const curButtons = floors[floorNum].buttonStates;
      const hasCapacity = this.loadFactor() < this.maxPassengerCount() * 0.11;
      if (curButtons[direction] === 'activated' && hasCapacity) {
        console.log('on-the-way stop and has capacity');
        this.goToFloor(floorNum, true);
      }
    });

    // ----- STOPPED AT FLOOR ------ //

    // To-DO -- run idle elevator function to look for floor need

    // Triggered when the elevator has arrived at a floor.
    elevator.on('stopped_at_floor', function (floorNum) {
      console.log(
        `Stopped at floor ${floorNum}! Destinations still in queue: ${this.destinationQueue}`
      );

      // Check for requests in current direction
      // first check for request at very top/bottom
      const bottomFloorActive = floors[0].buttonStates.up === 'activated';
      const topFloorActive =
        floors[floors.length - 1].buttonStates.down === 'activated';
      if (directionState === 'up' && topFloorActive)
        elevator.goToFloor(floors.length - 1);
      if (directionState === 'down' && bottomFloorActive) elevator.goToFloor(0);

      // then check for other requests recursively (base case = current floor)
      // floors.forEach(floor => {
      //   if (directionState === 'up') {
      //   }
      // });

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
