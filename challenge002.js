// Solution to Challenge 2: 20 people in 1 min

({
  init: function (elevators, floors) {
    var elevator = elevators[0]; // Let's use the first elevator

    // Whenever the elevator is idle (has no more queued destinations) ...
    elevator.on('idle', function () {
      console.log(floors);
      // let's go to all the floors (or did we forget one?)
      for (let i = 0; i < floors.length; i++) {
        elevator.goToFloor(i);
      }
    });
  },
  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
