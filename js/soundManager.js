// ======================================================
// MỐI TƠ ĐÀN
// GLOBAL SOUND MANAGER
//
// SOUND SYSTEM:
//
// 1. Sound_startend.mp3
//    - Opening
//    - Setup / before recording
//    - End scene
//
// 2. Sound_middle.mp3
//    - Intro
//    - Talk
//    - Room
//    - Cut
//    - Draw
//    - Play
//
//    PLAY ONLY:
//    middle background becomes quieter so
//    the Đàn Tính instrument is easier to hear.
//
// 3. Sound_click.wav
//    - Every normal click
//    - Every virtual hand click
//
// Existing scene files stay untouched.
// ======================================================



// ======================================================
// SOUND FILES
// ======================================================

const SOUND_PATHS = {

  startEnd:
    "assets/Sound_startend.mp3",

  middle:
    "assets/Sound_middle.mp3",

  click:
    "assets/Sound_click.wav"

};



// ======================================================
// VOLUMES
// ======================================================


// Opening / Boot / End

const START_END_VOLUME =
  0.42;



// Intro / Talk / Room / Cut / Draw

const MIDDLE_VOLUME =
  0.42;



// Play only

const PLAY_MIDDLE_VOLUME =
  0.12;



// Click

const CLICK_VOLUME =
  0.65;



// ======================================================
// FADE SPEED
// ======================================================

const MUSIC_FADE_DURATION =
  900;



// ======================================================
// BACKGROUND AUDIO
// ======================================================

const startEndAudio =

  new Audio(
    SOUND_PATHS.startEnd
  );



const middleAudio =

  new Audio(
    SOUND_PATHS.middle
  );



// ======================================================
// AUDIO SETTINGS
// ======================================================

startEndAudio.loop =
  true;


startEndAudio.preload =
  "auto";


startEndAudio.playsInline =
  true;



middleAudio.loop =
  true;


middleAudio.preload =
  "auto";


middleAudio.playsInline =
  true;



// ======================================================
// IMPORTANT:
//
// Start both background tracks muted.
//
// Chrome allows muted media to begin before interaction.
//
// Once the user performs the first real interaction,
// Sound_startend becomes audible immediately.
//
// This avoids needing a second click.
// ======================================================

startEndAudio.muted =
  true;


startEndAudio.volume =
  START_END_VOLUME;



middleAudio.muted =
  true;


middleAudio.volume =
  0;



// ======================================================
// CLICK SOUND POOL
// ======================================================

const CLICK_POOL_SIZE =
  5;



const clickPool =

  Array.from(

    {
      length:
        CLICK_POOL_SIZE
    },

    () => {


      const audio =

        new Audio(
          SOUND_PATHS.click
        );


      audio.preload =
        "auto";


      audio.volume =
        CLICK_VOLUME;


      return audio;

    }

  );



let clickPoolIndex =
  0;



// ======================================================
// SOUND STATE
// ======================================================

let audioUnlocked =
  false;



let unlockInProgress =
  false;



let middleStarted =
  false;



let previousEndActive =
  false;



// ======================================================
// FADE JOBS
// ======================================================

const fadeJobs =

  new WeakMap();



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



// ======================================================
// FADE AUDIO
// ======================================================

