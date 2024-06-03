// challenge 3: added move if elevator is empty

({
  init: function (elevators, floors) {
    const elevator = elevators[0]; // Let's use the first elevator

    // Whenever the elevator is idle (has no more queued destinations) ...
    elevator.on('idle', function () {
      let curFloor = elevator.currentFloor();
      let firstPressed = elevator.getFirstPressedFloor();

      // find a floor with button activated if empty
      if (elevator.getPressedFloors().length === 0) {
        for (let i = 0; i < floors.length; i++) {
          const curButtons = floors[i].buttonStates;
          if (
            curButtons.up === 'activated' ||
            curButtons.down === 'activated'
          ) {
            elevator.goToFloor(i);
            break;
          }
        }
      }

      // go to closest floor of pressed buttons
      let closestFloor = 0;
      let closestFloorDist = 9999;
      const floorQueue = elevator.getPressedFloors();
      floorQueue.forEach((floor, index) =>
        Math.abs(curFloor - floor) < closestFloorDist
          ? (closestFloor = index)
          : pass
      );
      elevator.goToFloor(closestFloor);
    });
  },
  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
