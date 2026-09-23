const DRAW_ENVIRONMENTS = {
  dawn: {
    background:
      "assets/Draw_dawnbg.png",
    video1:
      "assets/Draw_dawnvid.mp4",
    video2:
      "assets/Draw_dawnvid2.mp4"
  },

  morning: {
    background:
      "assets/Draw_morningbg.png",
    video1:
      "assets/Draw_morningvid.mp4",
    video2:
      "assets/Draw_morningvid2.mp4"
  },

  dusk: {
    background:
      "assets/Draw_duskbg.png",
    video1:
      "assets/Draw_duskvid.mp4",
    video2:
      "assets/Draw_duskvid2.mp4"
  },

  night: {
    background:
      "assets/Draw_nightbg.png",
    video1:
      "assets/Draw_nightvid.mp4",
    video2:
      "assets/Draw_nightvid2.mp4"
  }
};



export class DrawScene {

  constructor(
    options
  ) {

    this.state =
      options.state;


    // ==================================================
    // DRAW-ONLY HAND ACCESS
    //
    // gesture.js itself is NOT changed.
    // ==================================================

    this.getHandState =
      options.getHandState
      ||
      (() => null);



    this.window =
      options.window;


    this.board =
      options.board;


    this.background =
      options.background;


    this.video1 =
      options.video1;


    this.video2 =
      options.video2;


    this.paperMount =
      options.paperMount;


    this.controls =
      options.controls;


    this.modeIndicator =
      options.modeIndicator;


    this.rotateButton =
      options.rotateButton;


    this.clearFrontButton =
      options.clearFrontButton;


    this.clearBackButton =
      options.clearBackButton;


    this.resetButton =
      options.resetButton;


    this.finishButton =
      options.finishButton;


    this.silkHotspot =
      options.silkHotspot;


    this.penHotspot =
      options.penHotspot;


    this.textBox =
      options.textBox;



    this.selectedEnvironment =
      "dawn";


    this.phase =
      "idle";


    this.preloaded =
      false;


    this.finishedArtwork =
      null;



    this.paperExitTimer =
      null;


    this.videoTransitionTimer =
      null;


    this.textTimer =
      null;



    this.paper =

      new DrawPaper(

        "draw-paper-mount",

        {

          onModeChange:

            (
              mode
            ) => {

              this.updateModeUI(
                mode
              );

            }

        }

      );



    // ==================================================
    // INTRO TEXT
    // ==================================================

    this.textBox.addEventListener(

      "click",

      (
        event
      ) => {

        if (
          this.phase !== "intro"
        ) {

          return;

        }


        event.preventDefault();

        event.stopPropagation();


        this.startDrawingPhase();

      }

    );



    // ==================================================
    // ROTATE
    // ==================================================

    this.rotateButton.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.setMode(
          "rotate"
        );

      }

    );



    // ==================================================
    // SILK HOTSPOT
    // ==================================================

    this.silkHotspot.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.setMode(
          "silk"
        );

      }

    );



    // ==================================================
    // PEN HOTSPOT
    // ==================================================

    this.penHotspot.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.setMode(
          "pen"
        );

      }

    );



    // ==================================================
    // CLEAR DRAW
    // ==================================================

    this.clearFrontButton.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.clearFront();

      }

    );



    // ==================================================
    // CLEAR TEXT
    // ==================================================

    this.clearBackButton.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.clearBack();

      }

    );



    // ==================================================
    // RESET PAPER
    // ==================================================

    this.resetButton.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.paper.reset();

      }

    );



    // ==================================================
    // FINISH
    // ==================================================

    this.finishButton.addEventListener(

      "click",

      (
        event
      ) => {

        event.preventDefault();

        event.stopPropagation();


        this.finishDrawing();

      }

    );



    // ==================================================
    // VIDEO 1 END
    // ==================================================

    this.video1.addEventListener(

      "ended",

      () => {

        this.beginVideoTransition();

      }

    );

  }



  // ====================================================
  // PRELOAD
  // ====================================================

  preload() {

    if (
      this.preloaded
    ) {

      return;

    }


    this.preloaded =
      true;



    for (
      const environment
      of
      Object.values(
        DRAW_ENVIRONMENTS
      )
    ) {

      const image =
        new Image();


      image.src =
        environment.background;

    }



    const text0 =
      new Image();


    text0.src =
      "assets/Draw_text0.png";



    const text1 =
      new Image();


    text1.src =
      "assets/Draw_text1.png";

  }



  // ====================================================
  // ENVIRONMENT
  // ====================================================

  applyEnvironment(
    environmentName
  ) {

    let safeEnvironment =
      environmentName;


    if (
      !DRAW_ENVIRONMENTS[
        safeEnvironment
      ]
    ) {

      safeEnvironment =
        "dawn";

    }


    this.selectedEnvironment =
      safeEnvironment;


    this.window.dataset.environment =
      safeEnvironment;



    const environment =

      DRAW_ENVIRONMENTS[
        safeEnvironment
      ];



    this.background.src =
      environment.background;


    this.video1.src =
      environment.video1;


    this.video2.src =
      environment.video2;



    this.video1.load();

    this.video2.load();

  }



  // ====================================================
  // ENTER
  // ====================================================

  async enter(
    data = {}
  ) {

    const environment =

      data.environment

      ||

      "dawn";


    this.applyEnvironment(
      environment
    );


    this.preload();



    this.state.introRunning =
      false;


    this.state.talkRunning =
      false;


    this.state.roomRunning =
      false;


    this.state.cutRunning =
      false;


    this.state.cutCameraActive =
      false;


    this.state.drawRunning =
      true;


    this.state.drawCameraActive =
      false;


    this.state.cameraControlsActive =
      true;



    this.resetCamera();



    document.body.classList.add(
      "recording-active"
    );


    document.body.classList.add(
      "draw-active"
    );


    document.body.classList.add(
      "draw-intro"
    );


    document.body.classList.remove(
      "draw-drawing"
    );


    document.body.classList.remove(
      "draw-finishing"
    );


    document.body.classList.remove(
      "draw-video1-phase"
    );


    document.body.classList.remove(
      "draw-video1-fading"
    );


    document.body.classList.remove(
      "draw-video2-phase"
    );


    document.body.classList.remove(
      "draw-video2-visible"
    );



    this.reset();


    this.showIntroText();

  }



  // ====================================================
  // RESET
  // ====================================================

  reset() {

    this.clearTimers();


    this.phase =
      "intro";


    this.finishedArtwork =
      null;



    this.paper.stop();



    try {

      this.video1.pause();

      this.video1.currentTime =
        0;

    }

    catch (
      error
    ) {

      void error;

    }



    try {

      this.video2.pause();

      this.video2.currentTime =
        0;

    }

    catch (
      error
    ) {

      void error;

    }



    this.video1.loop =
      false;


    this.video2.loop =
      true;



    this.textBox.classList.remove(
      "is-visible"
    );


    this.textBox.classList.remove(
      "is-intro"
    );



    this.updateModeUI(
      "rotate"
    );

  }



  // ====================================================
  // INTRO TEXT
  // ====================================================

  showIntroText() {

    this.phase =
      "intro";


    this.textBox.src =
      "assets/Draw_text0.png";


    this.textBox.classList.add(
      "is-intro"
    );



    requestAnimationFrame(

      () => {

        requestAnimationFrame(

          () => {

            if (
              this.phase !== "intro"
            ) {

              return;

            }


            this.textBox.classList.add(
              "is-visible"
            );

          }

        );

      }

    );

  }



  // ====================================================
  // START DRAWING
  // ====================================================

  startDrawingPhase() {

    if (
      this.phase !== "intro"
    ) {

      return;

    }


    this.phase =
      "drawing";


    this.textBox.classList.remove(
      "is-visible"
    );



    window.setTimeout(

      () => {

        if (
          this.phase !== "drawing"
        ) {

          return;

        }


        this.textBox.classList.remove(
          "is-intro"
        );

      },

      340

    );



    document.body.classList.remove(
      "draw-intro"
    );


    document.body.classList.add(
      "draw-drawing"
    );



    this.paper.start();


    this.paper.reset();


    this.paper.setInteractionEnabled(
      true
    );


    this.paper.releaseHandDrawing();


    this.paper.setMode(
      "rotate"
    );

  }



  // ====================================================
  // TIMERS
  // ====================================================

  clearTimers() {

    if (
      this.paperExitTimer
    ) {

      clearTimeout(
        this.paperExitTimer
      );

    }


    if (
      this.videoTransitionTimer
    ) {

      clearTimeout(
        this.videoTransitionTimer
      );

    }


    if (
      this.textTimer
    ) {

      clearTimeout(
        this.textTimer
      );

    }



    this.paperExitTimer =
      null;


    this.videoTransitionTimer =
      null;


    this.textTimer =
      null;

  }



  // ====================================================
  // CAMERA RESET
  // ====================================================

  resetCamera() {

    this.state.targetZoom =
      1;


    this.state.currentZoom =
      1;


    this.state.currentPanX =
      0;


    this.state.currentPanY =
      0;


    this.state.handPanActive =
      false;


    this.state.handPanX =
      0;


    this.state.handPanY =
      0;

  }



  // ====================================================
  // MODE UI
  // ====================================================

  updateModeUI(
    mode
  ) {

    this.rotateButton.classList.remove(
      "active"
    );



    if (
      mode === "rotate"
    ) {

      this.rotateButton.classList.add(
        "active"
      );


      this.modeIndicator.textContent =
        "ROTATE PAPER · CLICK LINED BACK TO WRITE";


      return;

    }



    if (
      mode === "pen"
    ) {

      this.modeIndicator.textContent =
        "NORMAL PEN · MOUSE DRAG OR 5-FINGER HOLD · 2/3 FINGERS CHANGE SIZE";


      return;

    }



    if (
      mode === "silk"
    ) {

      this.modeIndicator.textContent =
        "SILK BRUSH · MOUSE HOLD OR 5-FINGER HOLD + MOVE";


      return;

    }



    if (
      mode === "write"
    ) {

      this.modeIndicator.textContent =
        "WRITE ON LINED BACK";


      return;

    }

  }



  // ====================================================
  // FINISH
  // ====================================================

  finishDrawing() {

    if (

      !this.state.drawRunning

      ||

      this.phase !== "drawing"

    ) {

      return;

    }


    this.phase =
      "finishing";



    this.finishedArtwork =

      this.paper.exportArtwork();



    this.paper.releaseHandDrawing();


    this.paper.setInteractionEnabled(
      false
    );



    document.body.classList.add(
      "draw-finishing"
    );



    this.paperExitTimer =

      window.setTimeout(

        () => {

          this.paperExitTimer =
            null;



          if (

            !this.state.drawRunning

            ||

            this.phase !== "finishing"

          ) {

            return;

          }



          this.paper.stop();



          document.body.classList.remove(
            "draw-drawing"
          );


          document.body.classList.remove(
            "draw-finishing"
          );


          document.body.classList.add(
            "draw-video1-phase"
          );



          this.phase =
            "video1";


          this.state.drawCameraActive =
            false;


          this.resetCamera();


          this.playVideo1();

        },

        820

      );

  }



  // ====================================================
  // VIDEO 1
  // ====================================================

  playVideo1() {

    try {

      this.video1.currentTime =
        0;


      this.video1.loop =
        false;



      const playPromise =

        this.video1.play();



      if (

        playPromise

        &&

        typeof playPromise.catch === "function"

      ) {

        playPromise.catch(

          (
            error
          ) => {

            console.warn(

              "DRAW VIDEO 1 COULD NOT PLAY:",

              error

            );

          }

        );

      }

    }

    catch (
      error
    ) {

      console.warn(

        "DRAW VIDEO 1 FAILED:",

        error

      );

    }

  }



  // ====================================================
  // VIDEO 1 → VIDEO 2
  // ====================================================

  beginVideoTransition() {

    if (

      !this.state.drawRunning

      ||

      this.phase !== "video1"

    ) {

      return;

    }


    this.phase =
      "transition";


    document.body.classList.add(
      "draw-video1-fading"
    );



    this.videoTransitionTimer =

      window.setTimeout(

        () => {

          this.videoTransitionTimer =
            null;



          if (

            !this.state.drawRunning

            ||

            this.phase !== "transition"

          ) {

            return;

          }


          this.startVideo2();

        },

        620

      );

  }



  // ====================================================
  // VIDEO 2
  // ====================================================

  startVideo2() {

    this.phase =
      "video2";



    try {

      this.video1.pause();

    }

    catch (
      error
    ) {

      void error;

    }



    document.body.classList.remove(
      "draw-video1-phase"
    );


    document.body.classList.remove(
      "draw-video1-fading"
    );


    document.body.classList.add(
      "draw-video2-phase"
    );



    // ==================================================
    // NORMAL GLOBAL CAMERA RETURNS HERE.
    // ==================================================

    this.state.drawCameraActive =
      true;



    this.resetCamera();



    try {

      this.video2.currentTime =
        0;


      this.video2.loop =
        true;



      const playPromise =

        this.video2.play();



      if (

        playPromise

        &&

        typeof playPromise.catch === "function"

      ) {

        playPromise.catch(

          (
            error
          ) => {

            console.warn(

              "DRAW VIDEO 2 COULD NOT PLAY:",

              error

            );

          }

        );

      }

    }

    catch (
      error
    ) {

      console.warn(

        "DRAW VIDEO 2 FAILED:",

        error

      );

    }



    requestAnimationFrame(

      () => {

        requestAnimationFrame(

          () => {

            if (

              !this.state.drawRunning

              ||

              this.phase !== "video2"

            ) {

              return;

            }


            document.body.classList.add(
              "draw-video2-visible"
            );

          }

        );

      }

    );



    this.textTimer =

      window.setTimeout(

        () => {

          this.textTimer =
            null;



          if (

            !this.state.drawRunning

            ||

            this.phase !== "video2"

          ) {

            return;

          }



          this.textBox.classList.remove(
            "is-intro"
          );


          this.textBox.src =
            "assets/Draw_text1.png";


          this.textBox.classList.add(
            "is-visible"
          );

        },

        700

      );

  }



  // ====================================================
  // HAND POINTER CLICK
  //
  // Lets the 1-finger hand click enter WRITE mode
  // when pointing at the lined BACK.
  // ====================================================

  handleHandClick(
    x,
    y
  ) {

    if (
      this.phase !== "drawing"
    ) {

      return false;

    }



    return (

      this.paper.handleHandClick(

        x,

        y

      )

      === true

    );

  }



  // ====================================================
  // UPDATE
  // ====================================================

  update(
    now
  ) {

    if (
      this.phase === "drawing"
    ) {

      const hand =

        this.getHandState
          ?.();



      this.paper.updateHandGesture(

        hand,

        now

      );


      this.updateDrawGestureUI(
        hand
      );


      return;

    }



    this.paper.releaseHandDrawing();

  }



  // ====================================================
  // DRAW-SPECIFIC HAND LABELS
  // ====================================================

  updateDrawGestureUI(
    hand
  ) {

    if (

      !hand

      ||

      !hand.active

      ||

      !hand.visible

    ) {

      return;

    }



    const status =

      document.getElementById(
        "gesture-status"
      );


    const cursorLabel =

      document.getElementById(
        "cursor-label"
      );



    const fingers =

      Number(
        hand.fingerCount
      )

      ||

      0;



    let statusText =
      "";


    let labelText =
      "";



    if (
      fingers >= 5
    ) {

      statusText =
        "OPEN HAND · HOLD TO DRAW";


      labelText =
        "DRAW";

    }


    else if (
      fingers === 3
    ) {

      statusText =
        "3 FINGERS · BRUSH BIGGER";


      labelText =
        "BRUSH +";

    }


    else if (
      fingers === 2
    ) {

      statusText =
        "2 FINGERS · BRUSH SMALLER";


      labelText =
        "BRUSH -";

    }


    else if (
      fingers === 1
    ) {

      statusText =
        "INDEX · POINTER";


      labelText =

        hand.pinching

        ?

        "CLICK"

        :

        "POINTER";

    }


    else {

      statusText =
        `${fingers} FINGERS · RELEASE`;


      labelText =
        "RELEASE";

    }



    if (
      status
    ) {

      status.textContent =
        statusText;


      status.classList.remove(

        "detecting",

        "error"

      );


      status.classList.add(
        "ready"
      );

    }



    if (
      cursorLabel
    ) {

      cursorLabel.textContent =
        labelText;

    }

  }



  // ====================================================
  // EXIT
  // ====================================================

  async exit() {

    this.state.drawRunning =
      false;


    this.state.drawCameraActive =
      false;


    this.clearTimers();


    this.paper.stop();



    try {

      this.video1.pause();

      this.video1.currentTime =
        0;

    }

    catch (
      error
    ) {

      void error;

    }



    try {

      this.video2.pause();

      this.video2.currentTime =
        0;

    }

    catch (
      error
    ) {

      void error;

    }



    this.textBox.classList.remove(
      "is-visible"
    );


    this.textBox.classList.remove(
      "is-intro"
    );



    document.body.classList.remove(
      "draw-active"
    );


    document.body.classList.remove(
      "draw-intro"
    );


    document.body.classList.remove(
      "draw-drawing"
    );


    document.body.classList.remove(
      "draw-finishing"
    );


    document.body.classList.remove(
      "draw-video1-phase"
    );


    document.body.classList.remove(
      "draw-video1-fading"
    );


    document.body.classList.remove(
      "draw-video2-phase"
    );


    document.body.classList.remove(
      "draw-video2-visible"
    );



    this.resetCamera();


    this.phase =
      "idle";

  }

}



