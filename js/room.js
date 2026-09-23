// ======================================================
// MỜI TỪ ĐÀN
// ROOM / TANGLE SCENE
// ======================================================



// ======================================================
// ROOM ENVIRONMENTS
//
// IMPORTANT:
//
// The selected time continues:
//
// INTRO
// ↓
// TALK
// ↓
// ROOM
//
// File naming:
//
// Room_dawn1.png
// Room_morning1.png
// Room_dusk1.png
// Room_night1.png
//
// and the exact same pattern for:
//
// 2
// leftdoor
// rightdoor
// worm
// text1
// text2
// text3
// ======================================================

const ROOM_ENVIRONMENTS = {


  // ====================================================
  // DAWN
  // ====================================================

  dawn: {


    scene1:
      "assets/Room_dawn1.png",


    scene2:
      "assets/Room_dawn2.png",


    leftDoor:
      "assets/Room_dawnleftdoor.png",


    rightDoor:
      "assets/Room_dawnrightdoor.png",


    worm:
      "assets/Room_dawnworm.png",


    texts: [

      "assets/Room_dawntext1.png",

      "assets/Room_dawntext2.png",

      "assets/Room_dawntext3.png"

    ]

  },



  // ====================================================
  // MORNING
  // ====================================================

  morning: {


    scene1:
      "assets/Room_morning1.png",


    scene2:
      "assets/Room_morning2.png",


    leftDoor:
      "assets/Room_morningleftdoor.png",


    rightDoor:
      "assets/Room_morningrightdoor.png",


    worm:
      "assets/Room_morningworm.png",


    texts: [

      "assets/Room_morningtext1.png",

      "assets/Room_morningtext2.png",

      "assets/Room_morningtext3.png"

    ]

  },



  // ====================================================
  // DUSK
  // ====================================================

  dusk: {


    scene1:
      "assets/Room_dusk1.png",


    scene2:
      "assets/Room_dusk2.png",


    leftDoor:
      "assets/Room_duskleftdoor.png",


    rightDoor:
      "assets/Room_duskrightdoor.png",


    worm:
      "assets/Room_duskworm.png",


    texts: [

      "assets/Room_dusktext1.png",

      "assets/Room_dusktext2.png",

      "assets/Room_dusktext3.png"

    ]

  },



  // ====================================================
  // NIGHT
  // ====================================================

  night: {


    scene1:
      "assets/Room_night1.png",


    scene2:
      "assets/Room_night2.png",


    leftDoor:
      "assets/Room_nightleftdoor.png",


    rightDoor:
      "assets/Room_nightrightdoor.png",


    worm:
      "assets/Room_nightworm.png",


    texts: [

      "assets/Room_nighttext1.png",

      "assets/Room_nighttext2.png",

      "assets/Room_nighttext3.png"

    ]

  }

};



// ======================================================
// TIMING
// ======================================================


// Doors take 1000ms to open.
//
// Text1 comes in just after they finish.

const TEXT1_DELAY =
  1100;



// ======================================================
// ROOM 1 → ROOM 2
//
// Room1 fades OUT for 600ms.
//
// Then Room2 is swapped in.
//
// Room2 fades IN for 600ms.
//
// Then wait a little before text2.
// ======================================================

const ROOM_FADE_OUT_TIME =
  600;


const ROOM_FADE_IN_TIME =
  600;


const TEXT2_AFTER_ROOM_DELAY =
  550;



// ======================================================
// TEXT FADE
// ======================================================

const TEXT_FADE_TIME =
  340;



// ======================================================
// ROOM SCENE
// ======================================================

export class RoomScene {