function fadeTo(

  audio,

  targetVolume,

  duration =
    MUSIC_FADE_DURATION

) {


  if (
    !audio
  ) {

    return;

  }



  const target =

    clamp(

      targetVolume,

      0,

      1

    );



  const existingJob =

    fadeJobs.get(
      audio
    );



  if (

    existingJob

    &&

    Math.abs(

      existingJob.target

      -

      target

    )

    <

    0.0001

  ) {


    return;

  }



  if (
    existingJob
  ) {


    cancelAnimationFrame(
      existingJob.frame
    );

  }



  const from =
    audio.volume;



  if (

    duration <= 0

    ||

    Math.abs(
      from - target
    ) < 0.001

  ) {


    audio.volume =
      target;


    fadeJobs.delete(
      audio
    );


    return;

  }



  const startedAt =

    performance.now();



  const job = {

    frame:
      null,

    target

  };



  const step =

    (
      now
    ) => {


      const progress =

        clamp(

          (

            now

            -

            startedAt

          )

          /

          duration,

          0,

          1

        );



      const eased =

        progress

        *

        progress

        *

        (

          3

          -

          2

          *

          progress

        );



      audio.volume =

        clamp(

          from

          +

          (

            target

            -

            from

          )

          *

          eased,

          0,

          1

        );



      if (
        progress < 1
      ) {


        job.frame =

          requestAnimationFrame(
            step
          );


        fadeJobs.set(

          audio,

          job

        );


        return;

      }



      audio.volume =
        target;



      fadeJobs.delete(
        audio
      );

    };



  job.frame =

    requestAnimationFrame(
      step
    );



  fadeJobs.set(

    audio,

    job

  );

}



// ======================================================
// SITE MODE
// ======================================================

function isEndActive() {


  return document.body.classList.contains(
    "end-active"
  );

}



function isPlayActive() {


  return document.body.classList.contains(
    "play-active"
  );

}



// ======================================================
// MAKE SURE MUSIC IS PLAYING
// ======================================================

function ensureMusicPlayback() {


  if (
    !audioUnlocked
  ) {

    return;

  }



  if (
    startEndAudio.paused
  ) {


    void startEndAudio
      .play()
      .catch(
        () => {}
      );

  }



  if (
    middleAudio.paused
  ) {


    void middleAudio
      .play()
      .catch(
        () => {}
      );

  }

}



// ======================================================
// MUSIC MIX
// ======================================================

function syncMusicMix(

  instant =
    false

) {


  if (
    !audioUnlocked
  ) {

    return;

  }



  ensureMusicPlayback();



  const duration =

    instant

    ?

    0

    :

    MUSIC_FADE_DURATION;



  // ==================================================
  // END
  // ==================================================

  if (
    isEndActive()
  ) {


    fadeTo(

      middleAudio,

      0,

      duration

    );



    fadeTo(

      startEndAudio,

      START_END_VOLUME,

      duration

    );


    return;

  }



  // ==================================================
  // OPENING / BEFORE RECORDING
  // ==================================================

  if (
    !middleStarted
  ) {


    fadeTo(

      middleAudio,

      0,

      duration

    );



    fadeTo(

      startEndAudio,

      START_END_VOLUME,

      duration

    );


    return;

  }



  // ==================================================
  // MIDDLE
  // ==================================================

  fadeTo(

    startEndAudio,

    0,

    duration

  );



  if (
    isPlayActive()
  ) {


    fadeTo(

      middleAudio,

      PLAY_MIDDLE_VOLUME,

      duration

    );


    return;

  }



  fadeTo(

    middleAudio,

    MIDDLE_VOLUME,

    duration

  );

}



// ======================================================
// PRIME AUDIO
//
// Called immediately when the page loads.
//
// Chrome normally allows muted playback without a
// user gesture.
//
// This prepares both music tracks so the first real
// interaction only needs to unmute them.
// ======================================================

async function primeAudio() {


  startEndAudio.muted =
    true;


  middleAudio.muted =
    true;



  startEndAudio.volume =
    START_END_VOLUME;


  middleAudio.volume =
    0;



  try {


    startEndAudio.currentTime =
      0;


  }


  catch (
    error
  ) {


    void error;

  }



  try {


    middleAudio.currentTime =
      0;


  }


  catch (
    error
  ) {


    void error;

  }



  try {


    await startEndAudio.play();


  }


  catch (
    error
  ) {


    void error;

  }



  try {


    await middleAudio.play();


  }


  catch (
    error
  ) {


    void error;

  }

}



// ======================================================
// UNLOCK AUDIO
//
// IMPORTANT:
//
// This is called directly from pointerdown / touchstart /
// keydown.
//
// There is NO timeout before calling play().
//
// There is NO asynchronous work before the browser sees
// the playback request.
//
// This makes Chrome accept it on the FIRST interaction.
// ======================================================