// ======================================================
// DRAW PAPER
// ======================================================

class DrawPaper {

  constructor(
    containerId,
    options = {}
  ) {

    this.containerId =
      containerId;


    this.onModeChange =
      options.onModeChange
      ||
      (() => {});


    this.instance =
      null;


    this.api =
      null;


    this.started =
      false;


    this.interactionEnabled =
      true;

  }



  start() {

    if (
      this.started
    ) {

      return;

    }



    if (
      !window.p5
    ) {

      console.error(
        "DRAW PAPER: p5.js is not loaded."
      );


      return;

    }



    const container =

      document.getElementById(
        this.containerId
      );



    if (
      !container
    ) {

      console.error(

        "DRAW PAPER MOUNT NOT FOUND:",

        this.containerId

      );


      return;

    }



    this.started =
      true;



    const controller =
      this;



    this.instance =

      new window.p5(

        (
          p
        ) => {


          // =================================================
          // RENDER SIZE
          // =================================================

          const RENDER_WIDTH =
            1280;


          const RENDER_HEIGHT =
            720;



          // =================================================
          // PAPER POSITION
          //
          // x negative = left
          // x positive = right
          //
          // y negative = up
          // y positive = down
          // =================================================

          const PAPER = {

            width:
              450,


            height:
              315,


            x:
              -18,


            y:
              -10,


            z:
              0,


            thickness:
              4.2,


            textureScale:
              2

          };



          // =================================================
          // WARM BEIGE PAPER
          // =================================================

          const PAPER_COLOR = {

            red:
              240,


            green:
              226,


            blue:
              198

          };



          // =================================================
          // NORMAL PEN
          // =================================================

          const PEN = {

            size:
              7,


            minSize:
              2,


            maxSize:
              38,


            wheelStep:
              1.5,


            red:
              24,


            green:
              24,


            blue:
              24,


            alpha:
              255

          };



          // =================================================
          // RED SILK
          // =================================================

          const SILK = {

            particleCount:
              260,


            threshold:
              2,


            speedFactor:
              1.05,


            drag:
              0.01,


            lineWeight:
              0.72,


            red:
              224,


            green:
              35,


            blue:
              30,


            alpha:
              20,


            startSpread:
              75,


            cursorFollow:
              0.50

          };



          // =================================================
          // WRITING
          // =================================================

          const WRITING = {

            fontSize:
              25,


            marginLeft:
              78,


            marginRight:
              58,


            firstBaseline:
              84,


            lineHeight:
              46

          };



          const TEXTURE_WIDTH =

            Math.round(

              PAPER.width

              *

              PAPER.textureScale

            );


          const TEXTURE_HEIGHT =

            Math.round(

              PAPER.height

              *

              PAPER.textureScale

            );



          const CAMERA_FOV =
            Math.PI / 3;



          let frontTexture =
            null;


          let backTexture =
            null;



          let mode =
            "rotate";



          let rotationXValue =
            -0.12;


          let rotationYValue =
            0.20;



          let rotating =
            false;


          let previousPointerX =
            0;


          let previousPointerY =
            0;


          let pointerDown =
            false;


          let activePointerId =
            null;


          let pointerStartX =
            0;


          let pointerStartY =
            0;


          let pointerDragged =
            false;


          let pressStartedOnBack =
            false;



          let penDrawing =
            false;


          let previousPenX =
            0;


          let previousPenY =
            0;



          let penCursor =
            null;


          // =================================================
          // MOUSE PEN CURSOR STATE
          //
          // Keeps the normal pen-size circle visible for
          // mouse input too, not only hand tracking.
          // =================================================

          let mousePointerInside =
            false;


          let mousePointerKnown =
            false;


          let lastMouseClientX =
            0;


          let lastMouseClientY =
            0;



          // =================================================
          // DRAW-ONLY HAND STATES
          // =================================================

          let handPenDrawing =
            false;


          let handSilkDrawing =
            false;


          let previousHandPenX =
            0;


          let previousHandPenY =
            0;


          let lastHandBrushAdjustTime =
            0;



          const HAND_BRUSH_ADJUST_INTERVAL =
            150;


          const HAND_BRUSH_STEP =
            2.0;



          const silkParticles =
            [];


          let silkDrawing =
            false;


          let latestPointerX =
            0;


          let latestPointerY =
            0;


          let silkTargetX =
            0;


          let silkTargetY =
            0;


          let silkSmoothX =
            0;


          let silkSmoothY =
            0;



          let rawText =
            "";


          let textLines = [
            ""
          ];



          // =================================================
          // CAMERA
          // =================================================

          function configureCamera() {

            p.perspective(

              CAMERA_FOV,

              p.width
              /
              p.height,

              0.1,

              10000

            );



            const cameraZ =

              (
                p.height
                /
                2
              )

              /

              Math.tan(

                CAMERA_FOV
                /
                2

              );



            p.camera(

              0,
              0,
              cameraZ,

              0,
              0,
              0,

              0,
              1,
              0

            );

          }



          function refresh() {

            if (
              !controller.started
            ) {

              return;

            }


            p.redraw();

          }



          function clamp(
            value,
            minimum,
            maximum
          ) {

            return Math.max(

              minimum,

              Math.min(

                maximum,

                value

              )

            );

          }



          // =================================================
          // PEN CIRCLE CURSOR
          // =================================================

          function createPenCursor() {

            if (
              penCursor
            ) {

              return;

            }



            penCursor =

              document.createElement(
                "div"
              );



            penCursor.className =
              "draw-pen-size-cursor";


            penCursor.style.position =
              "absolute";


            penCursor.style.left =
              "0";


            penCursor.style.top =
              "0";


            penCursor.style.zIndex =
              "100";


            penCursor.style.border =
              "2px solid rgba(30, 22, 16, 0.92)";


            penCursor.style.borderRadius =
              "50%";


            penCursor.style.background =
              "rgba(255, 255, 255, 0.08)";


            penCursor.style.pointerEvents =
              "none";


            penCursor.style.display =
              "none";


            penCursor.style.transform =
              "translate(-50%, -50%)";


            penCursor.style.boxSizing =
              "border-box";


            penCursor.style.willChange =
              "transform, width, height";



            container.appendChild(
              penCursor
            );


            updatePenCursorSize();

          }



          function updatePenCursorSize() {

            if (
              !penCursor
            ) {

              return;

            }


            const visualSize =

              Math.max(

                6,

                PEN.size

                *

                PAPER.textureScale

              );



            penCursor.style.width =
              `${visualSize}px`;


            penCursor.style.height =
              `${visualSize}px`;

          }



          function hidePenCursor() {

            if (
              penCursor
            ) {

              penCursor.style.display =
                "none";

            }

          }



          function rememberMousePointer(
            event
          ) {

            if (

              event?.pointerType

              &&

              event.pointerType !== "mouse"

            ) {

              return;

            }



            if (

              !Number.isFinite(
                event?.clientX
              )

              ||

              !Number.isFinite(
                event?.clientY
              )

            ) {

              return;

            }



            mousePointerInside =
              true;


            mousePointerKnown =
              true;


            lastMouseClientX =
              event.clientX;


            lastMouseClientY =
              event.clientY;

          }



          function restorePenCursorFromMouse() {

            if (

              !mousePointerInside

              ||

              !mousePointerKnown

              ||

              mode !== "pen"

              ||

              !controller.interactionEnabled

            ) {

              return false;

            }



            updatePenCursorFromEvent(

              {

                clientX:
                  lastMouseClientX,

                clientY:
                  lastMouseClientY

              }

            );



            return (

              penCursor

              &&

              penCursor.style.display === "block"

            );

          }



          function updatePenCursorFromEvent(
            event,
            canvasPoint = null
          ) {

            if (

              !penCursor

              ||

              !controller.interactionEnabled

              ||

              mode !== "pen"

            ) {

              hidePenCursor();


              return;

            }



            const point =

              canvasPoint

              ||

              eventToCanvasPoint(
                event
              );



            if (
              !point
            ) {

              hidePenCursor();


              return;

            }



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            if (

              !hit

              ||

              hit.face !== "front"

            ) {

              hidePenCursor();


              return;

            }



            const rect =

              container
                .getBoundingClientRect();



            if (

              rect.width <= 0

              ||

              rect.height <= 0

            ) {

              hidePenCursor();


              return;

            }



            const designX =

              (
                event.clientX
                -
                rect.left
              )

              /

              rect.width

              *

              2560;



            const designY =

              (
                event.clientY
                -
                rect.top
              )

              /

              rect.height

              *

              1440;



            penCursor.style.display =
              "block";


            penCursor.style.transform =

              `translate3d(
                ${designX}px,
                ${designY}px,
                0
              )
              translate(
                -50%,
                -50%
              )`;

          }



          // =================================================
          // PAPER GRAIN
          // =================================================

          function addPaperGrain(
            graphics
          ) {

            graphics.noStroke();



            for (
              let i = 0;
              i < 900;
              i++
            ) {

              const x =

                p.random(
                  TEXTURE_WIDTH
                );


              const y =

                p.random(
                  TEXTURE_HEIGHT
                );


              const variation =

                p.random(
                  -15,
                  12
                );



              graphics.fill(

                clamp(
                  PAPER_COLOR.red + variation,
                  0,
                  255
                ),

                clamp(
                  PAPER_COLOR.green + variation,
                  0,
                  255
                ),

                clamp(
                  PAPER_COLOR.blue + variation,
                  0,
                  255
                ),

                14

              );



              graphics.circle(

                x,

                y,

                p.random(
                  1,
                  2.2
                )

              );

            }

          }



          // =================================================
          // FRONT
          // =================================================

          function drawFrontBase() {

            if (
              !frontTexture
            ) {

              return;

            }


            frontTexture.background(

              PAPER_COLOR.red,

              PAPER_COLOR.green,

              PAPER_COLOR.blue

            );


            addPaperGrain(
              frontTexture
            );

          }



          // =================================================
          // LINED BACK
          //
          // NO VERTICAL RED LINE.
          // =================================================

          function drawBackBase() {

            if (
              !backTexture
            ) {

              return;

            }



            backTexture.background(

              PAPER_COLOR.red,

              PAPER_COLOR.green,

              PAPER_COLOR.blue

            );


            addPaperGrain(
              backTexture
            );



            backTexture.push();


            backTexture.stroke(

              105,

              137,

              155,

              86

            );


            backTexture.strokeWeight(
              1.5
            );



            for (

              let y =
                WRITING.firstBaseline
                +
                8;

              y <
                TEXTURE_HEIGHT
                -
                35;

              y +=
                WRITING.lineHeight

            ) {

              backTexture.line(

                38,

                y,

                TEXTURE_WIDTH
                -
                38,

                y

              );

            }



            backTexture.pop();

          }



          // =================================================
          // TEXT WRAPPING
          // =================================================

          function getAvailableTextWidth() {

            return (

              TEXTURE_WIDTH

              -

              WRITING.marginLeft

              -

              WRITING.marginRight

            );

          }



          function getMaximumTextLines() {

            return (

              Math.floor(

                (
                  TEXTURE_HEIGHT
                  -
                  WRITING.firstBaseline
                  -
                  30
                )

                /

                WRITING.lineHeight

              )

              +

              1

            );

          }



          function measureText(
            text
          ) {

            backTexture.push();


            backTexture.textFont(
              "Arial"
            );


            backTexture.textSize(
              WRITING.fontSize
            );


            const width =

              backTexture.textWidth(
                text
              );


            backTexture.pop();


            return width;

          }



          function breakLongWord(
            word,
            maximumWidth
          ) {

            const pieces =
              [];


            let current =
              "";



            for (
              const character
              of
              word
            ) {

              const candidate =

                current
                +
                character;



              if (

                current

                &&

                measureText(
                  candidate
                )

                >

                maximumWidth

              ) {

                pieces.push(
                  current
                );


                current =
                  character;

              }

              else {

                current =
                  candidate;

              }

            }



            if (
              current
            ) {

              pieces.push(
                current
              );

            }


            return pieces;

          }



          function reflowText() {

            const maximumWidth =
              getAvailableTextWidth();


            const maximumLines =
              getMaximumTextLines();


            const newLines =
              [];


            const paragraphs =

              rawText.split(
                "\n"
              );



            for (

              let paragraphIndex = 0;

              paragraphIndex < paragraphs.length;

              paragraphIndex++

            ) {

              if (
                newLines.length >= maximumLines
              ) {

                break;

              }



              const paragraph =

                paragraphs[
                  paragraphIndex
                ];



              if (
                paragraph.length === 0
              ) {

                newLines.push(
                  ""
                );


                continue;

              }



              const words =

                paragraph.match(
                  /\S+/g
                )

                ||

                [];



              let currentLine =
                "";



              for (
                const originalWord
                of
                words
              ) {

                if (
                  newLines.length >= maximumLines
                ) {

                  break;

                }



                if (

                  measureText(
                    originalWord
                  )

                  <=

                  maximumWidth

                ) {

                  const candidate =

                    currentLine

                    ?

                    `${currentLine} ${originalWord}`

                    :

                    originalWord;



                  if (

                    measureText(
                      candidate
                    )

                    <=

                    maximumWidth

                  ) {

                    currentLine =
                      candidate;

                  }

                  else {

                    if (
                      currentLine
                    ) {

                      newLines.push(
                        currentLine
                      );


                      if (
                        newLines.length >= maximumLines
                      ) {

                        currentLine =
                          "";


                        break;

                      }

                    }


                    currentLine =
                      originalWord;

                  }


                  continue;

                }



                if (
                  currentLine
                ) {

                  newLines.push(
                    currentLine
                  );


                  currentLine =
                    "";


                  if (
                    newLines.length >= maximumLines
                  ) {

                    break;

                  }

                }



                const pieces =

                  breakLongWord(

                    originalWord,

                    maximumWidth

                  );



                for (

                  let pieceIndex = 0;

                  pieceIndex < pieces.length;

                  pieceIndex++

                ) {

                  const isLastPiece =

                    pieceIndex
                    ===
                    pieces.length - 1;



                  if (
                    isLastPiece
                  ) {

                    currentLine =
                      pieces[pieceIndex];

                  }

                  else {

                    newLines.push(
                      pieces[pieceIndex]
                    );


                    if (
                      newLines.length >= maximumLines
                    ) {

                      currentLine =
                        "";


                      break;

                    }

                  }

                }

              }



              if (

                currentLine

                &&

                newLines.length < maximumLines

              ) {

                newLines.push(
                  currentLine
                );

              }

            }



            if (
              newLines.length === 0
            ) {

              newLines.push(
                ""
              );

            }



            textLines =

              newLines.slice(

                0,

                maximumLines

              );

          }



          function redrawBackText() {

            reflowText();


            drawBackBase();



            backTexture.push();


            backTexture.fill(
              35,
              31,
              27
            );


            backTexture.noStroke();


            backTexture.textFont(
              "Arial"
            );


            backTexture.textSize(
              WRITING.fontSize
            );


            backTexture.textAlign(
              p.LEFT,
              p.BASELINE
            );



            for (
              let i = 0;
              i < textLines.length;
              i++
            ) {

              const y =

                WRITING.firstBaseline

                +

                i
                *
                WRITING.lineHeight;



              if (

                y

                >

                TEXTURE_HEIGHT
                -
                30

              ) {

                break;

              }



              backTexture.text(

                textLines[i],

                WRITING.marginLeft,

                y

              );

            }



            backTexture.pop();

          }



          function clearFront() {

            drawFrontBase();

            refresh();

          }



          function clearBack() {

            rawText =
              "";


            textLines = [
              ""
            ];


            redrawBackText();

            refresh();

          }



          // =================================================
          // MODE
          // =================================================

          function setMode(
            newMode
          ) {

            mode =
              newMode;


            penDrawing =
              false;


            silkDrawing =
              false;


            handPenDrawing =
              false;


            handSilkDrawing =
              false;


            rotating =
              false;


            pointerDown =
              false;



            p.noLoop();


            controller.onModeChange(
              mode
            );



            if (
              mode !== "pen"
            ) {

              hidePenCursor();

            }


            updateCanvasCursor();


            if (
              mode === "pen"
            ) {

              restorePenCursorFromMouse();

            }


            refresh();

          }



          function resetPaper() {

            rotationXValue =
              -0.12;


            rotationYValue =
              0.20;


            setMode(
              "rotate"
            );

          }



          function reset() {

            rotationXValue =
              -0.12;


            rotationYValue =
              0.20;


            rawText =
              "";


            textLines = [
              ""
            ];


            PEN.size =
              7;


            lastHandBrushAdjustTime =
              0;


            releaseHandDrawing();


            updatePenCursorSize();


            drawFrontBase();


            redrawBackText();


            setMode(
              "rotate"
            );


            refresh();

          }



          // =================================================
          // DRAW PAPER
          // =================================================

          function drawPaper() {

            // THIN BEIGE EDGE

            p.push();


            p.noStroke();


            p.fill(
              198,
              184,
              154
            );


            p.box(

              PAPER.width,

              PAPER.height,

              PAPER.thickness

            );


            p.pop();



            // FRONT

            p.push();


            p.translate(

              0,

              0,

              PAPER.thickness
              /
              2

              +

              0.55

            );


            p.noStroke();


            p.texture(
              frontTexture
            );


            p.plane(

              PAPER.width,

              PAPER.height

            );


            p.pop();



            // BACK

            p.push();


            p.translate(

              0,

              0,

              -PAPER.thickness
              /
              2

              -

              0.55

            );


            p.rotateY(
              p.PI
            );


            p.noStroke();


            p.texture(
              backTexture
            );


            p.plane(

              PAPER.width,

              PAPER.height

            );


            p.pop();

          }



          // =================================================
          // CLIENT → P5 CANVAS POSITION
          // =================================================

          function clientToCanvasPoint(
            clientX,
            clientY
          ) {

            if (
              !p.canvas
            ) {

              return null;

            }



            const rect =

              p.canvas
                .getBoundingClientRect();



            if (

              rect.width <= 0

              ||

              rect.height <= 0

            ) {

              return null;

            }



            return {

              x:

                (
                  clientX
                  -
                  rect.left
                )

                /

                rect.width

                *

                p.width,


              y:

                (
                  clientY
                  -
                  rect.top
                )

                /

                rect.height

                *

                p.height

            };

          }



          function eventToCanvasPoint(
            event
          ) {

            return clientToCanvasPoint(

              event.clientX,

              event.clientY

            );

          }



          // =================================================
          // PEN HELPERS
          // =================================================

          function drawPenDot(
            x,
            y
          ) {

            frontTexture.push();


            frontTexture.noStroke();


            frontTexture.fill(

              PEN.red,

              PEN.green,

              PEN.blue,

              PEN.alpha

            );


            frontTexture.circle(

              x,

              y,

              PEN.size

              *

              PAPER.textureScale

            );


            frontTexture.pop();


            refresh();

          }



          function drawPenSegment(

            fromX,

            fromY,

            toX,

            toY

          ) {

            frontTexture.push();


            frontTexture.stroke(

              PEN.red,

              PEN.green,

              PEN.blue,

              PEN.alpha

            );


            frontTexture.strokeWeight(

              PEN.size

              *

              PAPER.textureScale

            );


            frontTexture.strokeCap(
              p.ROUND
            );


            frontTexture.line(

              fromX,

              fromY,

              toX,

              toY

            );


            frontTexture.pop();


            refresh();

          }



          // =================================================
          // RELEASE HAND DRAW
          // =================================================

          function releaseHandDrawing() {

            const hadSilk =
              handSilkDrawing;


            handPenDrawing =
              false;


            handSilkDrawing =
              false;



            if (

              hadSilk

              &&

              !silkDrawing

            ) {

              p.noLoop();

              refresh();

            }

          }



          // =================================================
          // PEN CURSOR FROM HAND
          // =================================================

          function updatePenCursorFromHand(
            hand
          ) {

            if (

              !hand

              ||

              !hand.visible

              ||

              mode !== "pen"

            ) {

              return;

            }



            updatePenCursorFromEvent(

              {

                clientX:
                  hand.x,

                clientY:
                  hand.y

              }

            );

          }



          // =================================================
          // ONE-FINGER CLICK ON BACK → WRITE
          // =================================================

          function handleHandClick(
            clientX,
            clientY
          ) {

            if (
              !controller.interactionEnabled
            ) {

              return false;

            }



            const point =

              clientToCanvasPoint(

                clientX,

                clientY

              );



            if (
              !point
            ) {

              return false;

            }



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            if (

              !hit

              ||

              hit.face !== "back"

            ) {

              return false;

            }



            setMode(
              "write"
            );


            p.canvas.focus();


            return true;

          }



          // =================================================
          // DRAW-SPECIFIC HAND GESTURES
          //
          // 5 fingers = hold mouse / draw
          // 0/other    = release
          // 2 fingers = smaller pen
          // 3 fingers = bigger pen
          //
          // Only runs during paper phase.
          // =================================================

          function updateHandGesture(
            hand,
            now
          ) {

            if (

              !controller.interactionEnabled

              ||

              !hand

              ||

              !hand.active

              ||

              !hand.visible

            ) {

              releaseHandDrawing();


              // =============================================
              // NO ACTIVE HAND
              //
              // Keep the pen-size circle following the mouse
              // when the mouse is currently over the paper.
              // =============================================

              if (
                !restorePenCursorFromMouse()
              ) {

                hidePenCursor();

              }


              return;

            }



            updatePenCursorFromHand(
              hand
            );



            const fingerCount =

              Number(
                hand.fingerCount
              )

              ||

              0;



            // =============================================
            // 2 FINGERS = SMALLER PEN
            // =============================================

            if (
              fingerCount === 2
            ) {

              releaseHandDrawing();



              if (

                mode === "pen"

                &&

                now
                -
                lastHandBrushAdjustTime

                >=

                HAND_BRUSH_ADJUST_INTERVAL

              ) {

                lastHandBrushAdjustTime =
                  now;


                PEN.size -=
                  HAND_BRUSH_STEP;


                PEN.size =

                  clamp(

                    PEN.size,

                    PEN.minSize,

                    PEN.maxSize

                  );


                updatePenCursorSize();


                updatePenCursorFromHand(
                  hand
                );

              }


              return;

            }



            // =============================================
            // 3 FINGERS = BIGGER PEN
            // =============================================

            if (
              fingerCount === 3
            ) {

              releaseHandDrawing();



              if (

                mode === "pen"

                &&

                now
                -
                lastHandBrushAdjustTime

                >=

                HAND_BRUSH_ADJUST_INTERVAL

              ) {

                lastHandBrushAdjustTime =
                  now;


                PEN.size +=
                  HAND_BRUSH_STEP;


                PEN.size =

                  clamp(

                    PEN.size,

                    PEN.minSize,

                    PEN.maxSize

                  );


                updatePenCursorSize();


                updatePenCursorFromHand(
                  hand
                );

              }


              return;

            }



            // =============================================
            // LESS THAN 5 = NOT DRAWING
            // =============================================

            if (
              fingerCount < 5
            ) {

              releaseHandDrawing();


              return;

            }



            // =============================================
            // 5 FINGERS = HOLD LEFT MOUSE
            // =============================================

            const point =

              clientToCanvasPoint(

                hand.x,

                hand.y

              );



            if (
              !point
            ) {

              releaseHandDrawing();


              return;

            }



            latestPointerX =
              point.x;


            latestPointerY =
              point.y;



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            if (

              !hit

              ||

              hit.face !== "front"

            ) {

              releaseHandDrawing();


              return;

            }



            // =============================================
            // PEN
            // =============================================

            if (
              mode === "pen"
            ) {

              handSilkDrawing =
                false;



              if (
                !handPenDrawing
              ) {

                handPenDrawing =
                  true;


                previousHandPenX =
                  hit.x;


                previousHandPenY =
                  hit.y;


                drawPenDot(

                  hit.x,

                  hit.y

                );


                return;

              }



              drawPenSegment(

                previousHandPenX,

                previousHandPenY,

                hit.x,

                hit.y

              );


              previousHandPenX =
                hit.x;


              previousHandPenY =
                hit.y;


              return;

            }



            // =============================================
            // SILK
            // =============================================

            if (
              mode === "silk"
            ) {

              handPenDrawing =
                false;



              if (
                !handSilkDrawing
              ) {

                handSilkDrawing =
                  true;


                silkTargetX =
                  hit.x;


                silkTargetY =
                  hit.y;


                silkSmoothX =
                  hit.x;


                silkSmoothY =
                  hit.y;



                for (
                  const particle
                  of
                  silkParticles
                ) {

                  particle.beginStroke(

                    hit.x,

                    hit.y

                  );

                }



                p.loop();


                return;

              }



              p.loop();


              return;

            }



            releaseHandDrawing();

          }



          // =================================================
          // SCREEN RAY
          // =================================================

          function getLocalRay(
            screenX,
            screenY
          ) {

            const normalizedX =

              (
                screenX
                /
                p.width
              )

              *
              2

              -
              1;



            const normalizedY =

              (
                screenY
                /
                p.height
              )

              *
              2

              -
              1;



            const cameraZ =

              (
                p.height
                /
                2
              )

              /

              Math.tan(

                CAMERA_FOV
                /
                2

              );



            const aspect =

              p.width
              /
              p.height;



            const rayDirection =

              p.createVector(

                normalizedX

                *

                aspect

                *

                Math.tan(

                  CAMERA_FOV
                  /
                  2

                ),


                normalizedY

                *

                Math.tan(

                  CAMERA_FOV
                  /
                  2

                ),


                -1

              );



            rayDirection.normalize();



            const rayOrigin =

              p.createVector(

                0,

                0,

                cameraZ

              );



            const translatedOrigin =

              p.createVector(

                rayOrigin.x
                -
                PAPER.x,

                rayOrigin.y
                -
                PAPER.y,

                rayOrigin.z
                -
                PAPER.z

              );



            return {

              origin:

                inversePaperRotation(

                  translatedOrigin,

                  rotationXValue,

                  rotationYValue

                ),


              direction:

                inversePaperRotation(

                  rayDirection,

                  rotationXValue,

                  rotationYValue

                )

            };

          }



          function intersectPaperFace(
            ray,
            face
          ) {

            const planeZ =

              face === "front"

              ?

              PAPER.thickness
              /
              2

              :

              -PAPER.thickness
              /
              2;



            if (

              Math.abs(
                ray.direction.z
              )

              <

              0.000001

            ) {

              return null;

            }



            const t =

              (
                planeZ
                -
                ray.origin.z
              )

              /

              ray.direction.z;



            if (
              t <= 0
            ) {

              return null;

            }



            const hitX =

              ray.origin.x

              +

              ray.direction.x
              *
              t;



            const hitY =

              ray.origin.y

              +

              ray.direction.y
              *
              t;



            if (

              hitX
              <
              -PAPER.width
              /
              2

              ||

              hitX
              >
              PAPER.width
              /
              2

              ||

              hitY
              <
              -PAPER.height
              /
              2

              ||

              hitY
              >
              PAPER.height
              /
              2

            ) {

              return null;

            }



            let textureX =

              p.map(

                hitX,

                -PAPER.width
                /
                2,

                PAPER.width
                /
                2,

                0,

                TEXTURE_WIDTH

              );



            const textureY =

              p.map(

                hitY,

                -PAPER.height
                /
                2,

                PAPER.height
                /
                2,

                0,

                TEXTURE_HEIGHT

              );



            if (
              face === "back"
            ) {

              textureX =

                TEXTURE_WIDTH

                -

                textureX;

            }



            return {

              face,

              t,

              x:
                textureX,

              y:
                textureY

            };

          }



          function screenToVisiblePaperHit(
            screenX,
            screenY
          ) {

            const ray =

              getLocalRay(

                screenX,

                screenY

              );



            const front =

              intersectPaperFace(

                ray,

                "front"

              );



            const back =

              intersectPaperFace(

                ray,

                "back"

              );



            if (

              !front

              &&

              !back

            ) {

              return null;

            }



            if (
              !front
            ) {

              return back;

            }



            if (
              !back
            ) {

              return front;

            }



            return (

              front.t <= back.t

              ?

              front

              :

              back

            );

          }



          function inversePaperRotation(

            vector,

            rotationX,

            rotationY

          ) {

            const v =
              vector.copy();



            const cosineX =

              Math.cos(
                -rotationX
              );


            const sineX =

              Math.sin(
                -rotationX
              );



            let rotatedY =

              v.y
              *
              cosineX

              -

              v.z
              *
              sineX;



            let rotatedZ =

              v.y
              *
              sineX

              +

              v.z
              *
              cosineX;



            v.y =
              rotatedY;


            v.z =
              rotatedZ;



            const cosineY =

              Math.cos(
                -rotationY
              );


            const sineY =

              Math.sin(
                -rotationY
              );



            const rotatedX =

              v.x
              *
              cosineY

              +

              v.z
              *
              sineY;



            rotatedZ =

              -v.x
              *
              sineY

              +

              v.z
              *
              cosineY;



            v.x =
              rotatedX;


            v.z =
              rotatedZ;



            return v;

          }



          // =================================================
          // WRITING
          // =================================================

          function appendCharacter(
            character
          ) {

            rawText +=
              character;


            redrawBackText();


            refresh();

          }



          function addNewTextLine() {

            rawText +=
              "\n";


            redrawBackText();


            refresh();

          }



          function removeCharacter() {

            if (
              rawText.length === 0
            ) {

              return;

            }


            rawText =

              rawText.slice(
                0,
                -1
              );


            redrawBackText();


            refresh();

          }



          // =================================================
          // SILK PARTICLE
          // =================================================

          class SilkParticle {

            constructor() {

              this.x =
                0;


              this.y =
                0;


              this.previousX =
                0;


              this.previousY =
                0;


              this.velocityX =
                0;


              this.velocityY =
                0;


              this.weight =
                1;

            }



            beginStroke(
              x,
              y
            ) {

              const angle =

                p.random(
                  p.TWO_PI
                );


              const radius =

                p.random(

                  4,

                  SILK.startSpread

                );



              this.x =

                x

                +

                Math.cos(
                  angle
                )

                *

                radius;



              this.y =

                y

                +

                Math.sin(
                  angle
                )

                *

                radius;



              this.x =

                p.constrain(

                  this.x,

                  0,

                  TEXTURE_WIDTH

                );


              this.y =

                p.constrain(

                  this.y,

                  0,

                  TEXTURE_HEIGHT

                );



              this.previousX =
                this.x;


              this.previousY =
                this.y;



              this.velocityX =

                p.random(
                  -0.45,
                  0.45
                );


              this.velocityY =

                p.random(
                  -0.45,
                  0.45
                );



              this.weight =

                p.random(

                  1
                  /
                  SILK.threshold,

                  SILK.threshold

                );

            }



            update(
              targetX,
              targetY
            ) {

              this.velocityX /=
                SILK.speedFactor;


              this.velocityY /=
                SILK.speedFactor;



              this.velocityX +=

                SILK.drag

                *

                (
                  targetX
                  -
                  this.x
                )

                *

                this.weight;



              this.velocityY +=

                SILK.drag

                *

                (
                  targetY
                  -
                  this.y
                )

                *

                this.weight;



              this.x +=
                this.velocityX;


              this.y +=
                this.velocityY;



              this.x =

                p.constrain(

                  this.x,

                  0,

                  TEXTURE_WIDTH

                );


              this.y =

                p.constrain(

                  this.y,

                  0,

                  TEXTURE_HEIGHT

                );



              frontTexture.push();


              frontTexture.stroke(

                SILK.red,

                SILK.green,

                SILK.blue,

                SILK.alpha

              );


              frontTexture.strokeWeight(

                SILK.lineWeight

                *

                PAPER.textureScale

              );


              frontTexture.line(

                this.previousX,

                this.previousY,

                this.x,

                this.y

              );


              frontTexture.pop();



              this.previousX =
                this.x;


              this.previousY =
                this.y;

            }

          }



          // =================================================
          // CURSOR
          // =================================================

          function updateCanvasCursor(
            canvasPoint = null
          ) {

            if (
              !p.canvas
            ) {

              return;

            }



            if (
              !controller.interactionEnabled
            ) {

              p.canvas.style.cursor =
                "default";


              hidePenCursor();


              return;

            }



            let hit =
              null;



            if (
              canvasPoint
            ) {

              hit =

                screenToVisiblePaperHit(

                  canvasPoint.x,

                  canvasPoint.y

                );

            }



            if (

              hit

              &&

              hit.face === "back"

            ) {

              p.canvas.style.cursor =
                "text";


              hidePenCursor();


              return;

            }



            if (
              mode === "rotate"
            ) {

              p.canvas.style.cursor =

                rotating

                ?

                "grabbing"

                :

                "grab";


              hidePenCursor();


              return;

            }



            if (
              mode === "pen"
            ) {

              if (

                hit

                &&

                hit.face === "front"

              ) {

                p.canvas.style.cursor =
                  "none";

              }

              else {

                p.canvas.style.cursor =
                  "crosshair";

              }


              return;

            }



            if (
              mode === "silk"
            ) {

              p.canvas.style.cursor =
                "crosshair";


              hidePenCursor();


              return;

            }



            if (
              mode === "write"
            ) {

              p.canvas.style.cursor =
                "text";


              hidePenCursor();


              return;

            }



            p.canvas.style.cursor =
              "default";


            hidePenCursor();

          }



          // =================================================
          // POINTER DOWN
          // =================================================

          function handlePointerDown(
            event
          ) {

            rememberMousePointer(
              event
            );


            if (
              !controller.interactionEnabled
            ) {

              return;

            }



            const point =

              eventToCanvasPoint(
                event
              );



            if (
              !point
            ) {

              return;

            }



            event.preventDefault();



            try {

              p.canvas.setPointerCapture(
                event.pointerId
              );

            }

            catch (
              error
            ) {

              void error;

            }



            p.canvas.focus();



            pointerDown =
              true;


            activePointerId =
              event.pointerId;


            pointerStartX =
              point.x;


            pointerStartY =
              point.y;


            previousPointerX =
              point.x;


            previousPointerY =
              point.y;


            latestPointerX =
              point.x;


            latestPointerY =
              point.y;


            pointerDragged =
              false;



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            pressStartedOnBack =

              Boolean(

                hit

                &&

                hit.face === "back"

              );



            if (
              mode === "rotate"
            ) {

              rotating =
                true;


              updateCanvasCursor(
                point
              );


              return;

            }



            if (
              pressStartedOnBack
            ) {

              updateCanvasCursor(
                point
              );


              return;

            }



            if (

              !hit

              ||

              hit.face !== "front"

            ) {

              return;

            }



            if (
              mode === "pen"
            ) {

              penDrawing =
                true;


              previousPenX =
                hit.x;


              previousPenY =
                hit.y;


              drawPenDot(
                hit.x,
                hit.y
              );


              return;

            }



            if (
              mode === "silk"
            ) {

              silkDrawing =
                true;


              silkTargetX =
                hit.x;


              silkTargetY =
                hit.y;


              silkSmoothX =
                hit.x;


              silkSmoothY =
                hit.y;



              for (
                const particle
                of
                silkParticles
              ) {

                particle.beginStroke(

                  hit.x,

                  hit.y

                );

              }


              p.loop();

            }

          }



          // =================================================
          // POINTER MOVE
          // =================================================

          function handlePointerMove(
            event
          ) {

            rememberMousePointer(
              event
            );


            const point =

              eventToCanvasPoint(
                event
              );



            if (
              !point
            ) {

              hidePenCursor();


              return;

            }



            updateCanvasCursor(
              point
            );


            updatePenCursorFromEvent(
              event,
              point
            );



            latestPointerX =
              point.x;


            latestPointerY =
              point.y;



            if (

              !pointerDown

              ||

              activePointerId !== event.pointerId

            ) {

              return;

            }



            event.preventDefault();



            const totalMovement =

              Math.hypot(

                point.x
                -
                pointerStartX,

                point.y
                -
                pointerStartY

              );



            if (
              totalMovement > 5
            ) {

              pointerDragged =
                true;

            }



            if (

              mode === "rotate"

              &&

              rotating

            ) {

              const dx =

                point.x
                -
                previousPointerX;


              const dy =

                point.y
                -
                previousPointerY;



              rotationYValue +=

                dx

                *

                0.012;


              rotationXValue -=

                dy

                *

                0.012;



              rotationXValue =

                p.constrain(

                  rotationXValue,

                  -1.44,

                  1.44

                );



              previousPointerX =
                point.x;


              previousPointerY =
                point.y;


              refresh();


              return;

            }



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            if (

              !hit

              ||

              hit.face !== "front"

            ) {

              return;

            }



            if (

              mode === "pen"

              &&

              penDrawing

            ) {

              drawPenSegment(

                previousPenX,

                previousPenY,

                hit.x,

                hit.y

              );


              previousPenX =
                hit.x;


              previousPenY =
                hit.y;

            }

          }



          function handlePointerLeave(
            event
          ) {

            if (

              !event?.pointerType

              ||

              event.pointerType === "mouse"

            ) {

              mousePointerInside =
                false;

            }


            if (
              !pointerDown
            ) {

              hidePenCursor();

            }

          }



          // =================================================
          // POINTER UP
          // =================================================

          function handlePointerUp(
            event
          ) {

            if (

              activePointerId !== null

              &&

              event.pointerId !== activePointerId

            ) {

              return;

            }



            const point =

              eventToCanvasPoint(
                event
              );



            if (

              controller.interactionEnabled

              &&

              pressStartedOnBack

              &&

              !pointerDragged

            ) {

              setMode(
                "write"
              );


              p.canvas.focus();

            }



            pointerDown =
              false;


            activePointerId =
              null;


            rotating =
              false;


            penDrawing =
              false;


            silkDrawing =
              false;


            pressStartedOnBack =
              false;


            pointerDragged =
              false;



            p.noLoop();


            refresh();


            updateCanvasCursor(
              point
            );

          }



          // =================================================
          // WHEEL PEN SIZE
          // =================================================

          function handleWheel(
            event
          ) {

            if (

              !controller.interactionEnabled

              ||

              mode !== "pen"

            ) {

              return;

            }



            const point =

              eventToCanvasPoint(
                event
              );



            if (
              !point
            ) {

              return;

            }



            const hit =

              screenToVisiblePaperHit(

                point.x,

                point.y

              );



            if (

              !hit

              ||

              hit.face !== "front"

            ) {

              return;

            }



            event.preventDefault();

            event.stopPropagation();



            if (
              event.deltaY < 0
            ) {

              PEN.size +=
                PEN.wheelStep;

            }

            else {

              PEN.size -=
                PEN.wheelStep;

            }



            PEN.size =

              clamp(

                PEN.size,

                PEN.minSize,

                PEN.maxSize

              );



            updatePenCursorSize();


            updatePenCursorFromEvent(
              event,
              point
            );

          }



          // =================================================
          // KEYBOARD
          // =================================================

          function handleKeyDown(
            event
          ) {

            if (

              !controller.interactionEnabled

              ||

              mode !== "write"

            ) {

              return;

            }



            if (
              event.key === "Backspace"
            ) {

              event.preventDefault();


              removeCharacter();


              return;

            }



            if (
              event.key === "Enter"
            ) {

              event.preventDefault();


              addNewTextLine();


              return;

            }



            if (

              event.key.length === 1

              &&

              !event.ctrlKey

              &&

              !event.metaKey

              &&

              !event.altKey

            ) {

              event.preventDefault();


              appendCharacter(
                event.key
              );

            }

          }



          // =================================================
          // SETUP
          // =================================================

          p.setup = () => {

            const canvas =

              p.createCanvas(

                RENDER_WIDTH,

                RENDER_HEIGHT,

                p.WEBGL

              );



            canvas.parent(
              container
            );


            p.pixelDensity(
              1
            );


            p.frameRate(
              45
            );


            configureCamera();



            frontTexture =

              p.createGraphics(

                TEXTURE_WIDTH,

                TEXTURE_HEIGHT

              );


            backTexture =

              p.createGraphics(

                TEXTURE_WIDTH,

                TEXTURE_HEIGHT

              );



            frontTexture.pixelDensity(
              1
            );


            backTexture.pixelDensity(
              1
            );



            drawFrontBase();


            redrawBackText();



            for (
              let i = 0;
              i < SILK.particleCount;
              i++
            ) {

              silkParticles.push(

                new SilkParticle()

              );

            }



            createPenCursor();



            canvas.elt.tabIndex =
              0;



            canvas.elt.addEventListener(

              "pointerdown",

              handlePointerDown

            );


            canvas.elt.addEventListener(

              "pointermove",

              handlePointerMove

            );


            canvas.elt.addEventListener(

              "pointerup",

              handlePointerUp

            );


            canvas.elt.addEventListener(

              "pointercancel",

              handlePointerUp

            );


            canvas.elt.addEventListener(

              "pointerleave",

              handlePointerLeave

            );



            canvas.elt.addEventListener(

              "wheel",

              handleWheel,

              {
                passive:
                  false
              }

            );



            canvas.elt.addEventListener(

              "keydown",

              handleKeyDown

            );



            controller.api = {

              setMode,

              clearFront,

              clearBack,

              resetPaper,

              reset,

              refresh,

              updateHandGesture,

              releaseHandDrawing,

              handleHandClick,


              exportArtwork:

                () => {

                  return {

                    front:

                      frontTexture
                        ?.canvas
                        ?.toDataURL(
                          "image/png"
                        )

                      ||

                      null,


                    back:

                      backTexture
                        ?.canvas
                        ?.toDataURL(
                          "image/png"
                        )

                      ||

                      null

                  };

                }

            };



            controller.onModeChange(
              mode
            );


            updateCanvasCursor();


            p.noLoop();

            p.redraw();

          };



          // =================================================
          // DRAW LOOP
          // =================================================

          p.draw = () => {

            p.clear();



            if (

              controller.interactionEnabled

              &&

              mode === "silk"

              &&

              (
                (
                  silkDrawing
                  &&
                  pointerDown
                )

                ||

                handSilkDrawing
              )

            ) {

              const hit =

                screenToVisiblePaperHit(

                  latestPointerX,

                  latestPointerY

                );



              if (

                hit

                &&

                hit.face === "front"

              ) {

                silkTargetX =
                  hit.x;


                silkTargetY =
                  hit.y;



                silkSmoothX +=

                  SILK.cursorFollow

                  *

                  (
                    silkTargetX
                    -
                    silkSmoothX
                  );


                silkSmoothY +=

                  SILK.cursorFollow

                  *

                  (
                    silkTargetY
                    -
                    silkSmoothY
                  );



                for (
                  const particle
                  of
                  silkParticles
                ) {

                  particle.update(

                    silkSmoothX,

                    silkSmoothY

                  );

                }

              }

            }



            p.ambientLight(
              218
            );



            p.directionalLight(

              90,
              90,
              90,

              -0.25,

              0.40,

              -1

            );



            p.push();


            p.translate(

              PAPER.x,

              PAPER.y,

              PAPER.z

            );


            p.rotateX(
              rotationXValue
            );


            p.rotateY(
              rotationYValue
            );


            drawPaper();


            p.pop();

          };

        },

        container

      );

  }



