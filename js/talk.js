// ======================================================
// MỜI TỪ ĐÀN
// TALKING SCENE
// ======================================================



// ======================================================
// TALK ENVIRONMENTS
// ======================================================

const TALK_ENVIRONMENTS = {


  dawn: {


    video:
      "assets/Talk_dawnvid.mp4",


    layer3:
      "assets/Talk_dawn3.png",


    worm:
      "assets/Talk_dawnworm.png",


    characters: [

      "assets/Talk_dawn1.png",

      "assets/Talk_dawn1_2.png",

      "assets/Talk_dawn1_3.png"

    ],


    texts: [

      "assets/Talk_dawntext1.png",

      "assets/Talk_dawntext2.png",

      "assets/Talk_dawntext3.png"

    ]

  },



  morning: {


    video:
      "assets/Talk_morningvid.mp4",


    layer3:
      "assets/Talk_morning3.png",


    worm:
      "assets/Talk_morningworm.png",


    characters: [

      "assets/Talk_morning1.png",

      "assets/Talk_morning1_2.png",

      "assets/Talk_morning1_3.png"

    ],


    texts: [

      "assets/Talk_morningtext1.png",

      "assets/Talk_morningtext2.png",

      "assets/Talk_morningtext3.png"

    ]

  },



  dusk: {


    video:
      "assets/Talk_duskvid.mp4",


    layer3:
      "assets/Talk_dusk3.png",


    worm:
      "assets/Talk_duskworm.png",


    characters: [

      "assets/Talk_dusk1.png",

      "assets/Talk_dusk1_2.png",

      "assets/Talk_dusk1_3.png"

    ],


    texts: [

      "assets/Talk_dusktext1.png",

      "assets/Talk_dusktext2.png",

      "assets/Talk_dusktext3.png"

    ]

  },



  night: {


    video:
      "assets/Talk_nightvid.mp4",


    layer3:
      "assets/Talk_night3.png",


    worm:
      "assets/Talk_nightworm.png",


    characters: [

      "assets/Talk_night1.png",

      "assets/Talk_night1_2.png",

      "assets/Talk_night1_3.png"

    ],


    texts: [

      "assets/Talk_nighttext1.png",

      "assets/Talk_nighttext2.png",

      "assets/Talk_nighttext3.png"

    ]

  }

};



// ======================================================
// TALK SCENE
// ======================================================

export class TalkScene {