function unlockAudio() {


  if (
    audioUnlocked
  ) {


    syncMusicMix(
      false
    );


    return;

  }



  if (
    unlockInProgress
  ) {

    return;

  }



  unlockInProgress =
    true;



  // ==================================================
  // UNMUTE IMMEDIATELY INSIDE USER GESTURE
  // ==================================================

  startEndAudio.muted =
    false;


  middleAudio.muted =
    false;



  // ==================================================
  // SET CORRECT CURRENT VOLUMES
  // ==================================================

  if (
    middleStarted
  ) {


    startEndAudio.volume =
      0;


    middleAudio.volume =

      isPlayActive()

      ?

      PLAY_MIDDLE_VOLUME

      :

      MIDDLE_VOLUME;

  }


  else {


    startEndAudio.volume =
      START_END_VOLUME;


    middleAudio.volume =
      0;

  }



  // ==================================================
  // IMPORTANT:
  //
  // Call BOTH play() immediately.
  //
  // Do not await anything first.
  // ==================================================

  let startPlay;


  let middlePlay;



  try {


    startPlay =
      startEndAudio.play();


  }


  catch (
    error
  ) {


    startPlay =
      null;


    void error;

  }



  try {


    middlePlay =
      middleAudio.play();


  }


  catch (
    error
  ) {


    middlePlay =
      null;


    void error;

  }



  const startPromise =

    startPlay

    &&

    typeof startPlay.then ===
      "function"

    ?

    startPlay

    :

    Promise.resolve();



  const middlePromise =

    middlePlay

    &&

    typeof middlePlay.then ===
      "function"

    ?

    middlePlay

    :

    Promise.resolve();



  Promise.allSettled(

    [

      startPromise,

      middlePromise

    ]

  )
  .then(

    (
      results
    ) => {


      const startSucceeded =

        results[0]?.status ===
        "fulfilled";



      if (
        startSucceeded
      ) {


        audioUnlocked =
          true;


        unlockInProgress =
          false;


        syncMusicMix(
          false
        );


        return;

      }



      // =================================================
      // CHROME STILL REJECTED IT.
      //
      // Restore muted state so another real interaction
      // can retry safely.
      // =================================================

      audioUnlocked =
        false;


      unlockInProgress =
        false;



      startEndAudio.muted =
        true;


      middleAudio.muted =
        true;

    }

  );

}



// ======================================================
// FIRST REAL INTERACTION
//
// capture:true makes this fire before scene buttons.
//
// The opening sound starts on this SAME interaction.
// ======================================================

document.addEventListener(

  "pointerdown",

  unlockAudio,

  {

    capture:
      true,

    passive:
      true

  }

);



document.addEventListener(

  "touchstart",

  unlockAudio,

  {

    capture:
      true,

    passive:
      true

  }

);



document.addEventListener(

  "keydown",

  unlockAudio,

  {

    capture:
      true

  }

);



// ======================================================
// CLICK SOUND
// ======================================================

function playClickSound() {


  if (
    !audioUnlocked
  ) {

    return;

  }



  const audio =

    clickPool[
      clickPoolIndex
    ];



  clickPoolIndex =

    (

      clickPoolIndex

      +

      1

    )

    %

    CLICK_POOL_SIZE;



  try {


    audio.pause();



    audio.currentTime =
      0;



    audio.volume =
      CLICK_VOLUME;



    void audio
      .play()
      .catch(
        () => {}
      );


  }


  catch (
    error
  ) {


    void error;

  }

}



// ======================================================
// GLOBAL CLICK
//
// Mouse
// Touch click
// Virtual hand click
// ======================================================

document.addEventListener(

  "click",

  () => {


    // ==================================================
    // Safety retry.
    // ==================================================

    if (
      !audioUnlocked
    ) {


      unlockAudio();

    }



    playClickSound();

  },

  true

);



// ======================================================
// RECORDING / MIDDLE SECTION START
//
// TURN ON CAMERA →
//
// start/end fades out
// middle starts from beginning
// ======================================================

const enterButton =

  document.getElementById(
    "enter-button"
  );



