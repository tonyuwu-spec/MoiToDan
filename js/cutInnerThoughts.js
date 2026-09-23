// ======================================================
// MỜI TỪ ĐÀN
// CUT INNER THOUGHTS
//
// PHASE 1
// ------------------------------------------------------
// Cut_[environment]bg2.png
// User's words float upward.
// Words can be clicked to pop + disappear.
//
// After 5 seconds:
// Cut_chattext1.png appears.
//
// PHASE 2
// ------------------------------------------------------
// Click Cut_chattext1:
//
// words disappear
// Cut_[environment]vid.mp4 begins
// handycam returns
// normal shared camera controls return
//
// Cut_chattext2.png appears.
//
// PHASE 3
// ------------------------------------------------------
// Click Cut_chattext2:
// Cut_chattext3.png appears.
//
// Click Cut_chattext3:
// dispatch cut-complete
// sketch.js moves to DRAW.
// ======================================================


export class CutInnerThoughts {


  constructor(
    options = {}
  ) {


    this.mount =

      options.mount

      ||

      document.getElementById(
        "design-stage"
      )

      ||

      document.body;



    this.state =
      options.state
      ||
      null;



    this.width =
      2560;


    this.height =
      1440;



    this.overlay =
      null;


    this.cameraLayer =
      null;


    this.backgroundImage =
      null;


    this.backgroundVideo =
      null;


    this.wordLayer =
      null;


    this.chatText =
      null;



    this.particles =
      [];


    this.running =
      false;


    this.animationFrame =
      null;


    this.lastFrameTime =
      0;


    this.wordFrameInterval =
      1000 / 30;



    this.phase =
      "idle";


    this.chatTextIndex =
      0;


    this.environment =
      "dawn";


    this.entries =
      [];



    this.chatTextTimer =
      null;


    this.wordCleanupTimer =
      null;


    this.chatSwapTimer =
      null;



    this.boundTick =

      (
        time
      ) => {


        this.tick(
          time
        );

      };



    this.boundChatClick =

      (
        event
      ) => {


        this.handleChatClick(
          event
        );

      };

  }



  // ====================================================
  // ENTER
  // ====================================================

