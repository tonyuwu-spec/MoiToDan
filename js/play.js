// ======================================================
// MỜI TỪ ĐÀN
// PLAY SCENE
// ======================================================



// ======================================================
// ENVIRONMENTS
// ======================================================

const PLAY_ENVIRONMENTS = {

  dawn: {

    background3:
      "assets/Play_dawnbg3.png",

    worm:
      "assets/Play_dawnworm.png",

    background1:
      "assets/Play_dawnbg1.png"

  },


  morning: {

    background3:
      "assets/Play_morningbg3.png",

    worm:
      "assets/Play_morningworm.png",

    background1:
      "assets/Play_morningbg1.png"

  },


  dusk: {

    background3:
      "assets/Play_duskbg3.png",

    worm:
      "assets/Play_duskworm.png",

    background1:
      "assets/Play_duskbg1.png"

  },


  night: {

    background3:
      "assets/Play_nightbg3.png",

    worm:
      "assets/Play_nightworm.png",

    background1:
      "assets/Play_nightbg1.png"

  }

};



// ======================================================
// WHOLE LETTER SENTIMENT
// ======================================================

const TRANSFORMERS_MODULE_URL =

  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";


const LETTER_SENTIMENT_MODEL =

  "Xenova/distilbert-base-multilingual-cased-sentiments-student";



// ======================================================
// STORAGE
// ======================================================

const LETTER_STORAGE_KEY =

  "moi-tu-dan-draw-letter-v2";



// ======================================================
// PLAY SCENE
// ======================================================

export class PlayScene {