enterButton
  ?.addEventListener(

    "click",

    () => {


      // =================================================
      // This button itself is also a valid browser user
      // interaction, so make absolutely sure audio has
      // been unlocked.
      // =================================================

      unlockAudio();



      middleStarted =
        true;



      try {


        middleAudio.currentTime =
          0;


      }


      catch (
        error
      ) {


        void error;

      }



      middleAudio.muted =
        false;



      void middleAudio
        .play()
        .catch(
          () => {}
        );



      syncMusicMix(
        false
      );

    },

    true

  );



// ======================================================
// MENU NAVIGATION
// ======================================================

const navigationButtons =

  document.querySelectorAll(
    ".nav-item"
  );



navigationButtons.forEach(

  (
    button
  ) => {


    button.addEventListener(

      "click",

      () => {


        window.setTimeout(

          () => {


            syncMusicMix(
              false
            );

          },

          0

        );

      },

      true

    );

  }

);



// ======================================================
// BODY CLASS OBSERVER
//
// PLAY:
// middle volume → 0.12
//
// leaving PLAY:
// middle volume → 0.42
//
// END:
// middle fades out
// start/end returns
// ======================================================

function syncBodyAudioState() {


  const endActive =

    isEndActive();



  if (

    endActive

    &&

    !previousEndActive

  ) {


    if (
      audioUnlocked
    ) {


      try {


        startEndAudio.currentTime =
          0;


      }


      catch (
        error
      ) {


        void error;

      }



      startEndAudio.muted =
        false;



      void startEndAudio
        .play()
        .catch(
          () => {}
        );

    }

  }



  previousEndActive =
    endActive;



  syncMusicMix(
    false
  );

}



// ======================================================
// BODY OBSERVER
// ======================================================

const bodyObserver =

  new MutationObserver(

    () => {


      syncBodyAudioState();

    }

  );



bodyObserver.observe(

  document.body,

  {

    attributes:
      true,

    attributeFilter: [
      "class"
    ]

  }

);



// ======================================================
// TAB VISIBILITY
// ======================================================

document.addEventListener(

  "visibilitychange",

  () => {


    if (
      document.hidden
    ) {

      return;

    }



    if (
      !audioUnlocked
    ) {

      return;

    }



    ensureMusicPlayback();



    syncMusicMix(
      false
    );

  }

);



// ======================================================
// PAGE FOCUS
// ======================================================

window.addEventListener(

  "focus",

  () => {


    if (
      !audioUnlocked
    ) {

      return;

    }



    ensureMusicPlayback();



    syncMusicMix(
      false
    );

  }

);



// ======================================================
// PRELOAD
// ======================================================

startEndAudio.load();



middleAudio.load();



for (
  const clickAudio
  of
  clickPool
) {


  clickAudio.load();

}



// ======================================================
// INITIAL STATE
//
// First:
// try normal audible autoplay.
//
// Edge / browsers that allow it:
// opening music begins immediately.
//
// Chrome if blocked:
// prime the tracks muted.
//
// First real interaction then unmutes and begins audio
// immediately without requiring another click.
// ======================================================

async function startInitialAudio() {


  startEndAudio.muted =
    false;


  startEndAudio.volume =
    START_END_VOLUME;



  try {


    await startEndAudio.play();



    audioUnlocked =
      true;



    middleAudio.muted =
      true;


    middleAudio.volume =
      0;



    try {


      await middleAudio.play();


    }


    catch (
      error
    ) {


      void error;

    }



    middleAudio.muted =
      false;



    syncMusicMix(
      true
    );


  }


  catch (
    error
  ) {


    // =================================================
    // EXPECTED ON CHROME FOR A NEW / UNTRUSTED PAGE.
    //
    // We cannot legally bypass Chrome's autoplay policy.
    //
    // Instead prime both tracks muted so the first
    // interaction can make them audible immediately.
    // =================================================

    audioUnlocked =
      false;



    await primeAudio();

  }

}



// ======================================================
// START
// ======================================================

syncBodyAudioState();



void startInitialAudio();