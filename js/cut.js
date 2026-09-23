// ======================================================
// MỜI TỪ ĐÀN
// CUT / SILK SCENE
// ======================================================


import {
  CutSilk
}
from
"./cutSilk.js";


import {
  CutInnerThoughts
}
from
"./cutInnerThoughts.js";



// ======================================================
// MACHINE LEARNING
// ======================================================

const TRANSFORMERS_MODULE_URL =

  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";


const MACHINE_SENTIMENT_MODEL =

  "Xenova/distilbert-base-multilingual-cased-sentiments-student";



let transformersModulePromise =
  null;


let machineClassifierPromise =
  null;


let machineClassifier =
  null;


let machineModelUnavailable =
  false;



async function loadTransformersModule() {


  if (
    transformersModulePromise
  ) {

    return transformersModulePromise;

  }



  transformersModulePromise =

    import(
      TRANSFORMERS_MODULE_URL
    )
    .then(

      (
        module
      ) => {


        if (
          module.env
        ) {


          module.env.allowLocalModels =
            false;

        }



        return module;

      }

    )
    .catch(

      (
        error
      ) => {


        console.warn(

          "CUT ML: Transformers.js could not load. Falling back to rule analysis.",

          error

        );


        return null;

      }

    );



  return transformersModulePromise;

}



async function getMachineClassifier() {


  if (
    machineClassifier
  ) {

    return machineClassifier;

  }



  if (
    machineModelUnavailable
  ) {

    return null;

  }



  if (
    !machineClassifierPromise
  ) {


    machineClassifierPromise =

      (

        async () => {


          const transformers =

            await loadTransformersModule();



          if (

            !transformers

            ||

            typeof transformers.pipeline
            !==
            "function"

          ) {


            machineModelUnavailable =
              true;


            return null;

          }



          try {


            console.log(
              "CUT ML: loading multilingual sentiment model..."
            );



            machineClassifier =

              await transformers.pipeline(

                "text-classification",

                MACHINE_SENTIMENT_MODEL

              );



            console.log(
              "CUT ML: multilingual sentiment model ready."
            );



            return machineClassifier;


          }


          catch (
            error
          ) {


            console.warn(

              "CUT ML: model could not load. Existing rule analysis will be used.",

              error

            );


            machineModelUnavailable =
              true;


            machineClassifier =
              null;


            return null;

          }


        }

      )();

  }



  return machineClassifierPromise;

}



function warmMachineEmotionModel() {


  void getMachineClassifier();

}



// ======================================================
// ENVIRONMENTS
// ======================================================

const CUT_ENVIRONMENTS = {


  dawn: {

    background:
      "assets/Cut_dawnbg.png"

  },


  morning: {

    background:
      "assets/Cut_morningbg.png"

  },


  dusk: {

    background:
      "assets/Cut_duskbg.png"

  },


  night: {

    background:
      "assets/Cut_nightbg.png"

  }

};



// ======================================================
// CHARACTER
// ======================================================

const CUT_TALKS = [

  "assets/Cut_talk1.png",

  "assets/Cut_talk2.png",

  "assets/Cut_talk3.png"

];



// ======================================================
// EMOTION WORDS
// ======================================================

const EMOTION_WORDS = {


  adore: 3.0,
  adored: 3.0,
  adoring: 3.0,
  cherish: 3.0,
  cherished: 3.0,
  beloved: 3.0,
  soulmate: 3.0,
  devoted: 2.8,
  devotion: 2.8,
  grateful: 2.8,
  gratitude: 2.8,
  wonderful: 2.6,
  precious: 2.7,
  beautiful: 2.4,
  safe: 2.5,
  trust: 2.5,
  trusted: 2.5,
  forgive: 2.5,
  forgiven: 2.5,
  proud: 2.4,
  joy: 2.7,
  joyful: 2.7,
  hope: 2.2,
  hopeful: 2.4,
  comfort: 2.3,
  comforting: 2.3,
  warmth: 2.4,
  warm: 2.0,
  peaceful: 2.3,
  peace: 2.2,
  kindness: 2.3,
  kind: 2.0,
  gentle: 2.0,
  loyal: 2.3,
  loyalty: 2.3,
  respect: 2.2,
  respected: 2.2,


  love: 2.6,
  loved: 2.6,
  loving: 2.5,
  care: 1.8,
  cared: 1.8,
  caring: 2.0,
  happy: 2.0,
  happiness: 2.1,
  smile: 1.8,
  smiled: 1.8,
  laugh: 1.8,
  laughed: 1.8,
  laughter: 2.0,
  friend: 1.3,
  friendship: 1.7,
  together: 1.5,
  close: 1.2,
  home: 1.5,
  hug: 1.8,
  hugged: 1.8,
  kiss: 1.8,
  kissed: 1.8,
  sweet: 1.6,
  thankful: 2.2,
  thanks: 1.8,
  remember: 0.5,
  remembered: 0.5,
  memory: 0.3,
  memories: 0.3,
  wish: 0.2,
  wishing: 0.2,


  miss: -0.9,
  missed: -0.9,
  missing: -1.0,
  longing: -1.4,
  yearn: -1.4,
  yearning: -1.5,
  goodbye: -1.2,
  distance: -0.9,
  distant: -0.9,
  apart: -1.1,
  gone: -1.4,
  lost: -1.8,
  regret: -1.8,
  regretted: -1.8,
  sorry: -0.8,
  apology: -0.6,
  apologize: -0.6,


  sad: -1.9,
  sadness: -2.0,
  lonely: -2.2,
  loneliness: -2.2,
  alone: -1.8,
  hurt: -2.1,
  hurting: -2.1,
  pain: -2.3,
  painful: -2.3,
  cry: -1.8,
  cried: -1.9,
  crying: -1.9,
  angry: -2.0,
  anger: -2.1,
  mad: -1.6,
  fear: -2.0,
  afraid: -2.0,
  scared: -2.0,
  shame: -2.1,
  ashamed: -2.1,
  guilty: -1.9,
  guilt: -1.9,
  disappointed: -1.8,
  disappointment: -1.8,
  abandoned: -2.4,
  rejected: -2.2,
  ignored: -1.8,
  forgotten: -1.9,
  jealous: -1.8,
  jealousy: -1.8,
  argument: -1.5,
  fought: -1.7,
  fight: -1.5,


  hate: -3.0,
  hated: -3.0,
  hatred: -3.0,
  despise: -3.0,
  betrayed: -3.0,
  betrayal: -3.0,
  cruel: -2.8,
  cruelty: -2.8,
  toxic: -2.8,
  abused: -3.0,
  abuse: -3.0,
  terrified: -2.8,
  broken: -2.8,
  shattered: -3.0,
  devastated: -3.0,
  devastation: -3.0,
  grief: -2.8,
  grieving: -2.8,
  death: -2.7,
  dead: -2.7,
  died: -2.7,
  nightmare: -2.6,
  worthless: -3.0,
  disgust: -2.7,
  disgusted: -2.7,
  unforgivable: -3.0,


  yêu: 2.7,
  thương: 2.4,
  quý: 2.0,
  vui: 2.0,
  hạnh: 1.8,
  phúc: 1.8,
  biếtơn: 2.5,
  biết: 0.3,
  ơn: 1.5,
  dịu: 1.6,
  ấm: 1.8,
  tin: 1.7,
  tha: 1.5,
  thứ: 1.5,


  nhớ: -0.9,
  buồn: -2.0,
  đau: -2.3,
  côđơn: -2.3,
  cô: -0.8,
  đơn: -0.8,
  ghét: -3.0,
  giận: -2.1,
  sợ: -2.1,
  hối: -1.5,
  tiếc: -1.8,
  mất: -2.0,
  chết: -2.7,
  khóc: -1.9,
  phảnbội: -3.0

};