  constructor(
    options
  ) {


    // ==================================================
    // SHARED STATE
    // ==================================================

    this.state =
      options.state;



    // ==================================================
    // DOM
    // ==================================================

    this.window =
      options.window;


    this.board =
      options.board;


    this.sceneImage =
      options.sceneImage;


    this.leftDoor =
      options.leftDoor;


    this.rightDoor =
      options.rightDoor;


    this.hotspot =
      options.hotspot;


    this.worm =
      options.worm;


    this.textBox =
      options.textBox;



    // ==================================================
    // CURRENT ENVIRONMENT
    // ==================================================

    this.selectedEnvironment =
      "dawn";



    // ==================================================
    // ROOM STORY STATE
    //
    // 0
    // doors closed
    //
    // 1
    // Room1 + text1
    //
    // 2
    // Room2 + text2
    //
    // 3
    // Room2 + text3 + worm
    // ==================================================

    this.stage =
      0;



    this.doorsOpened =
      false;


    this.textTransitioning =
      false;


    this.roomTransitioning =
      false;


    this.sequenceComplete =
      false;



    // ==================================================
    // TIMERS
    // ==================================================

    this.text1Timer =
      null;


    this.roomFadeTimer =
      null;


    this.roomFadeInTimer =
      null;


    this.text2Timer =
      null;


    this.textTransitionTimer =
      null;



    // ==================================================
    // PRELOAD CACHE
    // ==================================================

    this.preloadedEnvironments =
      new Set();



    // ==================================================
    // INVISIBLE DOOR HOTSPOT
    //
    // Only this middle invisible circle opens doors.
    // ==================================================

    this.hotspot.addEventListener(

      "click",

      (
        event
      ) => {


        event.stopPropagation();



        this.openDoors();

      }

    );



    // ==================================================
    // ROOM TEXT
    //
    // Only the textbox moves the timeline forward.
    // ==================================================

    this.textBox.addEventListener(

      "click",

      (
        event
      ) => {


        event.stopPropagation();



        this.advanceText();

      }

    );



    // ==================================================
    // ERROR REPORTING
    // ==================================================

    [

      this.sceneImage,

      this.leftDoor,

      this.rightDoor,

      this.worm,

      this.textBox

    ]
    .forEach(

      (
        image
      ) => {


        image.addEventListener(

          "error",

          () => {


            console.error(

              "FAILED ROOM ASSET:",

              image.src

            );

          }

        );

      }

    );

  }



  // ====================================================
  // PRELOAD ENVIRONMENT
  // ====================================================

  preloadEnvironment(
    environmentName
  ) {


    if (
      this.preloadedEnvironments.has(
        environmentName
      )
    ) {

      return;

    }



    const environment =

      ROOM_ENVIRONMENTS[
        environmentName
      ];



    if (
      !environment
    ) {

      return;

    }



    this.preloadedEnvironments.add(
      environmentName
    );



    const sources = [

      environment.scene1,

      environment.scene2,

      environment.leftDoor,

      environment.rightDoor,

      environment.worm,

      ...environment.texts

    ];



    sources.forEach(

      (
        src
      ) => {


        const image =
          new Image();



        image.src =
          src;

      }

    );

  }



  // ====================================================
  // PRELOAD DEFAULT
  //
  // Kept because sketch.js currently calls roomScene.preload()
  //
  // This means you do NOT need to change sketch.js.
  // ====================================================

  preload() {


    this.preloadEnvironment(
      "dawn"
    );

  }



  // ====================================================
  // APPLY TIME ENVIRONMENT
  // ====================================================

  applyEnvironment(
    environmentName
  ) {


    let safeEnvironment =
      environmentName;



    if (
      !ROOM_ENVIRONMENTS[
        safeEnvironment
      ]
    ) {


      console.warn(

        "UNKNOWN ROOM ENVIRONMENT:",

        environmentName,

        "FALLING BACK TO DAWN."

      );



      safeEnvironment =
        "dawn";

    }



    const environment =

      ROOM_ENVIRONMENTS[
        safeEnvironment
      ];



    this.selectedEnvironment =
      safeEnvironment;



    // ==================================================
    // CSS KNOWS WHICH ENVIRONMENT IS ACTIVE
    //
    // Useful for separate worm positioning later.
    // ==================================================

    this.window.dataset.environment =
      safeEnvironment;



    // ==================================================
    // SCENE 1
    // ==================================================

    this.sceneImage.src =
      environment.scene1;



    // ==================================================
    // DOORS
    // ==================================================

    this.leftDoor.src =
      environment.leftDoor;



    this.rightDoor.src =
      environment.rightDoor;



    // ==================================================
    // WORM
    // ==================================================

    this.worm.src =
      environment.worm;



    // ==================================================
    // TEXT 1
    // ==================================================

    this.textBox.src =
      environment.texts[0];



    // ==================================================
    // PRELOAD ALL FILES FOR THIS TIME
    // ==================================================

    this.preloadEnvironment(
      safeEnvironment
    );

  }