  constructor(
    options = {}
  ) {


    this.state =
      options.state;


    this.window =
      options.window;


    this.board =
      options.board;


    this.background3 =
      options.background3;


    this.worm =
      options.worm;


    this.background1 =
      options.background1;


    this.silkMount =
      options.silkMount;



    this.selectedEnvironment =
      "dawn";


    this.preloaded =
      false;



    // ==================================================
    // LETTER
    // ==================================================

    this.letterDraft =
      "";


    this.letterRecord =
      null;


    this.analysisPromise =
      null;



    // ==================================================
    // REAL MOUSE
    // ==================================================

    this.lastMouseX =
      null;


    this.lastMouseY =
      null;


    this.lastMouseTime =
      0;



    // ==================================================
    // HAND CURSOR

    // IMPORTANT:
    //
    // These coordinates now come from the ACTUAL
    // visible MediaPipe cursor every animation frame.
    //
    // This is much smoother than the previous
    // open-palm onPan coordinate.
    // ==================================================

    this.lastHandX =
      null;


    this.lastHandY =
      null;


    this.lastHandTime =
      0;



    // ==================================================
    // STRING CONTROL
    // ==================================================

    this.stringLastTrigger = [

      0,
      0,
      0

    ];


    this.stringCooldown =
      62;



    // ==================================================
    // INSTRUMENT
    // ==================================================

    this.instrument =

      new PlaySilkInstrument(

        this.silkMount,

        this.window

      );



    // ==================================================
    // BOUND EVENTS
    // ==================================================

    this.boundPointerMove =

      (
        event
      ) => {


        this.handlePointerMove(
          event
        );

      };



    this.boundPointerDown =

      () => {


        void this.unlockAudio();

      };



    this.boundLetterKeyDown =

      (
        event
      ) => {


        this.captureLetterKey(
          event
        );

      };



    this.installLetterCapture();

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
        PLAY_ENVIRONMENTS
      )
    ) {


      const background3 =

        new Image();


      background3.src =
        environment.background3;



      const worm =

        new Image();


      worm.src =
        environment.worm;



      const background1 =

        new Image();


      background1.src =
        environment.background1;

    }

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
      !PLAY_ENVIRONMENTS[
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

      PLAY_ENVIRONMENTS[
        safeEnvironment
      ];



    this.background3.src =
      environment.background3;


    this.worm.src =
      environment.worm;


    this.background1.src =
      environment.background1;

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



    // ==================================================
    // SCENE STATE
    // ==================================================

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
      false;


    this.state.drawCameraActive =
      false;


    this.state.playRunning =
      true;



    // ==================================================
    // KEEP HAND TRACKER RUNNING
    // ==================================================

    this.state.cameraControlsActive =
      true;



    this.resetCamera();



    // ==================================================
    // LETTER ANALYSIS
    // ==================================================

    this.letterRecord =

      data.letterRecord

      ||

      this.getSavedLetterRecord();



    if (
      !this.letterRecord
    ) {


      this.letterRecord =

        await this.finalizeLetterAnalysis();

    }



    const mood =

      Number(

        this.letterRecord
          ?.analysis
          ?.normalized

      )

      ||

      0;



    this.instrument.setMood(
      mood
    );



    // ==================================================
    // BODY
    // ==================================================

    document.body.classList.add(
      "recording-active"
    );


    document.body.classList.add(
      "play-active"
    );



    // ==================================================
    // RESET MOUSE
    // ==================================================

    this.lastMouseX =
      null;


    this.lastMouseY =
      null;


    this.lastMouseTime =
      0;



    // ==================================================
    // RESET HAND
    // ==================================================

    this.resetHandMotion();



    this.stringLastTrigger = [

      0,
      0,
      0

    ];



    this.instrument.start();



    // ==================================================
    // REAL MOUSE
    // ==================================================

    this.window.addEventListener(

      "pointermove",

      this.boundPointerMove,

      {
        passive:
          true
      }

    );


    this.window.addEventListener(

      "pointerdown",

      this.boundPointerDown,

      {
        passive:
          true
      }

    );



    void this.unlockAudio();

  }



  // ====================================================
  // CAMERA
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
  // AUDIO
  // ====================================================

  async unlockAudio() {


    await this.instrument.unlockAudio();

  }



  // ====================================================
  // LETTER CAPTURE
  // ====================================================

  installLetterCapture() {


    document.addEventListener(

      "keydown",

      this.boundLetterKeyDown,

      true

    );



    const clearTextButton =

      document.getElementById(
        "draw-clear-back-button"
      );



    clearTextButton
      ?.addEventListener(

        "click",

        () => {


          if (
            !document.body.classList.contains(
              "draw-active"
            )
          ) {

            return;

          }


          this.letterDraft =
            "";


          this.letterRecord =
            null;


          this.analysisPromise =
            null;

        }

      );



    const resetButton =

      document.getElementById(
        "draw-reset-button"
      );



    resetButton
      ?.addEventListener(

        "click",

        () => {


          if (
            !document.body.classList.contains(
              "draw-active"
            )
          ) {

            return;

          }


          this.letterDraft =
            "";


          this.letterRecord =
            null;


          this.analysisPromise =
            null;

        }

      );



    const finishButton =

      document.getElementById(
        "draw-finish-button"
      );



    finishButton
      ?.addEventListener(

        "click",

        () => {


          if (
            !document.body.classList.contains(
              "draw-active"
            )
          ) {

            return;

          }


          void this.finalizeLetterAnalysis();

        }

      );



    let previouslyDrawActive =

      document.body.classList.contains(
        "draw-active"
      );



    const observer =

      new MutationObserver(

        () => {


          const currentlyDrawActive =

            document.body.classList.contains(
              "draw-active"
            );



          if (

            currentlyDrawActive

            &&

            !previouslyDrawActive

          ) {


            this.letterDraft =
              "";


            this.letterRecord =
              null;


            this.analysisPromise =
              null;



            try {


              localStorage.removeItem(
                LETTER_STORAGE_KEY
              );


            }


            catch (
              error
            ) {


              void error;

            }

          }



          previouslyDrawActive =
            currentlyDrawActive;

        }

      );



    observer.observe(

      document.body,

      {

        attributes:
          true,

        attributeFilter: [
          "class"
        ]

      }

    );

  }



  // ====================================================
  // CAPTURE LETTER
  // ====================================================

  captureLetterKey(
    event
  ) {


    if (
      !document.body.classList.contains(
        "draw-active"
      )
    ) {

      return;

    }



    if (
      !document.body.classList.contains(
        "draw-drawing"
      )
    ) {

      return;

    }



    const target =
      event.target;



    if (
      !(target instanceof Element)
    ) {

      return;

    }



    if (
      !target.closest(
        "#draw-paper-mount"
      )
    ) {

      return;

    }



    const modeIndicator =

      document.getElementById(
        "draw-mode-indicator"
      );



    const modeText =

      String(

        modeIndicator
          ?.textContent

        ||

        ""

      )
      .trim()
      .toUpperCase();



    if (
      !modeText.includes(
        "WRITE ON LINED BACK"
      )
    ) {

      return;

    }



    if (
      event.key === "Backspace"
    ) {


      this.letterDraft =

        this.letterDraft.slice(
          0,
          -1
        );


      this.letterRecord =
        null;


      this.analysisPromise =
        null;


      return;

    }



    if (
      event.key === "Enter"
    ) {


      this.letterDraft +=
        "\n";


      this.letterRecord =
        null;


      this.analysisPromise =
        null;


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


      this.letterDraft +=
        event.key;


      this.letterRecord =
        null;


      this.analysisPromise =
        null;

    }

  }



  // ====================================================
  // WHOLE LETTER ANALYSIS
  // ====================================================

  async finalizeLetterAnalysis() {


    const text =

      String(
        this.letterDraft
      )
      .trim();



    if (

      this.letterRecord

      &&

      this.letterRecord.text === text

    ) {


      return this.letterRecord;

    }



    if (
      this.analysisPromise
    ) {


      return this.analysisPromise;

    }



    this.analysisPromise =

      (

        async () => {


          let analysis;



          try {


            analysis =

              await analyzeWholeLetter(
                text
              );


          }


          catch (
            error
          ) {


            console.warn(

              "PLAY WHOLE LETTER ANALYSIS FAILED:",

              error

            );


            analysis =

              createNeutralAnalysis(
                "machine-error"
              );

          }



          this.letterRecord = {

            text,

            analysis,

            savedAt:
              Date.now()

          };



          try {


            localStorage.setItem(

              LETTER_STORAGE_KEY,

              JSON.stringify(
                this.letterRecord
              )

            );


          }


          catch (
            error
          ) {


            console.warn(

              "PLAY LETTER STORAGE FAILED:",

              error

            );

          }



          console.log(

            "PLAY WHOLE LETTER ANALYSIS:",

            this.letterRecord

          );



          this.analysisPromise =
            null;



          return this.letterRecord;

        }

      )();



    return this.analysisPromise;

  }



  // ====================================================
  // SAVED LETTER
  // ====================================================

  getSavedLetterRecord() {


    try {


      const saved =

        localStorage.getItem(
          LETTER_STORAGE_KEY
        );



      if (
        !saved
      ) {


        return null;

      }



      return JSON.parse(
        saved
      );


    }


    catch (
      error
    ) {


      console.warn(

        "PLAY SAVED LETTER ERROR:",

        error

      );


      return null;

    }

  }



  // ====================================================
  // REAL MOUSE
  // ====================================================

  handlePointerMove(
    event
  ) {


    if (
      !this.state.playRunning
    ) {

      return;

    }



    const point =

      this.clientPointToStage(

        event.clientX,

        event.clientY

      );



    if (
      !point
    ) {

      return;

    }



    this.processMotion(

      "mouse",

      point.x,

      point.y,

      performance.now()

    );

  }



  // ====================================================
  // HAND CURSOR

  // IMPORTANT:
  //
  // clientX / clientY are the ACTUAL white hand cursor
  // coordinates displayed on screen.
  //
  // Called every requestAnimationFrame from sketch.js.
  //
  // With 5 fingers:
  // hand cursor = mouse movement.
  // ====================================================

  handleHandCursor(

    clientX,

    clientY,

    active

  ) {


    if (
      !this.state.playRunning
    ) {

      return;

    }



    if (
      !active
    ) {


      this.resetHandMotion();


      return;

    }



    if (

      !Number.isFinite(
        clientX
      )

      ||

      !Number.isFinite(
        clientY
      )

    ) {


      this.resetHandMotion();


      return;

    }



    const point =

      this.clientPointToStage(

        clientX,

        clientY

      );



    if (
      !point
    ) {


      this.resetHandMotion();


      return;

    }



    this.processMotion(

      "hand",

      point.x,

      point.y,

      performance.now()

    );

  }



  // ====================================================
  // SCREEN → 2560 × 1440 PLAY STAGE
  // ====================================================

  clientPointToStage(

    clientX,

    clientY

  ) {


    const rect =

      this.window
        .getBoundingClientRect();



    if (

      rect.width <= 0

      ||

      rect.height <= 0

    ) {


      return null;

    }



    const normalizedX =

      (

        clientX

        -

        rect.left

      )

      /

      rect.width;



    const normalizedY =

      (

        clientY

        -

        rect.top

      )

      /

      rect.height;



    if (

      normalizedX < 0

      ||

      normalizedX > 1

      ||

      normalizedY < 0

      ||

      normalizedY > 1

    ) {


      return null;

    }



    return {

      x:

        normalizedX

        *

        2560,


      y:

        normalizedY

        *

        1440

    };

  }



  // ====================================================
  // RESET HAND HISTORY
  // ====================================================

  resetHandMotion() {


    this.lastHandX =
      null;


    this.lastHandY =
      null;


    this.lastHandTime =
      0;

  }



  // ====================================================
  // SHARED MOVEMENT ENGINE
  //
  // Mouse + hand use EXACT SAME crossing system.
  // ====================================================

  processMotion(

    source,

    x,

    y,

    now

  ) {


    let previousX;
    let previousY;
    let previousTime;



    if (
      source === "hand"
    ) {


      previousX =
        this.lastHandX;


      previousY =
        this.lastHandY;


      previousTime =
        this.lastHandTime;

    }


    else {


      previousX =
        this.lastMouseX;


      previousY =
        this.lastMouseY;


      previousTime =
        this.lastMouseTime;

    }



    // ==================================================
    // FIRST FRAME
    // ==================================================

    if (

      previousX === null

      ||

      previousY === null

      ||

      !previousTime

    ) {


      this.saveMotionPosition(

        source,

        x,

        y,

        now

      );


      // =================================================
      // ALSO CHECK DIRECT CONTACT.
      //
      // This lets the hand react immediately when it
      // first appears directly over a string.
      // =================================================

      this.checkDirectStringContact(

        x,

        y,

        0.18,

        now

      );


      return;

    }



    const deltaTime =

      Math.max(

        6,

        now

        -

        previousTime

      );



    const horizontalDistance =

      Math.abs(

        x

        -

        previousX

      );



    const horizontalSpeed =

      horizontalDistance

      /

      deltaTime;



    this.checkStringCrossings(

      previousX,

      previousY,

      x,

      y,

      horizontalSpeed,

      now

    );



    // ==================================================
    // ALSO CHECK CURRENT CURSOR CONTACT

    // Makes open-hand interaction feel immediate instead
    // of requiring a large crossing jump.
    // ==================================================

    this.checkDirectStringContact(

      x,

      y,

      horizontalSpeed,

      now

    );



    this.saveMotionPosition(

      source,

      x,

      y,

      now

    );

  }



  // ====================================================
  // SAVE MOVEMENT
  // ====================================================

  saveMotionPosition(

    source,

    x,

    y,

    now

  ) {


    if (
      source === "hand"
    ) {


      this.lastHandX =
        x;


      this.lastHandY =
        y;


      this.lastHandTime =
        now;

    }


    else {


      this.lastMouseX =
        x;


      this.lastMouseY =
        y;


      this.lastMouseTime =
        now;

    }

  }



  // ====================================================
  // DIRECT CONTACT
  // ====================================================

  checkDirectStringContact(

    x,

    y,

    speed,

    now

  ) {


    const layout =

      this.instrument
        .getLayout();



    if (

      y < layout.top

      ||

      y > layout.top + layout.height

    ) {


      return;

    }



    for (
      let index = 0;
      index < layout.x.length;
      index++
    ) {


      const distance =

        Math.abs(

          x

          -

          layout.x[index]

        );



      if (
        distance > layout.hitWidth * 0.5
      ) {


        continue;

      }



      if (

        now

        -

        this.stringLastTrigger[index]

        <

        this.stringCooldown

      ) {


        continue;

      }



      this.stringLastTrigger[index] =
        now;



      this.instrument.pluck(

        index,

        Math.max(
          speed,
          0.18
        )

      );

    }

  }



  // ====================================================
  // CROSSINGS
  // ====================================================

  checkStringCrossings(

    previousX,

    previousY,

    currentX,

    currentY,

    speed,

    now

  ) {


    const layout =

      this.instrument
        .getLayout();



    const averageY =

      (

        previousY

        +

        currentY

      )

      *

      0.5;



    if (

      averageY < layout.top

      ||

      averageY >

      layout.top + layout.height

    ) {


      return;

    }



    for (
      let index = 0;
      index < layout.x.length;
      index++
    ) {


      const stringX =
        layout.x[index];



      const previousDistance =

        previousX

        -

        stringX;



      const currentDistance =

        currentX

        -

        stringX;



      const crossed =

        previousDistance

        *

        currentDistance

        <=

        0;



      const enteredHitArea =

        Math.abs(
          currentDistance
        )

        <=

        layout.hitWidth
        *
        0.5

        &&

        Math.abs(
          previousDistance
        )

        >

        layout.hitWidth
        *
        0.5;



      if (

        !crossed

        &&

        !enteredHitArea

      ) {


        continue;

      }



      if (

        now

        -

        this.stringLastTrigger[index]

        <

        this.stringCooldown

      ) {


        continue;

      }



      this.stringLastTrigger[index] =
        now;



      this.instrument.pluck(

        index,

        speed

      );

    }

  }



  // ====================================================
  // UPDATE
  // ====================================================

  update(
    now
  ) {


    if (
      !this.state.playRunning
    ) {

      return;

    }



    const energy =

      this.instrument
        .getEnergy();



    const angle =

      Math.sin(

        now

        *

        0.018

      )

      *

      energy

      *

      9;



    const xMove =

      Math.sin(

        now

        *

        0.026

      )

      *

      energy

      *

      13;



    const yMove =

      Math.sin(

        now

        *

        0.021

        +

        1.4

      )

      *

      energy

      *

      4;



    this.worm.style.transform =

      `translate3d(
        ${xMove}px,
        ${yMove}px,
        0
      )
      rotate(${angle}deg)`;

  }



  // ====================================================
  // EXIT
  // ====================================================

  async exit() {


    this.state.playRunning =
      false;



    this.window.removeEventListener(

      "pointermove",

      this.boundPointerMove

    );


    this.window.removeEventListener(

      "pointerdown",

      this.boundPointerDown

    );



    this.instrument.stop();



    this.worm.style.transform =
      "";



    this.lastMouseX =
      null;


    this.lastMouseY =
      null;


    this.lastMouseTime =
      0;



    this.resetHandMotion();



    document.body.classList.remove(
      "play-active"
    );



    this.resetCamera();

  }

}



