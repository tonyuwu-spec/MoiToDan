// ======================================================
// MỜI TỪ ĐÀN
// INTRO SCENE
// ======================================================



// ======================================================
// ENVIRONMENTS
// ======================================================

const ENVIRONMENTS = {


  // ====================================================
  // DAWN
  // ====================================================

  dawn: {

    label:
      "DAWN",

    video:
      "assets/Intro_dawnvid.mp4",

    tree1:
      "assets/Intro_dawntree1.png",

    tree2:
      "assets/Intro_dawntree2.png",

    tree3:
      "assets/Intro_dawntree3.png",

    texts: [

      "assets/Intro_dawntext1.png",

      "assets/Intro_dawntext2.png",

      "assets/Intro_dawntext3.png"

    ]

  },



  // ====================================================
  // MORNING
  // ====================================================

  morning: {

    label:
      "MORNING",

    video:
      "assets/Intro_morningvid.mp4",

    tree1:
      "assets/Intro_morningtree1.png",

    tree2:
      "assets/Intro_morningtree2.png",

    tree3:
      "assets/Intro_morningtree3.png",

    texts: [

      "assets/Intro_morningtext1.png",

      "assets/Intro_morningtext2.png",

      "assets/Intro_morningtext3.png"

    ]

  },



  // ====================================================
  // DUSK
  // ====================================================

  dusk: {

    label:
      "DUSK",

    video:
      "assets/Intro_duskvid.mp4",

    tree1:
      "assets/Intro_dusktree1.png",

    tree2:
      "assets/Intro_dusktree2.png",

    tree3:
      "assets/Intro_dusktree3.png",

    texts: [

      "assets/Intro_dusktext1.png",

      "assets/Intro_dusktext2.png",

      "assets/Intro_dusktext3.png"

    ]

  },



  // ====================================================
  // NIGHT
  // ====================================================

  night: {

    label:
      "NIGHT",

    video:
      "assets/Intro_nightvid.mp4",

    tree1:
      "assets/Intro_nighttree1.png",

    tree2:
      "assets/Intro_nighttree2.png",

    tree3:
      "assets/Intro_nighttree3.png",

    texts: [

      "assets/Intro_nighttext1.png",

      "assets/Intro_nighttext2.png",

      "assets/Intro_nighttext3.png"

    ]

  }

};



// ======================================================
// INTRO SCENE
// ======================================================

export class IntroScene {