  // ====================================================
  // ENTER ROOM
  // ====================================================

  async enter(
    data = {}
  ) {


    // ==================================================
    // RECEIVE SAME TIME FROM TALK
    //
    // dawn
    // morning
    // dusk
    // night
    // ==================================================

    const environmentName =

      data.environment

      ||

      "dawn";



    this.applyEnvironment(
      environmentName
    );



    // ==================================================
    // SHARED SCENE STATE
    // ==================================================

    this.state.introRunning =
      false;


    this.state.talkRunning =
      false;


    this.state.roomRunning =
      true;


    this.state.cameraControlsActive =
      true;



    // ==================================================
    // HANDYCAM REMAINS RUNNING
    //
    // Recording time is NOT restarted.
    // ==================================================

    document.body.classList.add(
      "recording-active"
    );



    document.body.classList.add(
      "room-active"
    );



    // ==================================================
    // RESET ROOM STORY
    // ==================================================

    this.reset();

  }



  // ====================================================
  // RESET
  // ====================================================

  reset() {


    this.clearTimers();



    this.stage =
      0;


    this.doorsOpened =
      false;


    this.textTransitioning =
      false;


    this.roomTransitioning =
      false;


    this.sequenceComplete =
      false;



    const environment =

      ROOM_ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      !environment
    ) {

      return;

    }



    // ==================================================
    // ROOM 1
    // ==================================================

    this.sceneImage.src =
      environment.scene1;



    this.sceneImage.classList.remove(
      "is-scene-fading"
    );



    // ==================================================
    // DOORS
    // ==================================================

    this.leftDoor.src =
      environment.leftDoor;


    this.rightDoor.src =
      environment.rightDoor;



    this.window.classList.remove(
      "doors-open"
    );



    // ==================================================
    // WORM
    // ==================================================

    this.worm.src =
      environment.worm;



    this.worm.classList.remove(
      "is-visible"
    );



    // ==================================================
    // TEXT 1
    // ==================================================

    this.textBox.src =
      environment.texts[0];



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping",