// ======================================================
// PHRASES
// ======================================================

const EMOTION_PHRASES = {

  "i love you": 3.4,
  "love you": 3.1,
  "thank you": 2.8,
  "proud of you": 2.8,
  "felt safe": 2.7,
  "feel safe": 2.7,
  "you saved me": 3.0,
  "my best friend": 2.5,
  "best friend": 2.3,
  "still love": 2.4,

  "miss you": -1.1,
  "i miss you": -1.2,
  "wish you were here": -1.8,
  "want you back": -1.6,
  "never came back": -2.4,
  "let me down": -2.4,
  "broke my heart": -3.4,
  "broken heart": -3.0,
  "hate you": -3.3,
  "never forgive": -3.0,
  "left me": -2.2,
  "you left": -2.2,
  "lost you": -2.5,
  "i lost you": -2.7,
  "rest in peace": -1.8,

  "yêu bạn": 3.0,
  "yêu em": 3.0,
  "yêu anh": 3.0,
  "nhớ bạn": -1.2,
  "nhớ em": -1.2,
  "nhớ anh": -1.2,
  "ghét bạn": -3.1,
  "ghét em": -3.1,
  "ghét anh": -3.1

};



// ======================================================
// SENTENCE CONTEXT
// ======================================================

const CONTEXT_PATTERNS = [


  {
    pattern:
      /\bi\s+(?:still\s+)?(?:love|adore|cherish)\s+(?:you|him|her|them)\b/iu,
    score:
      3.1,
    label:
      "direct affection"
  },


  {
    pattern:
      /\bi\s+(?:still\s+)?care\s+(?:about|for)\s+(?:you|him|her|them)\b/iu,
    score:
      2.6,
    label:
      "continued care"
  },


  {
    pattern:
      /\byou\s+(?:make|made)\s+me\s+(?:feel\s+)?(?:safe|happy|loved|seen|understood|calm)\b/iu,
    score:
      3.0,
    label:
      "positive impact"
  },


  {
    pattern:
      /\bi\s+(?:am|'m|was)\s+(?:so\s+|very\s+|really\s+)?(?:glad|grateful|thankful)\b/iu,
    score:
      2.7,
    label:
      "gratitude"
  },


  {
    pattern:
      /\bi\s+forgive\s+(?:you|him|her|them)\b/iu,
    score:
      2.5,
    label:
      "forgiveness"
  },


  {
    pattern:
      /\byou\s+(?:mean|meant)\s+(?:so\s+)?much\s+to\s+me\b/iu,
    score:
      3.0,
    label:
      "deep attachment"
  },


  {
    pattern:
      /\bi\s+(?:will\s+)?always\s+(?:remember|love|cherish)\b/iu,
    score:
      2.5,
    label:
      "lasting affection"
  },


  {
    pattern:
      /\bi\s+(?:still\s+)?miss\s+(?:you|him|her|them)\b/iu,
    score:
      -1.5,
    label:
      "longing"
  },


  {
    pattern:
      /\bi\s+wish\s+(?:you|he|she|they)\s+(?:were|was)\s+here\b/iu,
    score:
      -2.0,
    label:
      "absence longing"
  },


  {
    pattern:
      /\bi\s+wish\s+i\s+could\s+(?:see|hold|hug|talk\s+to)\b/iu,
    score:
      -1.8,
    label:
      "longing action"
  },


  {
    pattern:
      /\bi\s+keep\s+thinking\s+about\s+(?:you|him|her|them)\b/iu,
    score:
      -1.0,
    label:
      "persistent remembrance"
  },


  {
    pattern:
      /\byou\s+(?:hurt|betrayed|abandoned|left)\s+me\b/iu,
    score:
      -3.1,
    label:
      "relational harm"
  },


  {
    pattern:
      /\byou\s+(?:make|made)\s+me\s+(?:feel\s+)?(?:sad|alone|lonely|afraid|scared|worthless|small)\b/iu,
    score:
      -3.0,
    label:
      "negative impact"
  },


  {
    pattern:
      /\bi\s+(?:cannot|can't|cant|don't|dont|never)\s+forgive\s+(?:you|him|her|them)?\b/iu,
    score:
      -3.0,
    label:
      "refusal to forgive"
  },


  {
    pattern:
      /\bi\s+(?:cannot|can't|cant|don't|dont)\s+trust\s+(?:you|him|her|them)?\b/iu,
    score:
      -2.7,
    label:
      "lost trust"
  },


  {
    pattern:
      /\bi\s+wish\s+i\s+(?:never|hadn't|hadnt)\b/iu,
    score:
      -2.4,
    label:
      "regret"
  },


  {
    pattern:
      /\bi\s+(?:feel|felt)\s+(?:so\s+|very\s+|really\s+)?(?:hurt|angry|betrayed|abandoned|alone|lonely)\b/iu,
    score:
      -2.6,
    label:
      "negative emotional state"
  },


  {
    pattern:
      /(?:tôi|mình|em|anh)\s+(?:vẫn\s+)?(?:yêu|thương)\s+(?:bạn|em|anh|người ấy)/iu,
    score:
      3.0,
    label:
      "vietnamese affection"
  },


  {
    pattern:
      /(?:tôi|mình|em|anh)\s+(?:vẫn\s+)?nhớ\s+(?:bạn|em|anh|người ấy)/iu,
    score:
      -1.5,
    label:
      "vietnamese longing"
  },


  {
    pattern:
      /(?:bạn|em|anh|người ấy)\s+(?:đã\s+)?(?:làm tổn thương|phản bội|bỏ rơi)\s+(?:tôi|mình|em|anh)/iu,
    score:
      -3.1,
    label:
      "vietnamese relational harm"
  }

];



// ======================================================
// NEGATORS
// ======================================================

const NEGATORS =

  new Set([

    "not",
    "never",
    "no",
    "dont",
    "don't",
    "didnt",
    "didn't",
    "cannot",
    "cant",
    "can't",
    "isnt",
    "isn't",
    "wasnt",
    "wasn't",
    "without",

    "không",
    "chẳng",
    "chưa"

  ]);



// ======================================================
// INTENSIFIERS
// ======================================================

const INTENSIFIERS = {

  very: 1.45,
  really: 1.40,
  deeply: 1.60,
  extremely: 1.75,
  incredibly: 1.65,
  completely: 1.55,
  absolutely: 1.65,
  truly: 1.35,
  so: 1.25,
  always: 1.20,
  too: 1.20,

  rất: 1.50,
  quá: 1.45,
  cực: 1.55,
  thật: 1.30

};



// ======================================================
// DIMINISHERS
// ======================================================

const DIMINISHERS = {

  slightly: 0.70,
  little: 0.78,
  maybe: 0.72,
  perhaps: 0.72,
  somewhat: 0.74,
  kindof: 0.75,
  kinda: 0.75,

  hơi: 0.72,
  chút: 0.76

};



// ======================================================
// CONTRAST
// ======================================================

const CONTRAST_MARKERS = [

  "however",
  "although",
  "whereas",
  "though",
  "but",
  "yet",

  "tuy nhiên",
  "mặc dù",
  "nhưng",
  "dù",
  "tuy"

];



// ======================================================
// CUT SCENE
// ======================================================

export class CutScene {


  constructor(
    options
  ) {


    this.state =
      options.state;


    this.window =
      options.window;


    this.board =
      options.board;


    this.background =
      options.background;


    this.talkArt =
      options.talkArt;


    this.textBox =
      options.textBox;


    this.inputPanel =
      options.inputPanel;


    this.input =
      options.input;


    this.addButton =
      options.addButton;


    this.finishButton =
      options.finishButton;


    this.modeHint =
      options.modeHint;


    this.silkMount =
      options.silkMount;



    this.getHandState =
      options.getHandState
      ||
      (() => null);


    this.getAudioLevel =
      options.getAudioLevel
      ||
      (() => 0);



    this.selectedEnvironment =
      "dawn";


    this.finished =
      false;


    this.addCount =
      0;


    this.entries =
      [];


    this.lastTalkIndex =
      0;


    this.lastResponseTextIndex =
      1;


    this.firstTextTimer =
      null;


    this.textSwapTimer =
      null;


    this.textTransitioning =
      false;


    this.preloaded =
      false;



    // ==================================================
    // MACHINE
    // ==================================================

    this.analyzing =
      false;


    this.analysisGeneration =
      0;


    this.defaultAddButtonText =

      this.addButton.textContent;



    // ==================================================
    // INNER THOUGHT
    // ==================================================

    this.innerThoughtActive =
      false;


    this.text6Ready =
      false;



    this.innerThoughts =

      new CutInnerThoughts(

        {

          mount:

            document.getElementById(
              "design-stage"
            )

            ||

            this.window,


          // NEW:
          // let inner-thought camera mirror the shared
          // zoom state without touching sketch.js.

          state:
            this.state

        }

      );



    // ==================================================
    // SILK
    // ==================================================

    this.silk =

      new CutSilk(

        "cut-silk-mount",

        {

          getAudioLevel:

            () => {


              return this.getAudioLevel();

            }

        }

      );



    // ==================================================
    // ADD
    // ==================================================

    this.addButton.addEventListener(

      "click",

      (
        event
      ) => {


        event.stopPropagation();


        void this.addThought();

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


        event.stopPropagation();


        this.finishThoughts();

      }

    );



    // ==================================================
    // TEXT 6 → INNER THOUGHT
    // ==================================================

    this.textBox.addEventListener(

      "click",

      (
        event
      ) => {


        if (

          !this.state.cutRunning

          ||

          !this.finished

          ||

          !this.text6Ready

          ||

          this.innerThoughtActive

        ) {

          return;

        }



        event.preventDefault();


        event.stopPropagation();



        this.enterInnerThought();

      }

    );



    // ==================================================
    // CTRL / CMD + ENTER
    // ==================================================

    this.input.addEventListener(

      "keydown",

      (
        event
      ) => {


        if (

          event.key === "Enter"

          &&

          (

            event.ctrlKey

            ||

            event.metaKey

          )

        ) {


          event.preventDefault();


          void this.addThought();

        }

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



    const sources = [

      "assets/Cut_dawnbg.png",

      "assets/Cut_morningbg.png",

      "assets/Cut_duskbg.png",

      "assets/Cut_nightbg.png",

      ...CUT_TALKS

    ];



    for (
      let i = 1;
      i <= 6;
      i++
    ) {


      sources.push(

        `assets/Cut_talktext${i}.png`

      );


      sources.push(

        `assets/Cut_text${i}.png`

      );

    }



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
  // ENVIRONMENT
  // ====================================================

  applyEnvironment(
    environmentName
  ) {


    let safeEnvironment =
      environmentName;



    if (
      !CUT_ENVIRONMENTS[
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



    this.background.src =

      CUT_ENVIRONMENTS[
        safeEnvironment
      ].background;

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



    this.preload();



    warmMachineEmotionModel();



    this.state.introRunning =
      false;


    this.state.talkRunning =
      false;


    this.state.roomRunning =
      false;


    this.state.cutRunning =
      true;


    this.state.cameraControlsActive =
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



    document.body.classList.add(
      "recording-active"
    );


    document.body.classList.add(
      "cut-active"
    );


    document.body.classList.remove(
      "cut-cutting"
    );


    document.body.classList.remove(
      "cut-chat-active"
    );



    this.reset();



    this.silk.start();


    this.silk.reset();


    this.silk.setCutEnabled(
      false
    );



    this.firstTextTimer =

      window.setTimeout(

        () => {


          this.showText();


          this.firstTextTimer =
            null;

        },

        850

      );

  }



  // ====================================================
  // RESET
  // ====================================================

  reset() {


    this.clearTimers();



    this.analysisGeneration++;



    this.setAnalyzing(
      false
    );



    this.innerThoughts.stop();



    this.innerThoughtActive =
      false;


    this.text6Ready =
      false;



    this.finished =
      false;


    this.addCount =
      0;


    this.entries =
      [];


    this.lastTalkIndex =
      0;


    this.lastResponseTextIndex =
      1;


    this.textTransitioning =
      false;



    this.talkArt.src =
      CUT_TALKS[0];


    this.talkArt.style.opacity =
      "";



    this.setTextImage(
      1
    );



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping",

      "cut-next-ready"

    );


    this.textBox.style.opacity =
      "";



    this.inputPanel.classList.remove(

      "is-hidden",

      "is-error"

    );



    this.modeHint.classList.remove(
      "is-visible"
    );



    this.input.value =
      "";



    this.silk.reset();



    this.silk.setCutEnabled(
      false
    );

  }



  // ====================================================
  // MACHINE UI
  // ====================================================

  setAnalyzing(
    active
  ) {


    this.analyzing =
      Boolean(
        active
      );



    this.addButton.disabled =
      this.analyzing;


    this.finishButton.disabled =
      this.analyzing;


    this.input.readOnly =
      this.analyzing;



    this.addButton.textContent =

      this.analyzing

      ?

      "ANALYZING..."

      :

      this.defaultAddButtonText;

  }



  // ====================================================
  // TIMERS
  // ====================================================

  clearTimers() {


    if (
      this.firstTextTimer
    ) {


      clearTimeout(
        this.firstTextTimer
      );

    }



    if (
      this.textSwapTimer
    ) {


      clearTimeout(
        this.textSwapTimer
      );

    }



    this.firstTextTimer =
      null;


    this.textSwapTimer =
      null;

  }



  // ====================================================
  // TEXT
  // ====================================================

  showText() {


    this.textBox.classList.remove(
      "is-swapping"
    );


    this.textBox.classList.add(
      "is-visible"
    );

  }



  setTextImage(
    index
  ) {


    setImageWithFallback(

      this.textBox,

      [

        `assets/Cut_talktext${index}.png`,

        `assets/Cut_text${index}.png`

      ]

    );

  }



  changeText(
    index
  ) {


    if (
      this.textTransitioning
    ) {

      return;

    }



    this.textTransitioning =
      true;



    this.textBox.classList.add(
      "is-swapping"
    );



    this.textSwapTimer =

      window.setTimeout(

        () => {


          this.setTextImage(
            index
          );



          requestAnimationFrame(

            () => {


              requestAnimationFrame(

                () => {


                  this.textBox.classList.remove(
                    "is-swapping"
                  );


                  this.textTransitioning =
                    false;


                  this.textSwapTimer =
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
  // ADD THOUGHT
  // ====================================================

  async addThought() {


    if (

      !this.state.cutRunning

      ||

      this.finished

      ||

      this.analyzing

    ) {

      return;

    }



    const text =

      this.input.value
        .trim();



    if (
      !text
    ) {


      this.showInputError();


      return;

    }



    const analysisGeneration =

      this.analysisGeneration;



    this.setAnalyzing(
      true
    );



    let analysis;



    try {


      analysis =

        await analyzeEmotion(
          text
        );


    }


    catch (
      error
    ) {


      console.warn(

        "CUT ML analysis failed. Using rule analyzer.",

        error

      );



      analysis =

        analyzeEmotionRules(
          text
        );


      analysis.machineUsed =
        false;


      analysis.analysisSource =
        "rules-fallback";


      analysis.machine =
        null;

    }



    if (

      analysisGeneration
      !==
      this.analysisGeneration

      ||

      !this.state.cutRunning

      ||

      this.finished

    ) {


      if (
        analysisGeneration
        ===
        this.analysisGeneration
      ) {


        this.setAnalyzing(
          false
        );

      }



      return;

    }



    this.entries.push(

      {

        text,

        analysis

      }

    );



    this.silk.addThought(

      text,

      analysis

    );



    this.addCount++;



    const talkIndex =

      randomDifferentIndex(

        0,

        2,

        this.lastTalkIndex

      );



    this.lastTalkIndex =
      talkIndex;



    this.talkArt.src =
      CUT_TALKS[talkIndex];



    const responseTextIndex =

      randomDifferentIndex(

        2,

        5,

        this.lastResponseTextIndex

      );



    this.lastResponseTextIndex =
      responseTextIndex;



    this.changeText(
      responseTextIndex
    );



    this.input.value =
      "";



    this.setAnalyzing(
      false
    );



    this.input.focus();



    console.log(

      "CUT HYBRID EMOTION ANALYSIS:",

      {

        source:
          analysis.analysisSource,


        finalNormalized:
          analysis.normalized,


        finalIntensity:
          analysis.intensity,


        finalComplexity:
          analysis.complexity,


        splitCount:
          analysis.splitCount,


        splitScale:
          analysis.splitScale,


        finalRGB:
          analysis.rgb,


        lexicalNormalized:
          analysis.lexicalNormalized,


        machineNormalized:
          analysis.machineNormalized,


        machineConfidence:
          analysis.machineConfidence,


        machineProbabilities:
          analysis.machineProbabilities,


        mixedness:
          analysis.mixedness,


        positiveMass:
          analysis.positiveMass,


        negativeMass:
          analysis.negativeMass,


        matches:
          analysis.matches,


        sentenceResults:
          analysis.sentenceResults,


        machineUnits:
          analysis.machineUnits

      }

    );

  }



  // ====================================================
  // INPUT ERROR
  // ====================================================

  showInputError() {


    this.inputPanel.classList.remove(
      "is-error"
    );



    void this.inputPanel.offsetWidth;



    this.inputPanel.classList.add(
      "is-error"
    );



    this.input.focus();

  }



  // ====================================================
  // FINISH
  // ====================================================

  finishThoughts() {


    if (

      !this.state.cutRunning

      ||

      this.finished

      ||

      this.analyzing

    ) {

      return;

    }



    this.finished =
      true;



    this.text6Ready =
      false;



    this.textBox.classList.remove(
      "cut-next-ready"
    );



    this.inputPanel.classList.add(
      "is-hidden"
    );



    this.talkArt.src =
      CUT_TALKS[0];



    this.changeText(
      6
    );



    this.silk.setCutEnabled(
      true
    );



    document.body.classList.add(
      "cut-cutting"
    );



    window.setTimeout(

      () => {


        if (
          !this.state.cutRunning
        ) {

          return;

        }



        this.modeHint.classList.add(
          "is-visible"
        );



        this.text6Ready =
          true;



        this.textBox.classList.add(
          "cut-next-ready"
        );

      },

      430

    );

  }



  // ====================================================
  // ENTER INNER THOUGHT
  // ====================================================

  enterInnerThought() {


    if (

      this.innerThoughtActive

      ||

      !this.finished

      ||

      !this.text6Ready

    ) {

      return;

    }



    this.innerThoughtActive =
      true;



    this.text6Ready =
      false;



    this.textBox.classList.remove(
      "cut-next-ready"
    );



    // ==================================================
    // IMPORTANT PERFORMANCE CHANGE
    //
    // The silk is no longer needed after entering the
    // memory/thought section.
    //
    // Completely destroy that isolated p5 instance
    // instead of leaving a hidden 780 × 780 simulation
    // updating underneath the blur.
    // ==================================================

    this.silk.setCutEnabled(
      false
    );


    this.silk.stop();



    this.modeHint.classList.remove(
      "is-visible"
    );



    this.talkArt.style.opacity =
      "0";


    this.textBox.style.opacity =
      "0";



    document.body.classList.remove(
      "cut-cutting"
    );



    this.innerThoughts.enter(
      this.entries
    );

  }



  // ====================================================
  // UPDATE
  // ====================================================

  update(
    now
  ) {


    if (
      !this.state.cutRunning
    ) {

      return;

    }



    // ==================================================
    // INNER THOUGHT / VIDEO HAND CAMERA
    //
    // Uses the SAME getHandState supplied by sketch.js.
    //
    // No additional hand model is created.
    // ==================================================

    if (
      this.innerThoughtActive
    ) {


      const hand =

        this.getHandState();



      this.innerThoughts.update(

        now,

        hand

      );


      return;

    }



    // ==================================================
    // SILK CUTTING
    // ==================================================

    if (
      !this.finished
    ) {

      return;

    }



    const hand =

      this.getHandState();



    if (

      !hand

      ||

      !hand.active

      ||

      !hand.visible

    ) {

      return;

    }



    const pointerGesture =

      hand.fingerCount === 1;



    const moveGesture =

      hand.fingerCount >= 5;



    if (

      !pointerGesture

      &&

      !moveGesture

    ) {

      return;

    }



    const rect =

      this.silkMount
        .getBoundingClientRect();



    if (

      rect.width <= 0

      ||

      rect.height <= 0

    ) {

      return;

    }



    const localX =

      (
        hand.x
        -
        rect.left
      )

      /
      rect.width

      *
      780;



    const localY =

      (
        hand.y
        -
        rect.top
      )

      /
      rect.height

      *
      780;



    if (

      localX < 0

      ||

      localY < 0

      ||

      localX > 780

      ||

      localY > 780

    ) {

      return;

    }



    const radius =

      moveGesture

      ?

      28

      :

      19;



    this.silk.cutAt(

      localX,

      localY,

      radius

    );

  }



  // ====================================================
  // EXIT
  // ====================================================

  async exit() {


    this.state.cutRunning =
      false;



    this.analysisGeneration++;



    this.setAnalyzing(
      false
    );



    this.clearTimers();



    this.innerThoughts.stop();



    this.innerThoughtActive =
      false;


    this.text6Ready =
      false;



    this.state.handPanActive =
      false;


    this.state.handPanX =
      0;


    this.state.handPanY =
      0;


    this.state.targetZoom =
      1;


    this.state.currentZoom =
      1;


    this.state.currentPanX =
      0;


    this.state.currentPanY =
      0;



    this.textBox.classList.remove(

      "is-visible",

      "is-swapping",

      "cut-next-ready"

    );



    this.textBox.style.opacity =
      "";


    this.talkArt.style.opacity =
      "";



    this.modeHint.classList.remove(
      "is-visible"
    );



    this.inputPanel.classList.remove(

      "is-hidden",

      "is-error"

    );



    // Safe even if enterInnerThought already stopped it.

    this.silk.stop();



    document.body.classList.remove(
      "cut-active"
    );


    document.body.classList.remove(
      "cut-cutting"
    );


    document.body.classList.remove(
      "cut-chat-active"
    );

  }

}



// ======================================================
// HYBRID EMOTION ANALYSIS
// ======================================================

async function analyzeEmotion(
  originalText
) {


  const rules =

    analyzeEmotionRules(
      originalText
    );



  let machine =
    null;



  try {


    machine =

      await analyzeMachineEmotion(
        originalText
      );


  }


  catch (
    error
  ) {


    console.warn(

      "CUT ML inference error:",

      error

    );


    machine =
      null;

  }



  if (
    !machine
  ) {


    return {

      ...rules,


      machineUsed:
        false,


      analysisSource:
        "rules",


      lexicalNormalized:
        rules.normalized,


      machineNormalized:
        null,


      machineConfidence:
        null,


      machineProbabilities:
        null,


      machineUnits:
        [],


      machine:
        null

    };

  }



  let machineWeight =

    0.62

    +

    machine.confidence
    *
    0.16;



  if (
    rules.matches === 0
  ) {


    machineWeight =

      Math.max(

        machineWeight,

        0.80

      );

  }



  if (

    machine.probabilities.neutral
    >
    0.64

    &&

    rules.matches >= 2

  ) {


    machineWeight -=
      0.10;

  }



  machineWeight =

    clamp(

      machineWeight,

      0.52,

      0.82

    );



  const ruleWeight =

    1
    -
    machineWeight;



  let normalized =

    rules.normalized
    *
    ruleWeight

    +

    machine.normalized
    *
    machineWeight;



  normalized =

    clamp01Signed(
      normalized
    );



  const mixedness =

    clamp01(

      Math.max(

        rules.mixedness,

        machine.mixedness
        *
        0.96

      )

    );



  normalized *=

    1

    -

    mixedness
    *
    0.10;



  normalized =

    clamp01Signed(
      normalized
    );



  const intensity =

    clamp01(

      rules.intensity
      *
      0.43

      +

      machine.intensity
      *
      0.57

      +

      mixedness
      *
      0.06

    );



  const complexity =

    clamp01(

      rules.complexity
      *
      0.76

      +

      machine.mixedness
      *
      0.16

      +

      machine.uncertainty
      *
      0.08

    );



  const splitCount =

    Math.round(

      rules.splitCount

      +

      machine.mixedness
      *
      2.0

      +

      machine.uncertainty
      *
      0.7

    );



  const splitScale =

    clamp(

      rules.splitScale

      *

      (

        0.94

        +

        complexity
        *
        0.12

      ),

      0.70,

      1.45

    );



  const rgb =

    emotionColorFromNormalized(
      normalized
    );



  return {

    score:
      rules.score,


    normalized,


    intensity,


    complexity,


    splitCount:

      clamp(

        splitCount,

        2,

        14

      ),


    splitScale,


    positiveMass:
      rules.positiveMass,


    negativeMass:
      rules.negativeMass,


    mixedness,


    rgb,


    matches:
      rules.matches,


    sentenceResults:
      rules.sentenceResults,


    machineUsed:
      true,


    analysisSource:
      "hybrid-machine+rules",


    lexicalNormalized:
      rules.normalized,


    machineNormalized:
      machine.normalized,


    machineConfidence:
      machine.confidence,


    machineProbabilities:
      machine.probabilities,


    machineUnits:
      machine.units,


    machine

  };

}



// ======================================================
// MACHINE ANALYSIS
// ======================================================

async function analyzeMachineEmotion(
  originalText
) {


  const classifier =

    await getMachineClassifier();



  if (
    !classifier
  ) {

    return null;

  }



  const wholeRaw =

    await classifier(

      originalText,

      {

        top_k:
          null

      }

    );



  const whole =

    normalizeMachineClassification(
      wholeRaw
    );



  if (
    !whole
  ) {

    return null;

  }



  const units =

    buildMachineAnalysisUnits(
      originalText
    );



  const unitResults =
    [];



  const maximumUnits =
    8;



  for (
    let i = 0;
    i < Math.min(
      units.length,
      maximumUnits
    );
    i++
  ) {


    const unit =
      units[i];



    try {


      const raw =

        await classifier(

          unit.text,

          {

            top_k:
              null

          }

        );



      const result =

        normalizeMachineClassification(
          raw
        );



      if (
        result
      ) {


        unitResults.push(

          {

            text:
              unit.text,


            weight:
              unit.weight,


            ...result

          }

        );

      }


    }


    catch (
      error
    ) {


      console.warn(

        "CUT ML unit analysis skipped:",

        unit.text,

        error

      );

    }

  }



  let weightedValence =
    0;


  let weightedEmotionality =
    0;


  let weightedConfidence =
    0;


  let totalWeight =
    0;


  let positiveSignal =
    0;


  let negativeSignal =
    0;



  for (
    const unit
    of
    unitResults
  ) {


    const weight =

      Math.max(
        0.1,
        unit.weight
      );



    weightedValence +=

      unit.valence
      *
      weight;



    weightedEmotionality +=

      unit.emotionality
      *
      weight;



    weightedConfidence +=

      unit.confidence
      *
      weight;



    totalWeight +=
      weight;



    if (
      unit.valence > 0.08
    ) {


      positiveSignal +=

        unit.valence
        *
        weight;

    }


    else if (
      unit.valence < -0.08
    ) {


      negativeSignal +=

        Math.abs(
          unit.valence
        )
        *
        weight;

    }

  }



  let unitValence =
    whole.valence;


  let unitEmotionality =
    whole.emotionality;


  let unitConfidence =
    whole.confidence;



  if (
    totalWeight > 0
  ) {


    unitValence =

      weightedValence
      /
      totalWeight;



    unitEmotionality =

      weightedEmotionality
      /
      totalWeight;



    unitConfidence =

      weightedConfidence
      /
      totalWeight;

  }



  let normalized =

    whole.valence
    *
    0.58

    +

    unitValence
    *
    0.42;



  let crossUnitMixedness =
    0;



  if (

    positiveSignal > 0

    &&

    negativeSignal > 0

  ) {


    crossUnitMixedness =

      Math.min(

        positiveSignal,

        negativeSignal

      )

      /

      Math.max(

        positiveSignal,

        negativeSignal

      );

  }



  const wholeProbabilityConflict =

    clamp01(

      Math.min(

        whole.positive,

        whole.negative

      )

      *
      2.2

    );



  const mixedness =

    clamp01(

      Math.max(

        crossUnitMixedness,

        wholeProbabilityConflict

      )

    );



  normalized *=

    1

    -

    mixedness
    *
    0.14;



  normalized =

    clamp01Signed(
      normalized
    );



  const intensity =

    clamp01(

      whole.emotionality
      *
      0.56

      +

      unitEmotionality
      *
      0.44

    );



  const confidence =

    clamp01(

      whole.confidence
      *
      0.60

      +

      unitConfidence
      *
      0.40

    );



  const uncertainty =

    clamp01(

      1
      -
      confidence

    );



  return {

    normalized,


    intensity,


    mixedness,


    confidence,


    uncertainty,


    probabilities: {

      positive:
        whole.positive,


      neutral:
        whole.neutral,


      negative:
        whole.negative

    },


    whole,


    units:
      unitResults

  };

}



// ======================================================
// MACHINE UNITS
// ======================================================

function buildMachineAnalysisUnits(
  originalText
) {


  const sentences =

    splitEmotionSentences(
      originalText
    );



  const units =
    [];



  for (
    const sentence
    of
    sentences
  ) {


    const normalizedSentence =

      normalizeAnalysisText(
        sentence
      );



    const clauses =

      splitContrastClauses(
        normalizedSentence
      );



    if (
      clauses.length > 1
    ) {


      for (
        const clause
        of
        clauses
      ) {


        if (
          clause.text.length < 2
        ) {

          continue;

        }



        units.push(

          {

            text:
              clause.text,


            weight:
              clause.weight

          }

        );

      }



      continue;

    }



    if (
      sentence.trim().length > 1
    ) {


      units.push(

        {

          text:
            sentence.trim(),


          weight:
            1

        }

      );

    }

  }



  return units;

}



// ======================================================
// NORMALIZE MACHINE OUTPUT
// ======================================================

function normalizeMachineClassification(
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



  positive /=
    total;


  neutral /=
    total;


  negative /=
    total;



  const valence =

    clamp01Signed(

      positive
      -
      negative

    );



  const confidence =

    Math.max(

      positive,

      neutral,

      negative

    );



  const emotionality =

    clamp01(

      positive
      +
      negative

    );



  return {

    positive,

    neutral,

    negative,

    valence,

    confidence,

    emotionality

  };

}



// ======================================================
// RULE ANALYSIS
// ======================================================

function analyzeEmotionRules(
  originalText
) {


  const normalizedText =

    normalizeAnalysisText(
      originalText
    );



  const allTokens =

    tokenizeEmotionText(
      normalizedText
    );



  const sentences =

    splitEmotionSentences(
      originalText
    );



  let totalScore =
    0;


  let positiveMass =
    0;


  let negativeMass =
    0;


  let matches =
    0;



  const sentenceResults =
    [];



  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex++
  ) {


    const sentence =

      sentences[
        sentenceIndex
      ];



    const result =

      analyzeSentence(
        sentence
      );



    const positionAmount =

      sentences.length <= 1

      ?

      0

      :

      sentenceIndex
      /
      (
        sentences.length - 1
      );



    const sentenceWeight =

      1

      +

      positionAmount
      *
      0.10;



    totalScore +=

      result.score
      *
      sentenceWeight;



    positiveMass +=

      result.positiveMass
      *
      sentenceWeight;



    negativeMass +=

      result.negativeMass
      *
      sentenceWeight;



    matches +=
      result.matches;



    sentenceResults.push(

      {

        text:
          sentence,


        score:
          result.score,


        positiveMass:
          result.positiveMass,


        negativeMass:
          result.negativeMass,


        matches:
          result.matches,


        contexts:
          result.contexts

      }

    );

  }



  const exclamationCount =

    (

      originalText.match(
        /!/g
      )

      ||

      []

    ).length;



  const repeatedPunctuation =

    /[!?]{2,}/.test(
      originalText
    );



  const uppercaseWords =

    (

      originalText.match(
        /\b[A-ZÀ-Ỹ]{3,}\b/g
      )

      ||

      []

    ).length;



  const emotionalMass =

    positiveMass

    +

    negativeMass;



  let mixedness =
    0;



  if (

    positiveMass > 0

    &&

    negativeMass > 0

  ) {


    mixedness =

      Math.min(

        positiveMass,

        negativeMass

      )

      /

      Math.max(

        positiveMass,

        negativeMass

      );

  }



  let normalized =
    0;



  if (
    emotionalMass > 0
  ) {


    normalized =

      totalScore

      /

      (

        emotionalMass

        +

        1.2

      );



    normalized =

      Math.tanh(

        normalized
        *
        2.1

      );



    normalized *=

      1

      -

      mixedness
      *
      0.28;

  }



  normalized =

    clamp01Signed(
      normalized
    );



  let intensity =
    0.14;



  if (
    emotionalMass > 0
  ) {


    intensity =

      0.19

      +

      Math.min(

        emotionalMass

        /

        (

          matches
          *
          4.2

          +

          3

        ),

        0.52

      )

      +

      Math.min(

        matches
        /
        18,

        0.16

      )

      +

      Math.min(

        exclamationCount
        *
        0.035,

        0.10

      )

      +

      Math.min(

        uppercaseWords
        *
        0.025,

        0.08

      )

      +

      (

        repeatedPunctuation

        ?

        0.05

        :

        0

      );

  }



  intensity =

    clamp01(
      intensity
    );



  const wordCount =
    allTokens.length;



  const sentenceCount =

    Math.max(

      1,

      sentences.length

    );



  const uniqueWords =

    new Set(
      allTokens
    ).size;



  const lexicalDiversity =

    wordCount > 0

    ?

    uniqueWords
    /
    wordCount

    :

    0;



  const lengthFactor =

    clamp01(

      wordCount
      /
      70

    );



  const sentenceFactor =

    clamp01(

      sentenceCount
      /
      6

    );



  const complexity =

    clamp01(

      lengthFactor
      *
      0.43

      +

      sentenceFactor
      *
      0.20

      +

      lexicalDiversity
      *
      0.15

      +

      intensity
      *
      0.14

      +

      mixedness
      *
      0.08

    );



  const splitCount =

    Math.round(

      2

      +

      complexity
      *
      8

      +

      intensity
      *
      2.2

      +

      Math.min(

        sentenceCount
        -
        1,

        2

      )

    );



  const splitScale =

    0.72

    +

    complexity
    *
    0.52

    +

    intensity
    *
    0.18;



  const rgb =

    emotionColorFromNormalized(
      normalized
    );



  return {

    score:
      totalScore,


    normalized,


    intensity,


    complexity,


    splitCount:

      clamp(

        splitCount,

        2,

        14

      ),


    splitScale:

      clamp(

        splitScale,

        0.70,

        1.45

      ),


    positiveMass,


    negativeMass,


    mixedness,


    rgb,


    matches,


    sentenceResults

  };

}



// ======================================================
// SENTENCE
// ======================================================

function analyzeSentence(
  sentence
) {


  const lower =

    normalizeAnalysisText(
      sentence
    );



  const clauses =

    splitContrastClauses(
      lower
    );



  let score =
    0;


  let positiveMass =
    0;


  let negativeMass =
    0;


  let matches =
    0;



  const contexts =
    [];



  for (
    const clause
    of
    clauses
  ) {


    const result =

      analyzeClause(
        clause.text
      );



    score +=

      result.score
      *
      clause.weight;



    positiveMass +=

      result.positiveMass
      *
      clause.weight;



    negativeMass +=

      result.negativeMass
      *
      clause.weight;



    matches +=
      result.matches;



    contexts.push(
      ...result.contexts
    );

  }



  const exclamations =

    (

      sentence.match(
        /!/g
      )

      ||

      []

    ).length;



  const emphasis =

    1

    +

    Math.min(

      exclamations
      *
      0.07,

      0.22

    );



  score *=
    emphasis;


  positiveMass *=
    emphasis;


  negativeMass *=
    emphasis;



  return {

    score,

    positiveMass,

    negativeMass,

    matches,

    contexts

  };

}



// ======================================================
// CONTRAST CLAUSES
// ======================================================

function splitContrastClauses(
  sentence
) {


  let working =
    sentence;



  const sortedMarkers =

    [
      ...CONTRAST_MARKERS
    ]
    .sort(

      (
        a,
        b
      ) => {


        return b.length - a.length;

      }

    );



  let foundContrast =
    false;



  for (
    const marker
    of
    sortedMarkers
  ) {


    const expression =

      new RegExp(

        `(^|\\s|[,;:])${escapeRegExp(marker)}(?=\\s|[,;:]|$)`,

        "giu"

      );



    if (
      expression.test(
        working
      )
    ) {


      foundContrast =
        true;



      expression.lastIndex =
        0;



      working =

        working.replace(

          expression,

          "$1|||"

        );

    }

  }



  const pieces =

    working
      .split(
        "|||"
      )
      .map(

        (
          piece
        ) => {


          return piece.trim();

        }

      )
      .filter(
        Boolean
      );



  if (

    !foundContrast

    ||

    pieces.length <= 1

  ) {


    return [

      {

        text:
          sentence,

        weight:
          1

      }

    ];

  }



  return pieces.map(

    (
      text,
      index
    ) => {


      if (
        index === 0
      ) {


        return {

          text,

          weight:
            0.82

        };

      }



      return {

        text,

        weight:

          Math.min(

            1.42,

            1.32

            +

            index
            *
            0.04

          )

      };

    }

  );

}



// ======================================================
// CLAUSE
// ======================================================

function analyzeClause(
  clause
) {


  const tokens =

    tokenizeEmotionText(
      clause
    );



  let score =
    0;


  let positiveMass =
    0;


  let negativeMass =
    0;


  let matches =
    0;



  const contexts =
    [];



  for (
    const context
    of
    CONTEXT_PATTERNS
  ) {


    context.pattern.lastIndex =
      0;



    if (
      context.pattern.test(
        clause
      )
    ) {


      const value =
        context.score;



      score +=
        value;



      if (
        value >= 0
      ) {


        positiveMass +=
          value;

      }


      else {


        negativeMass +=

          Math.abs(
            value
          );

      }



      matches++;



      contexts.push(
        context.label
      );

    }

  }



  for (
    const [
      phrase,
      phraseScore
    ]
    of
    Object.entries(
      EMOTION_PHRASES
    )
  ) {


    if (
      clause.includes(
        phrase
      )
    ) {


      const value =

        phraseScore
        *
        1.08;



      score +=
        value;



      if (
        value >= 0
      ) {


        positiveMass +=
          value;

      }


      else {


        negativeMass +=

          Math.abs(
            value
          );

      }



      matches++;

    }

  }



  for (
    let i = 0;
    i < tokens.length;
    i++
  ) {


    const word =
      tokens[i];



    let value =

      EMOTION_WORDS[
        word
      ];



    if (
      typeof value !== "number"
    ) {

      continue;

    }



    let multiplier =
      1;



    const previous1 =

      tokens[i - 1]

      ||

      "";



    const previous2 =

      tokens[i - 2]

      ||

      "";



    if (
      INTENSIFIERS[
        previous1
      ]
    ) {


      multiplier *=

        INTENSIFIERS[
          previous1
        ];

    }



    if (
      INTENSIFIERS[
        previous2
      ]
    ) {


      multiplier *=

        1

        +

        (

          INTENSIFIERS[
            previous2
          ]

          -

          1

        )

        *
        0.55;

    }



    if (
      DIMINISHERS[
        previous1
      ]
    ) {


      multiplier *=

        DIMINISHERS[
          previous1
        ];

    }



    if (
      DIMINISHERS[
        previous2
      ]
    ) {


      multiplier *=

        1

        -

        (

          1

          -

          DIMINISHERS[
            previous2
          ]

        )

        *
        0.45;

    }



    value *=
      multiplier;



    const negated =

      hasNearbyNegator(

        tokens,

        i,

        3

      );



    if (
      negated
    ) {


      if (
        value >= 0
      ) {


        value =

          -Math.abs(
            value
          )

          *
          0.82;

      }


      else {


        value =

          Math.abs(
            value
          )

          *
          0.38;

      }

    }



    score +=
      value;



    if (
      value >= 0
    ) {


      positiveMass +=
        value;

    }


    else {


      negativeMass +=

        Math.abs(
          value
        );

    }



    matches++;

  }



  return {

    score,

    positiveMass,

    negativeMass,

    matches,

    contexts

  };

}



// ======================================================
// NEGATOR
// ======================================================

function hasNearbyNegator(
  tokens,
  index,
  distance
) {


  const start =

    Math.max(

      0,

      index
      -
      distance

    );



  for (
    let i = start;
    i < index;
    i++
  ) {


    if (
      NEGATORS.has(
        tokens[i]
      )
    ) {


      return true;

    }

  }



  return false;

}



// ======================================================
// TEXT NORMALIZATION
// ======================================================

function normalizeAnalysisText(
  text
) {


  return text

    .toLowerCase()

    .replace(
      /’/g,
      "'"
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}



// ======================================================
// TOKENIZER
// ======================================================

function tokenizeEmotionText(
  text
) {


  return (

    text.match(
      /[\p{L}'-]+/gu
    )

    ||

    []

  )
  .map(

    (
      token
    ) => {


      return token

        .replace(
          /’/g,
          "'"
        )

        .replace(
          /^[-']+|[-']+$/g,
          ""
        );

    }

  )
  .filter(
    Boolean
  );

}



// ======================================================
// SENTENCE SPLIT
// ======================================================

function splitEmotionSentences(
  text
) {


  const matches =

    text.match(
      /[^.!?\n;]+[.!?]?/g
    );



  if (
    !matches
  ) {


    return [

      text.trim()

    ]
    .filter(
      Boolean
    );

  }



  return matches

    .map(

      (
        sentence
      ) => {


        return sentence.trim();

      }

    )

    .filter(
      Boolean
    );

}



// ======================================================
// COLOR
// ======================================================

function emotionColorFromNormalized(
  normalized
) {


  const RED = [

    224,

    35,

    30

  ];



  const ORANGE = [

    255,

    119,

    35

  ];



  const YELLOW = [

    255,

    231,

    72

  ];



  const spectrumPosition =

    (

      clamp01Signed(
        normalized
      )

      +

      1

    )

    /
    2;



  if (
    spectrumPosition <= 0.5
  ) {


    return mixRGB(

      RED,

      ORANGE,

      spectrumPosition
      *
      2

    );

  }



  return mixRGB(

    ORANGE,

    YELLOW,

    (

      spectrumPosition
      -
      0.5

    )

    *
    2

  );

}



// ======================================================
// REGEX ESCAPE
// ======================================================

function escapeRegExp(
  value
) {


  return value.replace(

    /[.*+?^${}()|[\]\\]/g,

    "\\$&"

  );

}



// ======================================================
// CLAMPS
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



function clamp01Signed(
  value
) {


  return clamp(

    value,

    -1,

    1

  );

}



function clamp01(
  value
) {


  return clamp(

    value,

    0,

    1

  );

}



// ======================================================
// RGB
// ======================================================

function mixRGB(
  a,
  b,
  amount
) {


  const t =

    clamp(

      amount,

      0,

      1

    );



  return [


    Math.round(

      a[0]

      +

      (

        b[0]
        -
        a[0]

      )

      *
      t

    ),



    Math.round(

      a[1]

      +

      (

        b[1]
        -
        a[1]

      )

      *
      t

    ),



    Math.round(

      a[2]

      +

      (

        b[2]
        -
        a[2]

      )

      *
      t

    )

  ];

}



// ======================================================
// RANDOM
// ======================================================

function randomDifferentIndex(
  minimum,
  maximum,
  previous
) {


  if (
    minimum === maximum
  ) {

    return minimum;

  }



  let next;



  do {


    next =

      Math.floor(

        Math.random()

        *

        (

          maximum
          -
          minimum
          +
          1

        )

      )

      +

      minimum;


  }
  while (
    next === previous
  );



  return next;

}



// ======================================================
// IMAGE FALLBACK
// ======================================================

function setImageWithFallback(
  image,
  sources
) {


  let index =
    0;



  function tryNext() {


    if (
      index >= sources.length
    ) {


      image.onerror =
        null;



      console.error(

        "FAILED CUT IMAGE. Tried:",

        sources

      );


      return;

    }



    image.onerror =
      tryNext;



    image.src =

      sources[
        index
      ];



    index++;

  }



  tryNext();

}