// ======================================================
// WHOLE LETTER MACHINE ANALYSIS
// ======================================================

async function analyzeWholeLetter(
  originalText
) {


  const text =

    String(
      originalText
      ||
      ""
    )
    .trim();



  if (
    !text
  ) {


    return createNeutralAnalysis(
      "empty-letter"
    );

  }



  const transformers =

    await import(
      TRANSFORMERS_MODULE_URL
    );



  if (

    !transformers

    ||

    typeof transformers.pipeline
    !==
    "function"

  ) {


    return createNeutralAnalysis(
      "machine-unavailable"
    );

  }



  if (
    transformers.env
  ) {


    transformers.env.allowLocalModels =
      false;

  }



  let classifier =
    null;



  try {


    console.log(
      "PLAY ML: loading whole-letter sentiment model..."
    );



    classifier =

      await transformers.pipeline(

        "text-classification",

        LETTER_SENTIMENT_MODEL

      );



    const rawResult =

      await classifier(

        text,

        {

          top_k:
            null,

          truncation:
            true,

          max_length:
            512

        }

      );



    const probabilities =

      normalizeWholeLetterOutput(
        rawResult
      );



    if (
      !probabilities
    ) {


      return createNeutralAnalysis(
        "machine-invalid-output"
      );

    }



    const normalized =

      clamp(

        probabilities.positive

        -

        probabilities.negative,

        -1,

        1

      );



    let label =
      "neutral";



    if (
      normalized > 0.08
    ) {


      label =
        "positive";

    }


    else if (
      normalized < -0.08
    ) {


      label =
        "negative";

    }



    const confidence =

      Math.max(

        probabilities.positive,

        probabilities.neutral,

        probabilities.negative

      );



    return {

      normalized,

      label,

      confidence,

      probabilities,

      source:
        "whole-letter-machine",

      model:
        LETTER_SENTIMENT_MODEL

    };


  }


  finally {


    if (

      classifier

      &&

      typeof classifier.dispose
      ===
      "function"

    ) {


      try {


        await classifier.dispose();


      }


      catch (
        error
      ) {


        void error;

      }

    }

  }

}



