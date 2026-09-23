import {
  HandLandmarker,
  FilesetResolver
}
from
"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";



export class HandGestureController {


  constructor(
    options = {}
  ) {


    this.onZoom =
      options.onZoom
      ||
      (() => {});


    this.onPan =
      options.onPan
      ||
      (() => {});


    this.onClick =
      options.onClick
      ||
      (() => {});



    // ==================================================
    // ACTIVE STATE
    // ==================================================

    this.active =
      false;



    // ==================================================
    // MEDIAPIPE
    // ==================================================

    this.handLandmarker =
      null;


    this.ready =
      false;


    this.loading =
      false;



    // ==================================================
    // PERFORMANCE
    //
    // 8 MediaPipe detections / second.
    // Cursor animation still runs at browser frame rate.
    // ==================================================

    this.detectInterval =
      1000 / 8;


    this.lastDetectTime =
      0;


    this.lastVideoTime =
      -1;



    // ==================================================
    // CURSOR
    // ==================================================

    this.cursorX =
      window.innerWidth
      *
      0.5;


    this.cursorY =
      window.innerHeight
      *
      0.5;


    this.targetX =
      this.cursorX;


    this.targetY =
      this.cursorY;


    this.cursorVisible =
      false;



    // ==================================================
    // FINGERS
    // ==================================================

    this.rawFingerCount =
      0;


    this.fingerCount =
      0;


    this.previousRawCount =
      -1;


    this.stableFrames =
      0;



    // ==================================================
    // PINCH
    // ==================================================

    this.pinching =
      false;


    this.wasPinching =
      false;


    this.lastClick =
      0;


    this.clickCooldown =
      550;



    // ==================================================
    // DWELL
    // ==================================================

    this.dwellStarted =
      0;


    this.dwellX =
      0;


    this.dwellY =
      0;


    this.dwellTime =
      850;


    this.dwellTolerance =
      38;



    // ==================================================
    // DOM
    // ==================================================

    this.cursor =

      document.getElementById(
        "hand-cursor"
      );


    this.cursorLabel =

      document.getElementById(
        "cursor-label"
      );


    this.status =

      document.getElementById(
        "gesture-status"
      );

  }



  // ====================================================
  // ACTIVATE / DEACTIVATE
  // ====================================================

  setActive(
    active
  ) {


    this.active =
      Boolean(
        active
      );



    if (
      !this.active
    ) {


      this.cursorVisible =
        false;


      this.pinching =
        false;


      this.wasPinching =
        false;


      this.fingerCount =
        0;


      this.rawFingerCount =
        0;


      this.stableFrames =
        0;



      this.resetDwell();



      this.onPan(

        0,

        0,

        false

      );



      if (
        this.cursor
      ) {


        this.cursor.classList.remove(

          "visible",

          "dwell",

          "clicking"

        );

      }



      this.setStatus(

        "HAND TRACKING OFF",

        ""

      );


      return;

    }



    if (
      this.ready
    ) {


      this.setStatus(

        "HAND TRACKING READY",

        "ready"

      );

    }

  }



  // ====================================================
  // LOAD
  // ====================================================

  async load() {


    if (
      this.ready
      ||
      this.loading
    ) {

      return;

    }



    this.loading =
      true;



    this.setStatus(

      "LOADING HAND MODEL",

      "detecting"

    );



    try {


      const vision =

        await FilesetResolver
          .forVisionTasks(

            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"

          );



      try {


        this.handLandmarker =

          await HandLandmarker
            .createFromOptions(

              vision,

              {

                baseOptions: {

                  modelAssetPath:

                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                  delegate:
                    "GPU"

                },


                runningMode:
                  "VIDEO",


                numHands:
                  1,


                minHandDetectionConfidence:
                  0.45,


                minHandPresenceConfidence:
                  0.45,


                minTrackingConfidence:
                  0.45

              }

            );

      }


      catch (
        gpuError
      ) {


        console.warn(

          "GPU unavailable. Falling back to CPU.",

          gpuError

        );



        this.handLandmarker =

          await HandLandmarker
            .createFromOptions(

              vision,

              {

                baseOptions: {

                  modelAssetPath:

                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

                },


                runningMode:
                  "VIDEO",


                numHands:
                  1,


                minHandDetectionConfidence:
                  0.45,


                minHandPresenceConfidence:
                  0.45,


                minTrackingConfidence:
                  0.45

              }

            );

      }



      this.ready =
        true;


      this.loading =
        false;



      if (
        this.active
      ) {


        this.setStatus(

          "HAND TRACKING READY",

          "ready"

        );

      }


      else {


        this.setStatus(

          "HAND TRACKING OFF",

          ""

        );

      }


    }


    catch (
      error
    ) {


      console.error(
        error
      );


      this.ready =
        false;


      this.loading =
        false;



      this.setStatus(

        "HAND MODEL FAILED",

        "error"

      );

    }

  }



  // ====================================================
  // STATUS
  // ====================================================