  enter(
    entries = []
  ) {


    this.stop();



    this.entries =

      Array.isArray(
        entries
      )

      ?

      entries

      :

      [];



    this.environment =
      this.getCurrentEnvironment();



    this.phase =
      "haze";


    this.chatTextIndex =
      0;



    if (
      this.state
    ) {


      this.state.cutCameraActive =
        false;


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



    this.createOverlay();


    this.preloadAssets();


    this.createWords(
      this.entries
    );


    this.startWordAnimation();



    requestAnimationFrame(

      () => {


        if (
          !this.overlay
        ) {

          return;

        }


        this.overlay.classList.add(
          "is-visible"
        );

      }

    );



    this.chatTextTimer =

      window.setTimeout(

        () => {


          if (

            !this.overlay

            ||

            this.phase !== "haze"

          ) {

            return;

          }



          this.showChatText(

            1,

            true

          );



          this.chatTextTimer =
            null;

        },

        5000

      );

  }



  // ====================================================
  // ENVIRONMENT
  // ====================================================

  getCurrentEnvironment() {


    const cutWindow =

      document.getElementById(
        "cut-window"
      );



    const environment =

      cutWindow
        ?.dataset
        ?.environment;



    if (

      environment === "dawn"

      ||

      environment === "morning"

      ||

      environment === "dusk"

      ||

      environment === "night"

    ) {


      return environment;

    }



    return "dawn";

  }



  // ====================================================
  // ASSETS
  // ====================================================

  getBackgroundImageSource() {


    return (

      `assets/Cut_${this.environment}bg2.png`

    );

  }



  getVideoSource() {


    return (

      `assets/Cut_${this.environment}vid.mp4`

    );

  }



  getChatTextSource(
    index
  ) {


    return (

      `assets/Cut_chattext${index}.png`

    );

  }



  // ====================================================
  // PRELOAD
  // ====================================================

  preloadAssets() {


    const backgroundImage =
      new Image();


    backgroundImage.src =
      this.getBackgroundImageSource();



    for (
      let i = 1;
      i <= 3;
      i++
    ) {


      const image =
        new Image();


      image.src =
        this.getChatTextSource(
          i
        );

    }



    if (
      this.backgroundVideo
    ) {


      try {


        this.backgroundVideo.load();


      }


      catch (
        error
      ) {


        console.warn(

          "CUT INNER VIDEO PRELOAD FAILED:",

          error

        );

      }

    }

  }



  // ====================================================
  // CREATE DOM
  // ====================================================

  createOverlay() {


    const overlay =

      document.createElement(
        "div"
      );


    overlay.id =
      "cut-inner-thought-overlay";



    const cameraLayer =

      document.createElement(
        "div"
      );


    cameraLayer.id =
      "cut-inner-camera-layer";



    const backgroundImage =

      document.createElement(
        "img"
      );


    backgroundImage.id =
      "cut-inner-bg-image";


    backgroundImage.alt =
      "";


    backgroundImage.draggable =
      false;


    backgroundImage.src =
      this.getBackgroundImageSource();



    const backgroundVideo =

      document.createElement(
        "video"
      );


    backgroundVideo.id =
      "cut-inner-bg-video";


    backgroundVideo.src =
      this.getVideoSource();


    backgroundVideo.autoplay =
      false;


    backgroundVideo.loop =
      true;


    backgroundVideo.muted =
      true;


    backgroundVideo.playsInline =
      true;


    backgroundVideo.preload =
      "auto";



    const wordLayer =

      document.createElement(
        "div"
      );


    wordLayer.id =
      "cut-inner-thought-word-layer";



    const chatText =

      document.createElement(
        "img"
      );


    chatText.id =
      "cut-inner-chattext";


    chatText.alt =
      "";


    chatText.draggable =
      false;



    chatText.addEventListener(

      "click",

      this.boundChatClick

    );



    cameraLayer.appendChild(
      backgroundImage
    );


    cameraLayer.appendChild(
      backgroundVideo
    );


    overlay.appendChild(
      cameraLayer
    );


    overlay.appendChild(
      wordLayer
    );


    overlay.appendChild(
      chatText
    );


    this.mount.appendChild(
      overlay
    );



    this.overlay =
      overlay;


    this.cameraLayer =
      cameraLayer;


    this.backgroundImage =
      backgroundImage;


    this.backgroundVideo =
      backgroundVideo;


    this.wordLayer =
      wordLayer;


    this.chatText =
      chatText;



    this.applySharedCameraTransform();

  }



  // ====================================================
  // WORD EXTRACTION
  // ====================================================

  extractWords(
    text
  ) {


    return (

      text.match(
        /[\p{L}\p{N}'’_-]+/gu
      )

      ||

      []

    );

  }



  // ====================================================
  // CREATE WORDS
  // ====================================================

  createWords(
    entries
  ) {


    if (
      !this.wordLayer
    ) {

      return;

    }



    const sourceWords =
      [];



    for (
      const entry
      of
      entries
    ) {


      if (

        !entry

        ||

        !entry.text

      ) {

        continue;

      }



      const words =

        this.extractWords(
          entry.text
        );



      for (
        const word
        of
        words
      ) {


        sourceWords.push(

          {

            text:
              word,


            analysis:

              entry.analysis

              ||

              null

          }

        );

      }

    }



    if (
      sourceWords.length === 0
    ) {

      return;

    }



    const minimumVisibleWords =
      22;


    const maximumVisibleWords =
      52;



    const targetCount =

      Math.min(

        maximumVisibleWords,

        Math.max(

          minimumVisibleWords,

          sourceWords.length

        )

      );



    for (
      let i = 0;
      i < targetCount;
      i++
    ) {


      const source =

        sourceWords[
          i % sourceWords.length
        ];



      const particle =

        this.createParticle(

          source.text,

          source.analysis,

          true

        );



      this.particles.push(
        particle
      );

    }

  }



  // ====================================================
  // PARTICLE
  // ====================================================

  createParticle(

    word,

    analysis,

    initial

  ) {


    const element =

      document.createElement(
        "span"
      );


    element.className =
      "cut-inner-word";



    const visual =

      document.createElement(
        "span"
      );


    visual.className =
      "cut-inner-word-visual";


    visual.textContent =
      word;



    element.appendChild(
      visual
    );


    this.wordLayer.appendChild(
      element
    );



    const intensity =

      this.clamp01(

        Number(
          analysis?.intensity
        )

        ||

        0.35

      );



    const mixedness =

      this.clamp01(

        Number(
          analysis?.mixedness
        )

        ||

        0

      );



    const normalized =

      this.clampSigned(

        Number(
          analysis?.normalized
        )

        ||

        0

      );



    const minimumSize =

      42

      +

      intensity
      *
      12;



    const maximumSize =

      112

      +

      intensity
      *
      48;



    const fontSize =

      this.random(

        minimumSize,

        maximumSize

      );



    element.style.fontSize =
      `${fontSize}px`;



    const color =

      this.makeEmotionColor(

        analysis,

        normalized,

        mixedness

      );



    element.style.color =

      `rgb(${color[0]}, ${color[1]}, ${color[2]})`;



    const opacity =

      this.random(

        0.58,

        0.96

      );



    element.style.opacity =
      String(
        opacity
      );



    const particle = {


      element,


      visual,


      word,


      analysis,


      dead:
        false,


      x:
        0,


      baseX:
        0,


      y:
        0,


      speed:

        this.random(

          15,

          40

        )

        *

        (

          0.92

          +

          intensity
          *
          0.28

        ),


      driftAmount:

        this.random(

          10,

          48

        )

        *

        (

          0.78

          +

          mixedness
          *
          0.44

        ),


      driftSpeed:

        this.random(

          0.00018,

          0.00055

        ),


      phase:

        this.random(

          0,

          Math.PI * 2

        ),


      fontSize

    };



    element.addEventListener(

      "click",

      (
        event
      ) => {


        event.preventDefault();


        event.stopPropagation();



        this.popParticle(
          particle
        );

      }

    );



    this.resetParticle(

      particle,

      initial

    );



    return particle;

  }



  // ====================================================
  // POP
  // ====================================================

  popParticle(
    particle
  ) {


    if (

      !particle

      ||

      particle.dead

      ||

      this.phase !== "haze"

    ) {

      return;

    }



    particle.dead =
      true;



    particle.element.classList.add(
      "is-popping"
    );



    const index =

      this.particles.indexOf(
        particle
      );



    if (
      index >= 0
    ) {


      this.particles.splice(

        index,

        1

      );

    }



    window.setTimeout(

      () => {


        particle.element
          ?.remove();

      },

      280

    );

  }



  // ====================================================
  // RESET PARTICLE
  // ====================================================

  resetParticle(

    particle,

    initial = false

  ) {


    particle.baseX =

      this.random(

        -140,

        this.width - 40

      );



    particle.x =
      particle.baseX;



    if (
      initial
    ) {


      particle.y =

        this.random(

          -150,

          this.height + 180

        );

    }


    else {


      particle.y =

        this.height

        +

        this.random(

          80,

          420

        );

    }



    particle.phase =

      this.random(

        0,

        Math.PI * 2

      );



    this.positionParticle(
      particle
    );

  }



  // ====================================================
  // ANIMATION
  // ====================================================

  startWordAnimation() {


    this.running =
      true;



    this.lastFrameTime =
      performance.now();



    this.animationFrame =

      requestAnimationFrame(
        this.boundTick
      );

  }



  tick(
    time
  ) {


    if (
      !this.running
    ) {

      return;

    }



    const elapsed =

      time

      -

      this.lastFrameTime;



    if (
      elapsed < this.wordFrameInterval
    ) {


      this.animationFrame =

        requestAnimationFrame(
          this.boundTick
        );


      return;

    }



    const delta =

      Math.min(

        0.065,

        elapsed / 1000

      );



    this.lastFrameTime =
      time;



    for (
      const particle
      of
      this.particles
    ) {


      if (
        particle.dead
      ) {

        continue;

      }



      particle.y -=

        particle.speed
        *
        delta;



      particle.x =

        particle.baseX

        +

        Math.sin(

          time
          *
          particle.driftSpeed

          +

          particle.phase

        )

        *

        particle.driftAmount;



      if (

        particle.y

        <

        -particle.fontSize
        -
        140

      ) {


        this.resetParticle(

          particle,

          false

        );

      }



      this.positionParticle(
        particle
      );

    }



    this.animationFrame =

      requestAnimationFrame(
        this.boundTick
      );

  }



  positionParticle(
    particle
  ) {


    const x =

      Math.round(
        particle.x
      );


    const y =

      Math.round(
        particle.y
      );



    particle.element.style.transform =

      `translate3d(${x}px, ${y}px, 0)`;

  }



  // ====================================================
  // CHAT
  // ====================================================

  showChatText(

    index,

    clickable = false

  ) {


    if (
      !this.chatText
    ) {

      return;

    }



    this.chatTextIndex =
      index;



    this.chatText.classList.remove(
      "is-visible"
    );


    this.chatText.classList.add(
      "is-swapping"
    );


    this.chatText.classList.remove(
      "is-clickable"
    );



    if (
      this.chatSwapTimer
    ) {


      clearTimeout(
        this.chatSwapTimer
      );

    }



    this.chatSwapTimer =

      window.setTimeout(

        () => {


          if (
            !this.chatText
          ) {

            return;

          }



          this.chatText.src =

            this.getChatTextSource(
              index
            );



          requestAnimationFrame(

            () => {


              requestAnimationFrame(

                () => {


                  if (
                    !this.chatText
                  ) {

                    return;

                  }



                  this.chatText.classList.remove(
                    "is-swapping"
                  );


                  this.chatText.classList.add(
                    "is-visible"
                  );



                  if (
                    clickable
                  ) {


                    this.chatText.classList.add(
                      "is-clickable"
                    );

                  }



                  this.chatSwapTimer =
                    null;

                }

              );

            }

          );

        },

        220

      );

  }



  // ====================================================
  // CHAT CLICK
  // ====================================================

  handleChatClick(
    event
  ) {


    event.preventDefault();


    event.stopPropagation();



    // ==================================================
    // TEXT 1 → VIDEO
    // ==================================================

    if (

      this.phase === "haze"

      &&

      this.chatTextIndex === 1

    ) {


      this.enterVideoPhase();


      return;

    }



    // ==================================================
    // TEXT 2 → TEXT 3
    // ==================================================

    if (

      this.phase === "video"

      &&

      this.chatTextIndex === 2

    ) {


      this.showFinalText();


      return;

    }



    // ==================================================
    // TEXT 3 → DRAW SCENE
    // ==================================================

    if (

      this.phase === "final"

      &&

      this.chatTextIndex === 3

    ) {


      this.phase =
        "complete";



      this.chatText.classList.remove(
        "is-clickable"
      );



      document.dispatchEvent(

        new CustomEvent(

          "cut-complete",

          {

            detail: {

              environment:
                this.environment,

              entries:
                this.entries

            }

          }

        )

      );

    }

  }



  // ====================================================
  // VIDEO PHASE
  // ====================================================

  enterVideoPhase() {


    if (

      !this.overlay

      ||

      this.phase !== "haze"

    ) {

      return;

    }



    this.phase =
      "video";



    this.stopWordAnimation();



    if (
      this.wordLayer
    ) {


      this.wordLayer.classList.add(
        "is-leaving"
      );

    }



    document.body.classList.add(
      "cut-chat-active"
    );


    document.body.classList.remove(
      "cut-cutting"
    );



    if (
      this.state
    ) {


      this.state.cutCameraActive =
        true;


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



    this.overlay.classList.add(
      "is-video-phase"
    );



    if (
      this.backgroundVideo
    ) {


      try {


        this.backgroundVideo.currentTime =
          0;



        const playPromise =

          this.backgroundVideo.play();



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

                "CUT INNER VIDEO COULD NOT PLAY:",

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

          "CUT INNER VIDEO PLAY FAILED:",

          error

        );

      }

    }



    this.wordCleanupTimer =

      window.setTimeout(

        () => {


          this.clearWords();


          this.wordCleanupTimer =
            null;

        },

        450

      );



    this.showChatText(

      2,

      true

    );

  }



  // ====================================================
  // FINAL TEXT
  // ====================================================

  showFinalText() {


    if (
      this.phase !== "video"
    ) {

      return;

    }



    this.phase =
      "final";



    // IMPORTANT:
    // Text 3 is now clickable.
    this.showChatText(

      3,

      true

    );

  }



  // ====================================================
  // UPDATE
  // ====================================================

  update(
    now
  ) {


    void now;



    if (

      this.phase !== "video"

      &&

      this.phase !== "final"

    ) {

      return;

    }



    this.applySharedCameraTransform();

  }



  // ====================================================
  // CAMERA
  // ====================================================

  applySharedCameraTransform() {


    if (

      !this.cameraLayer

      ||

      !this.state

    ) {

      return;

    }



    this.cameraLayer.style.transform =

      `translate(-50%, -50%)

       translate3d(
         ${this.state.currentPanX}px,
         ${this.state.currentPanY}px,
         0
       )

       scale(${this.state.currentZoom})`;

  }



  // ====================================================
  // STOP WORDS
  // ====================================================

  stopWordAnimation() {


    this.running =
      false;



    if (
      this.animationFrame
    ) {


      cancelAnimationFrame(
        this.animationFrame
      );

    }



    this.animationFrame =
      null;

  }



  // ====================================================
  // CLEAR WORDS
  // ====================================================

  clearWords() {


    this.stopWordAnimation();



    for (
      const particle
      of
      this.particles
    ) {


      particle.element
        ?.remove();

    }



    this.particles.length =
      0;



    if (
      this.wordLayer
    ) {


      this.wordLayer.innerHTML =
        "";

    }

  }



  // ====================================================
  // COLOR
  // ====================================================

  makeEmotionColor(

    analysis,

    normalized,

    mixedness

  ) {


    const RED = [

      226,

      40,

      28

    ];



    const ORANGE = [

      255,

      119,

      35

    ];



    const YELLOW = [

      255,

      229,

      69

    ];



    const analysisRGB =

      Array.isArray(
        analysis?.rgb
      )

      &&

      analysis.rgb.length >= 3

      ?

      [

        Number(
          analysis.rgb[0]
        ),

        Number(
          analysis.rgb[1]
        ),

        Number(
          analysis.rgb[2]
        )

      ]

      :

      ORANGE;



    let redWeight =

      0.14

      +

      Math.max(
        0,
        -normalized
      )
      *
      1.9

      +

      mixedness
      *
      0.30;



    let yellowWeight =

      0.14

      +

      Math.max(
        0,
        normalized
      )
      *
      1.9

      +

      mixedness
      *
      0.30;



    let orangeWeight =

      0.34

      +

      (
        1
        -
        Math.abs(
          normalized
        )
      )
      *
      1.28

      +

      mixedness
      *
      0.95;



    const total =

      redWeight

      +

      orangeWeight

      +

      yellowWeight;



    redWeight /=
      total;


    orangeWeight /=
      total;


    yellowWeight /=
      total;



    const roll =
      Math.random();



    let selected;



    if (
      roll < redWeight
    ) {


      selected =
        RED;

    }


    else if (

      roll

      <

      redWeight
      +
      orangeWeight

    ) {


      selected =
        ORANGE;

    }


    else {


      selected =
        YELLOW;

    }



    const paletteInfluence =

      this.random(

        0.30,

        0.52

      );



    return [


      this.clampColor(

        analysisRGB[0]

        +

        (
          selected[0]
          -
          analysisRGB[0]
        )

        *

        paletteInfluence

      ),



      this.clampColor(

        analysisRGB[1]

        +

        (
          selected[1]
          -
          analysisRGB[1]
        )

        *

        paletteInfluence

      ),



      this.clampColor(

        analysisRGB[2]

        +

        (
          selected[2]
          -
          analysisRGB[2]
        )

        *

        paletteInfluence

      )

    ];

  }



  // ====================================================
  // STOP
  // ====================================================

  stop() {


    if (
      this.chatTextTimer
    ) {


      clearTimeout(
        this.chatTextTimer
      );

    }



    if (
      this.wordCleanupTimer
    ) {


      clearTimeout(
        this.wordCleanupTimer
      );

    }



    if (
      this.chatSwapTimer
    ) {


      clearTimeout(
        this.chatSwapTimer
      );

    }



    this.chatTextTimer =
      null;


    this.wordCleanupTimer =
      null;


    this.chatSwapTimer =
      null;



    this.clearWords();



    if (
      this.backgroundVideo
    ) {


      try {


        this.backgroundVideo.pause();


        this.backgroundVideo.currentTime =
          0;


      }


      catch (
        error
      ) {


        void error;

      }

    }



    if (
      this.chatText
    ) {


      this.chatText.removeEventListener(

        "click",

        this.boundChatClick

      );

    }



    document.body.classList.remove(
      "cut-chat-active"
    );



    if (
      this.state
    ) {


      this.state.cutCameraActive =
        false;


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



    if (
      this.overlay
    ) {


      this.overlay.remove();

    }



    this.overlay =
      null;


    this.cameraLayer =
      null;


    this.backgroundImage =
      null;


    this.backgroundVideo =
      null;


    this.wordLayer =
      null;


    this.chatText =
      null;



    this.phase =
      "idle";


    this.chatTextIndex =
      0;


    this.entries =
      [];

  }



  // ====================================================
  // HELPERS
  // ====================================================

  random(
    minimum,
    maximum
  ) {


    return (

      minimum

      +

      Math.random()

      *

      (
        maximum
        -
        minimum
      )

    );

  }



  clamp(
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



  clamp01(
    value
  ) {


    return this.clamp(

      value,

      0,

      1

    );

  }



  clampSigned(
    value
  ) {


    return this.clamp(

      value,

      -1,

      1

    );

  }



  clampColor(
    value
  ) {


    return Math.round(

      this.clamp(

        value,

        0,

        255

      )

    );

  }

}