  // ====================================================
  // PUBLIC API
  // ====================================================

  setMode(
    mode
  ) {

    if (
      !this.started
    ) {

      this.start();

    }


    this.api
      ?.setMode(
        mode
      );

  }



  setInteractionEnabled(
    enabled
  ) {

    this.interactionEnabled =

      Boolean(
        enabled
      );



    if (
      !this.interactionEnabled
    ) {

      this.api
        ?.releaseHandDrawing();


      this.instance
        ?.noLoop();

    }



    this.api
      ?.refresh();

  }



  clearFront() {

    this.api
      ?.clearFront();

  }



  clearBack() {

    this.api
      ?.clearBack();

  }



  resetPaper() {

    this.api
      ?.resetPaper();

  }



  reset() {

    this.interactionEnabled =
      true;


    this.api
      ?.reset();

  }



  handleHandClick(
    x,
    y
  ) {

    return (

      this.api
        ?.handleHandClick(
          x,
          y
        )

      === true

    );

  }



  updateHandGesture(
    hand,
    now
  ) {

    this.api
      ?.updateHandGesture(
        hand,
        now
      );

  }



  releaseHandDrawing() {

    this.api
      ?.releaseHandDrawing();

  }



  exportArtwork() {

    return (

      this.api
        ?.exportArtwork()

      ||

      {

        front:
          null,

        back:
          null

      }

    );

  }



  stop() {

    this.interactionEnabled =
      false;


    this.api
      ?.releaseHandDrawing();



    if (
      this.instance
    ) {

      this.instance.remove();


      this.instance =
        null;

    }



    const container =

      document.getElementById(
        this.containerId
      );



    container
      ?.querySelectorAll(
        ".draw-pen-size-cursor"
      )
      .forEach(

        (
          element
        ) => {

          element.remove();

        }

      );



    this.api =
      null;


    this.started =
      false;

  }

}