  setStatus(
    text,
    state = ""
  ) {


    if (
      !this.status
    ) {

      return;

    }



    this.status.textContent =
      text;



    this.status.classList.remove(

      "ready",

      "detecting",

      "error"

    );



    if (
      state
    ) {


      this.status.classList.add(
        state
      );

    }

  }



  // ====================================================
  // UPDATE
  // ====================================================

  update(
    video,
    now
  ) {


    if (
      !this.active
    ) {


      if (
        this.cursor
      ) {


        this.cursor.classList.remove(
          "visible"
        );

      }


      return;

    }



    this.updateCursorVisual();



    if (
      !this.ready
    ) {

      return;

    }



    if (

      !video

      ||

      video.readyState < 2

    ) {

      return;

    }



    if (

      now
      -
      this.lastDetectTime

      <

      this.detectInterval

    ) {

      return;

    }



    this.lastDetectTime =
      now;



    if (
      video.currentTime === this.lastVideoTime
    ) {

      return;

    }



    this.lastVideoTime =
      video.currentTime;



    try {


      const results =

        this.handLandmarker
          .detectForVideo(

            video,

            now

          );



      if (

        !results.landmarks

        ||

        results.landmarks.length === 0

      ) {


        this.handleNoHand();


        return;

      }



      this.processHand(

        results.landmarks[0]

      );


    }


    catch (
      error
    ) {


      console.warn(

        "Hand frame error",

        error

      );

    }

  }



  // ====================================================
  // NO HAND
  // ====================================================

  handleNoHand() {


    this.cursorVisible =
      false;


    this.fingerCount =
      0;


    this.stableFrames =
      0;



    this.resetDwell();



    this.onPan(

      0,

      0,

      false

    );



    this.setStatus(

      "SHOW HAND",

      "ready"

    );

  }



  // ====================================================
  // PROCESS HAND
  // ====================================================

  processHand(
    lm
  ) {


    if (

      !lm

      ||

      lm.length < 21

    ) {

      return;

    }



    const indexTip =
      lm[8];



    let normalizedX =

      1
      -
      indexTip.x;



    let normalizedY =

      indexTip.y;



    normalizedX =

      remapClamp(

        normalizedX,

        0.12,

        0.88,

        0,

        1

      );



    normalizedY =

      remapClamp(

        normalizedY,

        0.10,

        0.90,

        0,

        1

      );



    this.targetX =

      normalizedX
      *
      window.innerWidth;



    this.targetY =

      normalizedY
      *
      window.innerHeight;



    this.cursorVisible =
      true;



    this.rawFingerCount =

      this.countFingers(
        lm
      );



    if (
      this.rawFingerCount === this.previousRawCount
    ) {


      this.stableFrames++;

    }


    else {


      this.previousRawCount =
        this.rawFingerCount;


      this.stableFrames =
        0;

    }



    if (
      this.stableFrames >= 1
    ) {


      this.fingerCount =
        this.rawFingerCount;

    }



    const pinchDistance =

      distance(

        lm[4],

        lm[8]

      );



    this.wasPinching =
      this.pinching;



    this.pinching =

      pinchDistance < 0.055;



    if (

      this.pinching

      &&

      !this.wasPinching

    ) {


      this.performClick();

    }



    this.applyGesture(
      lm
    );

  }



  // ====================================================
  // GESTURES
  // ====================================================

  applyGesture(
    lm
  ) {


    // 2 FINGERS = ZOOM OUT

    if (
      this.fingerCount === 2
    ) {


      this.onZoom(
        -0.035
      );


      this.onPan(
        0,
        0,
        false
      );


      this.resetDwell();



      this.setStatus(

        "2 FINGERS · ZOOM OUT",

        "ready"

      );


      this.setCursorLabel(
        "ZOOM OUT"
      );


      return;

    }



    // 3 FINGERS = ZOOM IN

    if (
      this.fingerCount === 3
    ) {


      this.onZoom(
        0.035
      );


      this.onPan(
        0,
        0,
        false
      );


      this.resetDwell();



      this.setStatus(

        "3 FINGERS · ZOOM IN",

        "ready"

      );


      this.setCursorLabel(
        "ZOOM IN"
      );


      return;

    }



    // 5 = MOVE

    if (
      this.fingerCount >= 5
    ) {


      const palmX =

        (

          lm[0].x

          +

          lm[5].x

          +

          lm[9].x

          +

          lm[13].x

          +

          lm[17].x

        )

        /
        5;



      const palmY =

        (

          lm[0].y

          +

          lm[5].y

          +

          lm[9].y

          +

          lm[13].y

          +

          lm[17].y

        )

        /
        5;



      const px =

        (

          1
          -
          palmX

        )

        *
        2

        -
        1;



      const py =

        palmY
        *
        2

        -
        1;



      this.onPan(

        px,

        py,

        true

      );



      this.resetDwell();



      this.setStatus(

        "OPEN HAND · MOVE",

        "ready"

      );


      this.setCursorLabel(
        "MOVE"
      );


      return;

    }



    this.onPan(

      0,

      0,

      false

    );



    // 1 = POINTER

    if (
      this.fingerCount === 1
    ) {


      this.updateDwell();



      this.setStatus(

        "INDEX · POINTER",

        "ready"

      );



      this.setCursorLabel(

        this.pinching

          ?

          "CLICK"

          :

          "POINTER"

      );


      return;

    }



    this.resetDwell();



    this.setStatus(

      `${this.fingerCount} FINGERS`,

      "ready"

    );



    this.setCursorLabel(

      `${this.fingerCount} FINGERS`

    );

  }