// ======================================================
// NORMALIZE MACHINE OUTPUT
// ======================================================

function normalizeWholeLetterOutput(
  rawOutput
) {


  let rows;



  if (

    Array.isArray(
      rawOutput
    )

    &&

    Array.isArray(
      rawOutput[0]
    )

  ) {


    rows =
      rawOutput[0];

  }


  else if (
    Array.isArray(
      rawOutput
    )
  ) {


    rows =
      rawOutput;

  }


  else {


    return null;

  }



  let positive =
    0;


  let neutral =
    0;


  let negative =
    0;



  for (
    const item
    of
    rows
  ) {


    if (
      !item
    ) {

      continue;

    }



    const score =

      Number(
        item.score
      );



    if (
      !Number.isFinite(
        score
      )
    ) {

      continue;

    }



    const label =

      String(
        item.label
        ||
        ""
      )
      .trim()
      .toLowerCase();



    if (

      label === "positive"

      ||

      label.includes(
        "positive"
      )

      ||

      label === "label_0"

    ) {


      positive +=
        score;


      continue;

    }



    if (

      label === "neutral"

      ||

      label.includes(
        "neutral"
      )

      ||

      label === "label_1"

    ) {


      neutral +=
        score;


      continue;

    }



    if (

      label === "negative"

      ||

      label.includes(
        "negative"
      )

      ||

      label === "label_2"

    ) {


      negative +=
        score;

    }

  }



  const total =

    positive

    +

    neutral

    +

    negative;



  if (
    total <= 0
  ) {


    return null;

  }



  return {

    positive:

      positive
      /
      total,


    neutral:

      neutral
      /
      total,


    negative:

      negative
      /
      total

  };

}



