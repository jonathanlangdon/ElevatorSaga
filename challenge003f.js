// challenge 3f: re-order Queue when passing floor

function setDirection(elevator, direction) {}

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
        elevator.goToFloor(closestFloorRequest);
      }
    });

    // A passenger pressed a button inside elevator
    elevator.on('floor_button_pressed', function (floorNum) {
      this.goToFloor(floorNum);
      console.log(`Inside button pushed! New queue: ${this.destinationQueue}`);
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

      //re-order queue according to direction of movement
      if (this.destinationDirection() === 'up') {
        elevator.destinationQueue.sort((a, b) => a - b);
      } else if (this.destinationDirection() === 'down') {
        elevator.destinationQueue.sort((a, b) => b - a);
      }
      elevator.checkDestinationQueue();
      console.log(`Queue reordered: ${elevator.destinationQueue}`);
    });

    // Triggered when the elevator has arrived at a floor.
    elevator.on('stopped_at_floor', function (floorNum) {
      console.log(
        `Stopped at floor ${floorNum}! Destinations still in queue: ${this.destinationQueue}`
      );
    });
  },
  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