  constructor(
    options
  ) {


    this.state =
      options.state;


    this.window =
      options.window;


    this.board =
      options.board;


    this.video =
      options.video;


    this.layer3 =
      options.layer3;


    this.worm =
      options.worm;


    this.character =
      options.character;


    this.textBox =
      options.textBox;



    this.selectedEnvironment =
      "dawn";


    this.currentIndex =
      0;


    this.textTimer =
      null;


    this.textTransitionTimer =
      null;


    this.textTransitioning =
      false;


    this.sequenceComplete =
      false;


    this.preloadedEnvironments =
      new Set();



    // ==================================================
    // VIDEO
    // ==================================================

    this.video.loop =
      true;


    this.video.muted =
      true;


    this.video.volume =
      0;



    // ==================================================
    // ONLY TEXT ADVANCES DIALOGUE
    // ==================================================

    this.textBox.addEventListener(

      "click",

      (
        event
      ) => {


        event.stopPropagation();



        this.advance();

      }

    );



    // ==================================================
    // ONLY WORM MAKES WORM DUCK
    // ==================================================

    this.worm.addEventListener(

      "click",

      (
        event
      ) => {


        event.stopPropagation();



        this.duckWorm();

      }

    );



    // ==================================================
    // VIDEO LOOP FALLBACK
    // ==================================================

    this.video.addEventListener(

      "ended",

      () => {


        this.video.currentTime =
          0;



        this.video
          .play()
          .catch(
            () => {}
          );

      }

    );



    // ==================================================
    // ERRORS
    // ==================================================

    this.video.addEventListener(

      "error",

      () => {


        console.error(

          "FAILED TALK VIDEO:",

          this.video.src

        );

      }

    );



    [

      this.layer3,

      this.worm,

      this.character,

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

              "FAILED TALK ASSET:",

              image.src

            );

          }

        );

      }

    );

  }



  // ====================================================
  // PRELOAD
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

      TALK_ENVIRONMENTS[
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



    const imageSources = [

      environment.layer3,

      environment.worm,

      ...environment.characters,

      ...environment.texts

    ];



    imageSources.forEach(

      (
        src
      ) => {


        const image =
          new Image();



        image.src =
          src;

      }

    );



    const preloadVideo =

      document.createElement(
        "video"
      );



    preloadVideo.preload =
      "auto";


    preloadVideo.muted =
      true;


    preloadVideo.src =
      environment.video;



    preloadVideo.load();

  }



  // ====================================================
  // APPLY ENVIRONMENT
  // ====================================================

  applyEnvironment(
    environmentName
  ) {


    const environment =

      TALK_ENVIRONMENTS[
        environmentName
      ];



    if (
      !environment
    ) {


      console.warn(

        "UNKNOWN TALK ENVIRONMENT:",

        environmentName

      );


      return;

    }



    this.selectedEnvironment =
      environmentName;



    this.window.dataset.environment =
      environmentName;



    const currentVideo =

      this.video.getAttribute(
        "src"
      );



    if (
      currentVideo !== environment.video
    ) {


      this.video.pause();



      this.video.src =
        environment.video;



      this.video.load();

    }



    this.video.loop =
      true;


    this.video.muted =
      true;


    this.video.volume =
      0;



    this.layer3.src =
      environment.layer3;



    this.worm.src =
      environment.worm;



    this.character.src =
      environment.characters[0];



    this.textBox.src =
      environment.texts[0];



    this.preloadEnvironment(
      environmentName
    );

  }



  // ====================================================
  // ENTER
  // ====================================================

  async enter(
    data = {}
  ) {


    const environmentName =

      data.environment

      ||

      "dawn";



    this.applyEnvironment(
      environmentName
    );



    this.state.talkRunning =
      true;


    this.state.introRunning =
      false;


    this.state.roomRunning =
      false;


    this.state.cameraControlsActive =
      true;



    document.body.classList.add(
      "recording-active"
    );



    document.body.classList.add(
      "talk-active"
    );



    this.reset();



    this.video.currentTime =
      0;



    try {


      await this.video.play();


    }


    catch (
      error
    ) {


      console.warn(

        "TALK VIDEO PLAY ERROR:",

        error

      );

    }



    this.textTimer =

      window.setTimeout(

        () => {


          this.showText();

        },

        2000

      );

  }



  // ====================================================
  // RESET
  // ====================================================

  reset() {


    if (
      this.textTimer
    ) {


      clearTimeout(
        this.textTimer
      );

    }



    if (
      this.textTransitionTimer
    ) {


      clearTimeout(
        this.textTransitionTimer
      );

    }



    this.textTimer =
      null;


    this.textTransitionTimer =
      null;



    this.currentIndex =
      0;


    this.textTransitioning =
      false;


    this.sequenceComplete =
      false;



    const environment =

      TALK_ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      environment
    ) {


      this.character.src =
        environment.characters[0];


      this.textBox.src =
        environment.texts[0];

    }



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping"

    );



    this.worm.classList.remove(
      "is-ducking"
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
  // ADVANCE
  // ====================================================

  advance() {


    if (
      !this.state.talkRunning
    ) {

      return;

    }



    if (
      this.textTransitioning
    ) {

      return;

    }



    // ==================================================
    // TALK 1 → TALK 2
    // ==================================================

    if (
      this.currentIndex === 0
    ) {


      this.changeState(
        1
      );


      return;

    }



    // ==================================================
    // TALK 2 → TALK 3
    // ==================================================

    if (
      this.currentIndex === 1
    ) {


      this.changeState(
        2
      );


      return;

    }



    // ==================================================
    // TALK TEXT3 CLICK
    //
    // ENTER ROOM / TANGLE
    // ==================================================

    if (

      this.currentIndex === 2

      &&

      !this.sequenceComplete

    ) {


      this.sequenceComplete =
        true;



      document.dispatchEvent(

        new CustomEvent(

          "talk-complete",

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
  // CHANGE STATE
  //
  // CHARACTER = INSTANT
  // TEXT = FADE
  // ====================================================

  changeState(
    nextIndex
  ) {


    if (
      this.textTransitioning
    ) {

      return;

    }



    const environment =

      TALK_ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      !environment
    ) {

      return;

    }



    const nextCharacter =

      environment.characters[
        nextIndex
      ];



    const nextText =

      environment.texts[
        nextIndex
      ];



    if (

      !nextCharacter

      ||

      !nextText

    ) {

      return;

    }



    this.textTransitioning =
      true;



    this.currentIndex =
      nextIndex;



    // Character changes instantly.

    this.character.src =
      nextCharacter;



    // Text fades.

    this.textBox.classList.add(
      "is-swapping"
    );



    this.textTransitionTimer =

      window.setTimeout(

        () => {


          this.textBox.src =
            nextText;



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

        340

      );

  }



  // ====================================================
  // WORM DUCK
  // ====================================================

  duckWorm() {


    this.worm.classList.remove(
      "is-ducking"
    );



    void this.worm.offsetWidth;



    this.worm.classList.add(
      "is-ducking"
    );



    this.worm.addEventListener(

      "animationend",

      (
        event
      ) => {


        if (
          event.animationName !== "talk-worm-duck"
        ) {

          return;

        }



        this.worm.classList.remove(
          "is-ducking"
        );

      },

      {

        once:
          true

      }

    );

  }



  // ====================================================
  // UPDATE
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


    this.state.talkRunning =
      false;



    if (
      this.textTimer
    ) {


      clearTimeout(
        this.textTimer
      );

    }



    if (
      this.textTransitionTimer
    ) {


      clearTimeout(
        this.textTransitionTimer
      );

    }



    this.textTimer =
      null;


    this.textTransitionTimer =
      null;



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping"

    );



    this.worm.classList.remove(
      "is-ducking"
    );



    this.video.pause();



    document.body.classList.remove(
      "talk-active"
    );

  }

}