// ======================================================
// FALLBACK
// ======================================================

function createNeutralAnalysis(
  source
) {


  return {

    normalized:
      0,

    label:
      "neutral",

    confidence:
      0,

    probabilities: {

      positive:
        0,

      neutral:
        1,

      negative:
        0

    },

    source,

    model:
      LETTER_SENTIMENT_MODEL

  };

}



// ======================================================
// P5 SILK INSTRUMENT
// ======================================================

class PlaySilkInstrument {


  constructor(
    mount,
    playWindow
  ) {


    this.mount =
      mount;


    this.playWindow =
      playWindow;


    this.instance =
      null;


    this.started =
      false;



    this.mood =
      0;



    this.energies = [

      0,
      0,
      0

    ];



    this.audioContext =
      null;


    this.masterGain =
      null;


    this.compressor =
      null;

  }



  // ====================================================
  // MOOD
  // ====================================================

  setMood(
    normalized
  ) {


    this.mood =

      clamp(

        Number(
          normalized
        )

        ||

        0,

        -1,

        1

      );

  }



  // ====================================================
  // LAYOUT
  // ====================================================

  getLayout() {


    const style =

      getComputedStyle(
        this.playWindow
      );



    const readValue =

      (
        variable,

        fallback
      ) => {


        const parsed =

          parseFloat(

            style.getPropertyValue(
              variable
            )

          );



        return Number.isFinite(
          parsed
        )

          ?

          parsed

          :

          fallback;

      };



    return {

      x: [

        readValue(
          "--play-string-left",
          655
        ),

        readValue(
          "--play-string-middle",
          685
        ),

        readValue(
          "--play-string-right",
          715
        )

      ],


      top:

        readValue(
          "--play-string-top",
          0
        ),


      height:

        readValue(
          "--play-string-height",
          1440
        ),


      hitWidth:

        readValue(
          "--play-string-hit-width",
          20
        )

    };

  }



