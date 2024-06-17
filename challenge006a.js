// challenge 6a: 40 people with 60 moves

// 10/10

({
  init: function (elevators, floors) {
    // TODO move floors into global variable

    elevators.forEach(elevator => {
      // ----- IDLE ELEVATOR ------ //
      elevator.on('idle', () => console.log());

      // ----- PASSENGER PRESSED BUTTON INSIDE ELEVATOR ------ //
      elevator.on('floor_button_pressed', floorNum => {
        elevator.goToFloor(floorNum);
      });

      // ----- PASSING AN OCCUPIED FLOOR ------ //
      elevator.on('passing_floor', (floorNum, direction) => console.log());

      // ----- STOPPED AT FLOOR ------ //
      elevator.on('stopped_at_floor', floorNum => console.log());
    });
  },

  update: function (dt, elevators, floors) {
    // We normally don't need to do anything here
  }
});