      "is-bottom"

    );



    this.textBox.classList.add(
      "is-top"
    );

  }



  // ====================================================
  // CLEAR ALL TIMERS
  // ====================================================

  clearTimers() {


    if (
      this.text1Timer
    ) {


      clearTimeout(
        this.text1Timer
      );

    }



    if (
      this.roomFadeTimer
    ) {


      clearTimeout(
        this.roomFadeTimer
      );

    }



    if (
      this.roomFadeInTimer
    ) {


      clearTimeout(
        this.roomFadeInTimer
      );

    }



    if (
      this.text2Timer
    ) {


      clearTimeout(
        this.text2Timer
      );

    }



    if (
      this.textTransitionTimer
    ) {


      clearTimeout(
        this.textTransitionTimer
      );

    }



    this.text1Timer =
      null;


    this.roomFadeTimer =
      null;


    this.roomFadeInTimer =
      null;


    this.text2Timer =
      null;


    this.textTransitionTimer =
      null;

  }



  // ====================================================
  // OPEN DOORS
  // ====================================================

  openDoors() {


    if (
      !this.state.roomRunning
    ) {

      return;

    }



    if (
      this.doorsOpened
    ) {

      return;

    }



    this.doorsOpened =
      true;



    // ==================================================
    // OPEN BOTH DOOR PNGs
    // ==================================================

    this.window.classList.add(
      "doors-open"
    );



    // ==================================================
    // TEXT1 AFTER DOORS FINISH
    // ==================================================

    this.text1Timer =

      window.setTimeout(

        () => {


          this.stage =
            1;



          const environment =

            ROOM_ENVIRONMENTS[
              this.selectedEnvironment
            ];



          this.textBox.src =
            environment.texts[0];



          this.setTextPosition(
            "top"
          );



          this.showText();



          this.text1Timer =
            null;

        },

        TEXT1_DELAY

      );

  }



  // ====================================================
  // SHOW TEXT
  // ====================================================

  showText() {


    this.textBox.classList.remove(
      "is-swapping"
    );



    this.textBox.classList.add(
      "is-visible"
    );

  }



  // ====================================================
  // SET TEXT POSITION
  // ====================================================

  setTextPosition(
    position
  ) {


    this.textBox.classList.remove(

      "is-top",

      "is-bottom"

    );



    if (
      position === "top"
    ) {


      this.textBox.classList.add(
        "is-top"
      );


      return;

    }



    this.textBox.classList.add(
      "is-bottom"
    );

  }



  // ====================================================
  // ROOM TEXT TIMELINE
  // ====================================================

  advanceText() {


    if (
      !this.state.roomRunning
    ) {

      return;

    }



    if (
      this.textTransitioning
    ) {

      return;

    }



    if (
      this.roomTransitioning
    ) {

      return;

    }



    // ==================================================
    // TEXT1 CLICK
    //
    // Room1
    // ↓ cinematic fade
    // Room2
    // ↓ wait
    // Text2
    // ==================================================

    if (
      this.stage === 1
    ) {


      this.goToRoom2();


      return;

    }



    // ==================================================
    // TEXT2 CLICK
    //
    // Text2
    // ↓ fade
    // Text3 + worm from right
    // ==================================================

    if (
      this.stage === 2
    ) {


      this.showFinalTextAndWorm();


      return;

    }



    // ==================================================
    // TEXT3
    //
    // Future TANGLE continuation goes here.
    // ==================================================

    if (

      this.stage === 3

      &&

      !this.sequenceComplete

    ) {


      this.sequenceComplete =
        true;



      console.log(

        "ROOM SEQUENCE COMPLETE"

      );



      document.dispatchEvent(

        new CustomEvent(

          "room-complete",

          {

            detail: {

              environment:
                this.selectedEnvironment

            }

          }

        )

      );

    }

  }



  // ====================================================
  // ROOM 1 → ROOM 2
  //
  // CINEMATIC TRANSITION
  //
  // text1 fades out
  // room1 fades out
  // source changes
  // room2 fades in
  // pause
  // text2 appears
  // ====================================================

  goToRoom2() {


    const environment =

      ROOM_ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      !environment
    ) {

      return;

    }



    this.roomTransitioning =
      true;


    this.textTransitioning =
      true;



    // ==================================================
    // TEXT1 FADE OUT
    // ==================================================

    this.textBox.classList.add(
      "is-swapping"
    );



    // ==================================================
    // ROOM1 FADE OUT
    // ==================================================

    this.sceneImage.classList.add(
      "is-scene-fading"
    );



    // ==================================================
    // AFTER ROOM1 HAS FADED OUT
    // ==================================================

    this.roomFadeTimer =

      window.setTimeout(

        () => {


          // ============================================
          // REMOVE TEXT1 COMPLETELY
          // ============================================

          this.textBox.classList.remove(

            "is-visible",

            "is-swapping"

          );



          // ============================================
          // CHANGE TO ROOM2 WHILE INVISIBLE
          // ============================================

          this.sceneImage.src =
            environment.scene2;



          // ============================================
          // TEXT2 WILL USE NORMAL LOWER POSITION
          // ============================================

          this.setTextPosition(
            "bottom"
          );



          // ============================================
          // TWO FRAMES SO BROWSER REGISTERS NEW IMAGE
          // ============================================

          requestAnimationFrame(

            () => {


              requestAnimationFrame(

                () => {


                  // ====================================
                  // ROOM2 FADE IN
                  // ====================================

                  this.sceneImage.classList.remove(
                    "is-scene-fading"
                  );

                }

              );

            }

          );



          this.roomFadeTimer =
            null;



          // ============================================
          // WAIT FOR ROOM2 FADE-IN
          // ============================================

          this.roomFadeInTimer =

            window.setTimeout(

              () => {


                this.roomFadeInTimer =
                  null;



                // ======================================
                // SMALL CINEMATIC PAUSE
                // ======================================

                this.text2Timer =

                  window.setTimeout(

                    () => {


                      this.stage =
                        2;



                      this.textBox.src =
                        environment.texts[1];



                      this.textTransitioning =
                        false;


                      this.roomTransitioning =
                        false;



                      // =================================
                      // TEXT2 FADE IN
                      // =================================

                      this.showText();



                      this.text2Timer =
                        null;

                    },

                    TEXT2_AFTER_ROOM_DELAY

                  );

              },

              ROOM_FADE_IN_TIME

            );

        },

        ROOM_FADE_OUT_TIME

      );

  }



  // ====================================================
  // TEXT2 → TEXT3 + WORM
  // ====================================================

  showFinalTextAndWorm() {


    const environment =

      ROOM_ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      !environment
    ) {

      return;

    }



    this.textTransitioning =
      true;



    // ==================================================
    // FADE TEXT2 OUT
    // ==================================================

    this.textBox.classList.add(
      "is-swapping"
    );



    this.textTransitionTimer =

      window.setTimeout(

        () => {


          // ============================================
          // STORY STATE 3
          // ============================================

          this.stage =
            3;



          // ============================================
          // TEXT3
          // ============================================

          this.textBox.src =
            environment.texts[2];



          this.setTextPosition(
            "bottom"
          );



          // ============================================
          // MAKE SURE CORRECT WORM FILE IS ACTIVE
          // ============================================

          this.worm.src =
            environment.worm;



          // ============================================
          // WORM POPS IN FROM RIGHT
          // ============================================

          this.worm.classList.remove(
            "is-visible"
          );



          // Force CSS animation restart.

          void this.worm.offsetWidth;



          this.worm.classList.add(
            "is-visible"
          );



          // ============================================
          // TEXT3 FADE BACK IN
          // ============================================

          requestAnimationFrame(

            () => {


              requestAnimationFrame(

                () => {


                  this.textBox.classList.remove(
                    "is-swapping"
                  );



                  this.textTransitioning =
                    false;



                  this.textTransitionTimer =
                    null;

                }

              );

            }

          );

        },

        TEXT_FADE_TIME

      );

  }



  // ====================================================
  // UPDATE
  //
  // No continuous JS animation necessary.
  // ====================================================

  update(
    now
  ) {


    void now;

  }



  // ====================================================
  // EXIT
  // ====================================================

  async exit() {


    this.state.roomRunning =
      false;



    this.clearTimers();



    // ==================================================
    // RESET ROOM IMAGE
    // ==================================================

    this.sceneImage.classList.remove(
      "is-scene-fading"
    );



    // ==================================================
    // RESET TEXT
    // ==================================================

    this.textBox.classList.remove(

      "is-visible",

      "is-swapping",

      "is-top",

      "is-bottom"

    );



    // ==================================================
    // RESET WORM
    // ==================================================

    this.worm.classList.remove(
      "is-visible"
    );



    // ==================================================
    // RESET DOORS
    // ==================================================

    this.window.classList.remove(
      "doors-open"
    );



    // ==================================================
    // HIDE ROOM
    // ==================================================

    document.body.classList.remove(
      "room-active"
    );



    // recording-active intentionally stays on.

  }

}