  // ====================================================
  // START
  // ====================================================

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
        "PLAY: p5.js is not loaded."
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


          const WIDTH =
            1280;


          const HEIGHT =
            720;



          p.setup =

            () => {


              const canvas =

                p.createCanvas(

                  WIDTH,

                  HEIGHT

                );


              canvas.parent(
                controller.mount
              );


              p.pixelDensity(
                1
              );


              p.frameRate(
                45
              );


              p.noFill();

            };



          p.draw =

            () => {


              p.clear();



              const layout =

                controller.getLayout();



              const scaleX =

                WIDTH
                /
                2560;



              const scaleY =

                HEIGHT
                /
                1440;



              const top =

                layout.top

                *

                scaleY;



              const bottom =

                (

                  layout.top

                  +

                  layout.height

                )

                *

                scaleY;



              const time =

                p.millis();



              const moodAmount =

                (

                  controller.mood

                  +

                  1

                )

                /

                2;



              const red =

                p.lerp(

                  220,

                  252,

                  moodAmount

                );



              const green =

                p.lerp(

                  52,

                  178,

                  moodAmount

                );



              const blue =

                p.lerp(

                  45,

                  68,

                  moodAmount

                );



              for (
                let index = 0;
                index < 3;
                index++
              ) {


                const baseX =

                  layout.x[index]

                  *

                  scaleX;



                const energy =

                  controller
                    .energies[
                      index
                    ];



                controller.energies[
                  index
                ] *=
                  0.935;



                if (
                  controller.energies[
                    index
                  ] < 0.001
                ) {


                  controller.energies[
                    index
                  ] =
                    0;

                }



                for (
                  let filament = -1;
                  filament <= 1;
                  filament++
                ) {


                  const alpha =

                    filament === 0

                    ?

                    220

                    :

                    105;



                  p.stroke(

                    red,

                    green,

                    blue,

                    alpha

                  );



                  p.strokeWeight(

                    filament === 0

                    ?

                    1.35

                    :

                    0.6

                  );



                  p.beginShape();



                  const steps =
                    65;



                  for (
                    let step = 0;
                    step <= steps;
                    step++
                  ) {


                    const amount =

                      step
                      /
                      steps;



                    const y =

                      p.lerp(

                        top,

                        bottom,

                        amount

                      );



                    const envelope =

                      Math.sin(

                        Math.PI

                        *

                        amount

                      );



                    // =====================================
                    // SUBTLE VIBRATION
                    // =====================================

                    const vibration =

                      Math.sin(

                        time

                        *

                        (

                          0.021

                          +

                          index

                          *

                          0.002

                        )

                        +

                        amount

                        *

                        15

                        +

                        index

                        *

                        1.8

                      )

                      *

                      energy

                      *

                      3.2

                      *

                      envelope;



                    const idleSway =

                      Math.sin(

                        time

                        *

                        0.0012

                        +

                        amount

                        *

                        6

                        +

                        index

                        *

                        2.3

                      )

                      *

                      0.22

                      *

                      envelope;



                    const x =

                      baseX

                      +

                      filament

                      *

                      1.4

                      +

                      vibration

                      +

                      idleSway;



                    p.vertex(

                      x,

                      y

                    );

                  }



                  p.endShape();

                }

              }

            };

        },

        this.mount

      );

  }



  // ====================================================
  // PLUCK
  // ====================================================

  pluck(
    stringIndex,
    speed
  ) {


    const normalizedSpeed =

      clamp(

        speed
        /
        3.8,

        0,

        1

      );



    const velocity =

      Math.sqrt(
        normalizedSpeed
      );



    this.energies[
      stringIndex
    ] =

      Math.max(

        this.energies[
          stringIndex
        ],

        0.16

        +

        velocity

        *

        0.64

      );



    void this.playTone(

      stringIndex,

      velocity

    );

  }



  // ====================================================
  // ENERGY
  // ====================================================

  getEnergy() {


    return clamp(

      Math.max(

        this.energies[0],

        this.energies[1],

        this.energies[2]

      ),

      0,

      1

    );

  }



  // ====================================================
  // AUDIO UNLOCK
  // ====================================================

  async unlockAudio() {


    if (
      !this.audioContext
    ) {


      const AudioContextClass =

        window.AudioContext

        ||

        window.webkitAudioContext;



      if (
        !AudioContextClass
      ) {


        console.warn(
          "PLAY: WEB AUDIO IS NOT AVAILABLE."
        );


        return;

      }



      this.audioContext =

        new AudioContextClass();



      this.compressor =

        this.audioContext
          .createDynamicsCompressor();



      this.compressor.threshold.value =
        -18;


      this.compressor.knee.value =
        18;


      this.compressor.ratio.value =
        5;


      this.compressor.attack.value =
        0.003;


      this.compressor.release.value =
        0.22;



      this.masterGain =

        this.audioContext
          .createGain();



      // =================================================
      // LOUDER ĐÀN TÍNH
      //
      // OLD:
      // 0.38
      //
      // NEW:
      // 0.64
      //
      // ≈ 1.68 × louder
      // =================================================

      this.masterGain.gain.value =
        5;



      this.masterGain.connect(
        this.compressor
      );


      this.compressor.connect(
        this.audioContext.destination
      );

    }



    if (
      this.audioContext.state === "suspended"
    ) {


      try {


        await this.audioContext.resume();


      }


      catch (
        error
      ) {


        console.warn(

          "PLAY: AUDIO WAITING FOR INPUT.",

          error

        );

      }

    }

  }



  // ====================================================
  // ĐÀN TÍNH STYLE SYNTH
  // ====================================================

  async playTone(
    stringIndex,
    velocity
  ) {


    await this.unlockAudio();



    if (

      !this.audioContext

      ||

      !this.masterGain

      ||

      this.audioContext.state
      !==
      "running"

    ) {


      return;

    }



    const context =
      this.audioContext;


    const now =
      context.currentTime;



    const brightness =

      (

        this.mood

        +

        1

      )

      /

      2;



    const baseFrequencies = [

      110.00,

      146.83,

      196.00

    ];



    const moodPitchScale =

      0.82

      +

      brightness

      *

      0.36;



    const frequency =

      baseFrequencies[
        stringIndex
      ]

      *

      moodPitchScale;



    // ==================================================
    // FILTER
    // ==================================================

    const filter =

      context
        .createBiquadFilter();



    filter.type =
      "lowpass";


    filter.frequency.value =

      620

      +

      brightness

      *

      4300;


    filter.Q.value =

      0.7

      +

      brightness

      *

      1.4;



    // ==================================================
    // ENVELOPE
    // ==================================================

    const envelope =

      context
        .createGain();



    const maximumGain =

      0.025

      +

      velocity

      *

      0.19;



    envelope.gain.setValueAtTime(

      0.0001,

      now

    );



    envelope.gain.exponentialRampToValueAtTime(

      Math.max(

        0.001,

        maximumGain

      ),

      now
      +
      0.012

    );



    envelope.gain.exponentialRampToValueAtTime(

      0.0001,

      now

      +

      1.15

      +

      brightness

      *

      0.28

    );



    // ==================================================
    // FUNDAMENTAL
    // ==================================================

    const fundamental =

      context
        .createOscillator();



    fundamental.type =
      "triangle";


    fundamental.frequency.value =
      frequency;



    // ==================================================
    // HARMONIC
    // ==================================================

    const harmonic =

      context
        .createOscillator();



    harmonic.type =
      "sine";


    harmonic.frequency.value =

      frequency

      *

      2;



    const harmonicGain =

      context
        .createGain();



    harmonicGain.gain.value =

      0.05

      +

      brightness

      *

      0.26;



    // ==================================================
    // ATTACK
    // ==================================================

    const attackOscillator =

      context
        .createOscillator();



    attackOscillator.type =
      "sine";


    attackOscillator.frequency.value =

      frequency

      *

      (

        3.4

        +

        brightness

        *

        1.2

      );



    const attackGain =

      context
        .createGain();



    attackGain.gain.setValueAtTime(

      0.035

      +

      velocity

      *

      0.035,

      now

    );



    attackGain.gain.exponentialRampToValueAtTime(

      0.0001,

      now
      +
      0.055

    );



    // ==================================================
    // CONNECTIONS
    // ==================================================

    fundamental.connect(
      filter
    );


    harmonic.connect(
      harmonicGain
    );


    harmonicGain.connect(
      filter
    );


    attackOscillator.connect(
      attackGain
    );


    attackGain.connect(
      filter
    );


    filter.connect(
      envelope
    );


    envelope.connect(
      this.masterGain
    );



    // ==================================================
    // PLAY
    // ==================================================

    fundamental.start(
      now
    );


    harmonic.start(
      now
    );


    attackOscillator.start(
      now
    );



    fundamental.stop(
      now + 1.55
    );


    harmonic.stop(
      now + 1.55
    );


    attackOscillator.stop(
      now + 0.07
    );

  }



  // ====================================================
  // STOP
  // ====================================================

  stop() {


    this.energies = [

      0,
      0,
      0

    ];



    if (
      this.instance
    ) {


      this.instance.remove();


      this.instance =
        null;

    }



    this.mount.innerHTML =
      "";


    this.started =
      false;

  }

}



// ======================================================
// CLAMP
// ======================================================

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