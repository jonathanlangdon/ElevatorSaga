// challenge 3c: if idle, go to closest floor with request

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
      if (closestFloorRequest < 999) elevator.goToFloor(closestFloorRequest);
    });

    // A passenger pressed a button inside elevator
    elevator.on('floor_button_pressed', function (floorNum) {
      this.goToFloor(floorNum);
    });

    // Triggered slightly before the elevator will pass a floor.
    // Direction is either "up" or "down".
    elevator.on('passing_floor', function (floorNum, direction) {
      const hasCapacity = this.elevator.loadFactor() < 0.85;
    });

    // Triggered when the elevator has arrived at a floor.
    elevator.on('stopped_at_floor', function (floorNum) {});
  },
  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