  constructor(
    options
  ) {


    this.state =
      options.state;


    this.sceneVideo =
      options.sceneVideo;


    this.tree1 =
      options.tree1;


    this.tree2 =
      options.tree2;


    this.tree3 =
      options.tree3;


    this.textBox =
      options.textBox;


    this.timeResult =
      options.timeResult;


    this.resizeSceneBoard =
      options.resizeSceneBoard;



    this.selectedEnvironment =
      "dawn";



    // ==================================================
    // TEXT
    // ==================================================

    this.currentTextIndex =
      0;


    this.textTimer =
      null;


    this.textTransitionTimer =
      null;


    this.textTransitioning =
      false;


    this.textSequenceComplete =
      false;



    // ==================================================
    // VIDEO
    // ==================================================

    this.sceneVideo.loop =
      true;


    this.sceneVideo.muted =
      true;


    this.sceneVideo.volume =
      0;



    this.sceneVideo.addEventListener(

      "ended",

      () => {


        this.sceneVideo.currentTime =
          0;



        this.sceneVideo
          .play()
          .catch(
            () => {}
          );

      }

    );



    // ==================================================
    // TEXT CLICK
    // ==================================================

    this.textBox.addEventListener(

      "click",

      () => {


        this.advanceText();

      }

    );



    // ==================================================
    // ERRORS
    // ==================================================

    [

      this.tree1,

      this.tree2,

      this.tree3,

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

              "FAILED INTRO ASSET:",

              image.src

            );

          }

        );

      }

    );



    this.sceneVideo.addEventListener(

      "error",

      () => {


        console.error(

          "FAILED INTRO VIDEO:",

          this.sceneVideo.src

        );

      }

    );

  }



  // ====================================================
  // TIME CLASSIFICATION
  // ====================================================

  classifyTime(
    value
  ) {


    if (
      !value
    ) {

      return "dawn";

    }



    const parts =
      value.split(":");



    const hour =

      Number(
        parts[0]
      );



    const minute =

      Number(
        parts[1]
      );



    const total =

      hour
      *
      60

      +

      minute;



    // DAWN

    if (

      total >= 4 * 60

      &&

      total <= 6 * 60 + 59

    ) {

      return "dawn";

    }



    // MORNING

    if (

      total >= 7 * 60

      &&

      total <= 16 * 60 + 59

    ) {

      return "morning";

    }



    // DUSK

    if (

      total >= 17 * 60

      &&

      total <= 18 * 60 + 30

    ) {

      return "dusk";

    }



    return "night";

  }



  // ====================================================
  // UPDATE TIME
  // ====================================================

  updateTime(
    value
  ) {


    const environmentName =

      this.classifyTime(
        value
      );



    const environment =

      ENVIRONMENTS[
        environmentName
      ];



    this.timeResult.textContent =

      `${value} → ${environment.label}`;



    this.applyEnvironment(
      environmentName
    );

  }



  // ====================================================
  // APPLY ENVIRONMENT
  // ====================================================

  applyEnvironment(
    environmentName
  ) {


    const environment =

      ENVIRONMENTS[
        environmentName
      ];



    if (
      !environment
    ) {

      return;

    }



    this.selectedEnvironment =
      environmentName;



    // VIDEO

    const currentVideo =

      this.sceneVideo.getAttribute(
        "src"
      );



    if (
      currentVideo !== environment.video
    ) {


      this.sceneVideo.pause();



      this.sceneVideo.src =
        environment.video;



      this.sceneVideo.load();

    }



    this.sceneVideo.loop =
      true;


    this.sceneVideo.muted =
      true;


    this.sceneVideo.volume =
      0;



    // TREES

    this.tree1.src =
      environment.tree1;


    this.tree2.src =
      environment.tree2;


    this.tree3.src =
      environment.tree3;



    // PRELOAD TEXT

    environment.texts.forEach(

      (
        src
      ) => {


        const image =
          new Image();



        image.src =
          src;

      }

    );



    this.textBox.src =
      environment.texts[0];

  }



  // ====================================================
  // ENTER INTRO
  // ====================================================

  async enter(
    data = {}
  ) {


    const timeValue =

      data.timeValue

      ||

      "05:30";



    const environmentName =

      this.classifyTime(
        timeValue
      );



    this.applyEnvironment(
      environmentName
    );



    this.state.introRunning =
      true;


    this.state.talkRunning =
      false;


    this.state.cameraControlsActive =
      true;



    // ==================================================
    // RECORDING TIMER STARTS ONLY ONCE
    // ==================================================

    if (
      !this.state.recordingActive
    ) {


      this.state.recordingActive =
        true;



      this.state.recordingStartedAt =
        performance.now();

    }



    document.body.classList.add(
      "recording-active"
    );



    document.body.classList.add(
      "intro-active"
    );



    // ==================================================
    // RESET INTRO CAMERA FIRST TIME
    // ==================================================

    this.state.targetZoom =
      1;


    this.state.currentZoom =
      1;


    this.state.currentPanX =
      0;


    this.state.currentPanY =
      0;



    // TEXT

    this.resetTextSequence();



    // VIDEO

    this.sceneVideo.currentTime =
      0;



    try {


      await this.sceneVideo.play();


    }


    catch (
      error
    ) {


      console.warn(

        "INTRO VIDEO PLAY ERROR:",

        error

      );

    }



    this.resizeSceneBoard();



    // ==================================================
    // FIRST TEXT AFTER 3 SECONDS
    // ==================================================

    this.textTimer =

      window.setTimeout(

        () => {


          this.showText();

        },

        3000

      );

  }



  // ====================================================
  // RESET TEXT
  // ====================================================

  resetTextSequence() {


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


    this.currentTextIndex =
      0;


    this.textTransitioning =
      false;


    this.textSequenceComplete =
      false;



    const environment =

      ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      environment
    ) {


      this.textBox.src =
        environment.texts[0];

    }



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping"

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
  // TEXT CHANGE
  // ====================================================

  changeText(
    nextIndex
  ) {


    if (
      this.textTransitioning
    ) {

      return;

    }



    const environment =

      ENVIRONMENTS[
        this.selectedEnvironment
      ];



    if (
      !environment
    ) {

      return;

    }



    const nextSource =

      environment.texts[
        nextIndex
      ];



    if (
      !nextSource
    ) {

      return;

    }



    this.textTransitioning =
      true;



    this.textBox.classList.add(
      "is-swapping"
    );



    this.textTransitionTimer =

      window.setTimeout(

        () => {


          this.currentTextIndex =
            nextIndex;



          this.textBox.src =
            nextSource;



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
  // ADVANCE INTRO TEXT
  // ====================================================

  advanceText() {


    if (
      !this.state.introRunning
    ) {

      return;

    }



    if (
      this.textTransitioning
    ) {

      return;

    }



    // 1 → 2

    if (
      this.currentTextIndex === 0
    ) {


      this.changeText(
        1
      );


      return;

    }



    // 2 → 3

    if (
      this.currentTextIndex === 1
    ) {


      this.changeText(
        2
      );


      return;

    }



    // 3 → TALK

    if (

      this.currentTextIndex === 2

      &&

      !this.textSequenceComplete

    ) {


      this.textSequenceComplete =
        true;



      document.dispatchEvent(

        new CustomEvent(

          "intro-text-complete",

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
  // UPDATE
  // ====================================================

  update(
    now
  ) {


    this.animateTrees(
      now
    );

  }



  // ====================================================
  // EXIT
  // ====================================================

  async exit() {


    this.state.introRunning =
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



    this.sceneVideo.pause();



    document.body.classList.remove(
      "intro-active"
    );



    // DO NOT remove recording-active.
    // Timer + handycam continue.

  }



  // ====================================================
  // TREE ANIMATION
  // ====================================================

  animateTrees(
    now
  ) {


    const seconds =

      now
      *
      0.001;



    const mouseX =

      this.state
        .mouseNormalizedX;



    const edgeStrength =

      Math.pow(

        Math.abs(
          mouseX
        ),

        2.5

      );



    // ==================================================
    // TREE 3
    // ==================================================

    const tree3X =

      Math.sin(

        seconds * 0.55

      )

      *
      1.5

      +

      mouseX
      *
      1.5;



    const tree3Y =

      Math.cos(

        seconds * 0.42

      )

      *
      0.8;



    this.tree3.style.transform =

      `translate3d(
        ${tree3X}px,
        ${tree3Y}px,
        0
      )
      scale(1.003)`;



    // ==================================================
    // TREE 2
    // ==================================================

    const tree2Rattle =

      Math.sin(

        seconds * 8.5

      )

      *
      edgeStrength
      *
      1.3;



    const tree2X =

      Math.sin(

        seconds * 0.72

      )

      *
      2.4

      +

      mouseX
      *
      3.2

      +

      tree2Rattle;



    const tree2Y =

      Math.cos(

        seconds * 0.55

      )

      *
      1.2;



    this.tree2.style.transform =

      `translate3d(
        ${tree2X}px,
        ${tree2Y}px,
        0
      )
      scale(1.005)`;



    // ==================================================
    // TREE 1
    // ==================================================

    const tree1Rattle =

      Math.sin(

        seconds * 11.5

      )

      *
      edgeStrength
      *
      2.8;



    const tree1X =

      Math.sin(

        seconds * 0.9

      )

      *
      3.4

      +

      mouseX
      *
      6

      +

      tree1Rattle;



    const tree1Y =

      Math.cos(

        seconds * 0.67

      )

      *
      1.8;



    const tree1Rotation =

      mouseX

      *
      edgeStrength

      *
      0.11;



    this.tree1.style.transform =

      `translate3d(
        ${tree1X}px,
        ${tree1Y}px,
        0
      )

      rotate(
        ${tree1Rotation}deg
      )

      scale(1.008)`;

  }

}