  // ====================================================
  // COUNT FINGERS
  // ====================================================

  countFingers(
    lm
  ) {


    let count =
      0;



    const fingers = [


      {
        tip: 8,
        pip: 6,
        mcp: 5
      },


      {
        tip: 12,
        pip: 10,
        mcp: 9
      },


      {
        tip: 16,
        pip: 14,
        mcp: 13
      },


      {
        tip: 20,
        pip: 18,
        mcp: 17
      }

    ];



    for (
      const finger of fingers
    ) {


      const tipDistance =

        distance(

          lm[finger.tip],

          lm[0]

        );



      const pipDistance =

        distance(

          lm[finger.pip],

          lm[0]

        );



      const mcpDistance =

        distance(

          lm[finger.mcp],

          lm[0]

        );



      const extended =

        tipDistance
        >
        pipDistance
        *
        1.05

        &&

        tipDistance
        >
        mcpDistance
        *
        1.14;



      if (
        extended
      ) {


        count++;

      }

    }



    const thumbTip =

      distance(

        lm[4],

        lm[9]

      );



    const thumbJoint =

      distance(

        lm[3],

        lm[9]

      );



    if (
      thumbTip > thumbJoint * 1.10
    ) {


      count++;

    }



    return count;

  }



  // ====================================================
  // DWELL
  // ====================================================

  updateDwell() {


    const now =
      performance.now();



    const moved =

      Math.hypot(

        this.cursorX - this.dwellX,

        this.cursorY - this.dwellY

      );



    if (

      !this.dwellStarted

      ||

      moved > this.dwellTolerance

    ) {


      this.dwellStarted =
        now;


      this.dwellX =
        this.cursorX;


      this.dwellY =
        this.cursorY;



      if (
        this.cursor
      ) {


        this.cursor.classList.remove(
          "dwell"
        );

      }


      return;

    }



    if (
      now - this.dwellStarted > 160
    ) {


      this.cursor
        ?.classList
        .add(
          "dwell"
        );

    }



    if (
      now - this.dwellStarted >= this.dwellTime
    ) {


      this.performClick();



      this.dwellStarted =
        now;


      this.dwellX =
        this.cursorX;


      this.dwellY =
        this.cursorY;

    }

  }



  resetDwell() {


    this.dwellStarted =
      0;



    this.cursor
      ?.classList
      .remove(
        "dwell"
      );

  }



  // ====================================================
  // CLICK
  // ====================================================

  performClick() {


    if (
      !this.active
    ) {

      return;

    }



    const now =
      performance.now();



    if (
      now - this.lastClick < this.clickCooldown
    ) {

      return;

    }



    this.lastClick =
      now;



    if (
      this.cursor
    ) {


      this.cursor.classList.add(
        "clicking"
      );



      setTimeout(

        () => {


          this.cursor.classList.remove(
            "clicking"
          );

        },

        130

      );

    }



    this.onClick(

      this.cursorX,

      this.cursorY

    );

  }



  // ====================================================
  // CURSOR
  // ====================================================

  updateCursorVisual() {


    if (
      !this.cursor
    ) {

      return;

    }



    if (

      !this.active

      ||

      !this.cursorVisible

    ) {


      this.cursor.classList.remove(
        "visible"
      );


      return;

    }



    this.cursorX =

      lerp(

        this.cursorX,

        this.targetX,

        0.42

      );



    this.cursorY =

      lerp(

        this.cursorY,

        this.targetY,

        0.42

      );



    this.cursor.classList.add(
      "visible"
    );



    this.cursor.style.transform =

      `translate3d(
        ${this.cursorX}px,
        ${this.cursorY}px,
        0
      )`;

  }



  setCursorLabel(
    value
  ) {


    if (
      this.cursorLabel
    ) {


      this.cursorLabel.textContent =
        value;

    }

  }

}



// ======================================================
// HELPERS
// ======================================================

function distance(
  a,
  b
) {


  const az =
    a.z || 0;


  const bz =
    b.z || 0;



  return Math.hypot(

    a.x - b.x,

    a.y - b.y,

    az - bz

  );

}



function remapClamp(

  value,

  minA,

  maxA,

  minB,

  maxB

) {


  let t =

    (

      value - minA

    )

    /

    (

      maxA - minA

    );



  t =

    Math.max(

      0,

      Math.min(

        1,

        t

      )

    );



  return (

    minB

    +

    (

      maxB - minB

    )

    *
    t

  );

}



function lerp(
  a,
  b,
  amount
) {


  return (

    a

    +

    (

      b - a

    )

    *
    amount

  );

}