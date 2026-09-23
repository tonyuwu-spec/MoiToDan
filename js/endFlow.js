// ======================================================
// MỜI TỪ ĐÀN
// PLAY → END FLOW
//
// This stays separate from:
// play.js
// sketch.js
// gesture.js
// draw.js
//
// Existing systems remain untouched.
// ======================================================



// ======================================================
// TIMING
// ======================================================

const PLAY_TEXT_DELAY =
  5000;



// ======================================================
// END TEXT DELAY
//
// End_text1 waits 2 seconds after entering
// the END scene before fading in.
// ======================================================

const END_TEXT_DELAY =
  2000;



const TREE_SLIDE_DURATION =
  900;



const END_MAIN_FADE_DURATION =
  500;



const END_FONT_FADE_DELAY =
  120;



const END_FONT_REVEAL_PAUSE =
  220;



// ======================================================
// DOM
// ======================================================

const playText1 =

  document.getElementById(
    "play-text1"
  );



const endWindow =

  document.getElementById(
    "end-window"
  );



const endText1 =

  document.getElementById(
    "end-text1"
  );



const endFont =

  document.getElementById(
    "end-font"
  );



// ======================================================
// STATE
// ======================================================

let playTextTimer =
  null;



let endTimers =
  [];



let playWasActive =
  false;



let endSequenceRunning =
  false;



let endSequenceComplete =
  false;



// ======================================================
// PLAY TEXT TIMER
// ======================================================

function clearPlayTextTimer() {


  if (
    !playTextTimer
  ) {

    return;

  }



  window.clearTimeout(
    playTextTimer
  );



  playTextTimer =
    null;

}



// ======================================================
// PLAY TEXT SHOW
// ======================================================

function showPlayText() {


  if (
    !document.body.classList.contains(
      "play-active"
    )
  ) {

    return;

  }



  if (
    document.body.classList.contains(
      "end-active"
    )
  ) {

    return;

  }



  playText1
    ?.classList
    .add(
      "is-visible"
    );



  playText1
    ?.setAttribute(

      "aria-hidden",

      "false"

    );

}



// ======================================================
// PLAY TEXT HIDE
// ======================================================

function hidePlayText() {


  playText1
    ?.classList
    .remove(
      "is-visible"
    );



  playText1
    ?.setAttribute(

      "aria-hidden",

      "true"

    );

}



// ======================================================
// START 5 SECOND TIMER
// ======================================================

function startPlayTextTimer() {


  clearPlayTextTimer();


  hidePlayText();



  playTextTimer =

    window.setTimeout(

      () => {


        playTextTimer =
          null;



        showPlayText();

      },

      PLAY_TEXT_DELAY

    );

}



// ======================================================
// END TEXT SHOW
// ======================================================

function showEndText() {


  endText1
    ?.classList
    .add(
      "is-visible"
    );



  endText1
    ?.setAttribute(

      "aria-hidden",

      "false"

    );

}



// ======================================================
// END TEXT HIDE
// ======================================================

function hideEndText() {


  endText1
    ?.classList
    .remove(
      "is-visible"
    );



  endText1
    ?.setAttribute(

      "aria-hidden",

      "true"

    );

}



// ======================================================
// END FONT ACCESSIBILITY
// ======================================================

function setEndFontHidden() {


  endFont
    ?.setAttribute(

      "aria-hidden",

      "true"

    );



  endFont?.setAttribute(

    "tabindex",

    "-1"

  );

}



function setEndFontReady() {


  endFont
    ?.setAttribute(

      "aria-hidden",

      "false"

    );



  endFont?.setAttribute(

    "tabindex",

    "0"

  );

}



// ======================================================
// END TIMER HELPER
// ======================================================

function scheduleEndTimer(

  callback,

  delay

) {


  const timer =

    window.setTimeout(

      () => {


        endTimers =

          endTimers.filter(

            (
              item
            ) => {


              return item !== timer;

            }

          );



        callback();

      },

      delay

    );



  endTimers.push(
    timer
  );

}



// ======================================================
// CLEAR END TIMERS
// ======================================================

function clearEndTimers() {


  for (
    const timer
    of
    endTimers
  ) {


    window.clearTimeout(
      timer
    );

  }



  endTimers =
    [];

}



// ======================================================
// RESET END SCENE
// ======================================================

function resetEndScene() {


  clearEndTimers();



  endSequenceRunning =
    false;



  endSequenceComplete =
    false;



  hideEndText();


  setEndFontHidden();



  endWindow
    ?.classList
    .remove(

      "end-tree1-in",

      "end-tree2-in",

      "end-trees-out",

      "end-main-hidden",

      "end-font-visible",

      "end-sequence-running",

      "end-sequence-complete"

    );



  document.body.classList.remove(
    "end-active"
  );

}



// ======================================================
// ENTER END SCENE
// ======================================================

function enterEndScene(
  event
) {


  if (
    event
  ) {


    event.preventDefault();


    event.stopPropagation();

  }



  if (
    !document.body.classList.contains(
      "play-active"
    )
  ) {

    return;

  }



  if (
    !playText1
      ?.classList
      .contains(
        "is-visible"
      )
  ) {

    return;

  }



  clearPlayTextTimer();


  hidePlayText();



  resetEndScene();



  document.body.classList.add(
    "end-active"
  );



  // ==================================================
  // END_TEXT1
  //
  // Do NOT show immediately.
  //
  // Wait 2 seconds after entering the END scene,
  // then add is-visible so the existing CSS
  // fade-in animation can happen.
  // ==================================================

  scheduleEndTimer(

    () => {


      if (
        !document.body.classList.contains(
          "end-active"
        )
      ) {

        return;

      }



      showEndText();

    },

    END_TEXT_DELAY

  );

}



// ======================================================
// END TREE SEQUENCE
//
// 1.
// End_text1 disappears.
//
// 2.
// Tree 1:
// left → center.
//
// 3.
// Tree 2:
// right → center.
//
// 4.
// Once Tree 2 has COMPLETELY arrived,
// End_main fades away.
//
// 5.
// End_font fades in underneath the trees.
//
// 6.
// Trees return to where they began.
//
// 7.
// End_font is revealed on black.
//
// 8.
// Clicking End_font reloads the site.
// ======================================================

function startEndTreeSequence(
  event
) {


  if (
    event
  ) {


    event.preventDefault();


    event.stopPropagation();

  }



  if (
    !document.body.classList.contains(
      "end-active"
    )
  ) {

    return;

  }



  if (

    endSequenceRunning

    ||

    endSequenceComplete

  ) {

    return;

  }



  if (
    !endText1
      ?.classList
      .contains(
        "is-visible"
      )
  ) {

    return;

  }



  endSequenceRunning =
    true;



  hideEndText();



  endWindow
    ?.classList
    .add(
      "end-sequence-running"
    );



  // ==================================================
  // STEP 1
  //
  // TREE 1:
  // LEFT → CENTER
  // ==================================================

  endWindow
    ?.classList
    .add(
      "end-tree1-in"
    );



  // ==================================================
  // STEP 2
  //
  // AFTER TREE 1 ARRIVES:
  // TREE 2:
  // RIGHT → CENTER
  // ==================================================

  scheduleEndTimer(

    () => {


      endWindow
        ?.classList
        .add(
          "end-tree2-in"
        );

    },

    TREE_SLIDE_DURATION

  );



  // ==================================================
  // STEP 3
  //
  // TREE 2 IS NOW FULLY IN.
  //
  // FADE OUT END_MAIN.
  // ==================================================

  scheduleEndTimer(

    () => {


      endWindow
        ?.classList
        .add(
          "end-main-hidden"
        );

    },

    TREE_SLIDE_DURATION
    *
    2

  );



  // ==================================================
  // STEP 4
  //
  // WAIT FOR END_MAIN TO FINISH FADING.
  //
  // THEN END_FONT STARTS APPEARING.
  // ==================================================

  scheduleEndTimer(

    () => {


      endWindow
        ?.classList
        .add(
          "end-font-visible"
        );

    },

    (
      TREE_SLIDE_DURATION
      *
      2
    )

    +

    END_MAIN_FADE_DURATION

    +

    END_FONT_FADE_DELAY

  );



  // ==================================================
  // STEP 5
  //
  // END_FONT IS NOW APPEARING UNDER THE TREES.
  //
  // SLIDE BOTH TREES BACK OUT.
  // ==================================================

  scheduleEndTimer(

    () => {


      endWindow
        ?.classList
        .add(
          "end-trees-out"
        );

    },

    (
      TREE_SLIDE_DURATION
      *
      2
    )

    +

    END_MAIN_FADE_DURATION

    +

    END_FONT_FADE_DELAY

    +

    END_FONT_REVEAL_PAUSE

  );



  // ==================================================
  // STEP 6
  //
  // TREES ARE COMPLETELY OUT.
  //
  // END_FONT IS NOW THE FINAL SCREEN.
  // MAKE IT CLICKABLE.
  // ==================================================

  scheduleEndTimer(

    () => {


      endSequenceRunning =
        false;



      endSequenceComplete =
        true;



      endWindow
        ?.classList
        .remove(
          "end-sequence-running"
        );



      endWindow
        ?.classList
        .add(
          "end-sequence-complete"
        );



      setEndFontReady();

    },

    (
      TREE_SLIDE_DURATION
      *
      3
    )

    +

    END_MAIN_FADE_DURATION

    +

    END_FONT_FADE_DELAY

    +

    END_FONT_REVEAL_PAUSE

  );

}



// ======================================================
// RETURN TO START
// ======================================================

function returnToStart(
  event
) {


  if (
    event
  ) {


    event.preventDefault();


    event.stopPropagation();

  }



  if (
    !document.body.classList.contains(
      "end-active"
    )
  ) {

    return;

  }



  if (
    !endSequenceComplete
  ) {

    return;

  }



  // ==================================================
  // COMPLETE RESET:
  //
  // Opening screen
  // boot screen
  // timer
  // scenes
  // camera UI
  // PLAY state
  // DRAW state
  // CUT state
  //
  // Everything returns to the exact initial webpage.
  // ==================================================

  window.location.reload();

}



// ======================================================
// PLAY TEXT CLICK
// ======================================================

playText1
  ?.addEventListener(

    "click",

    enterEndScene

  );



// ======================================================
// PLAY TEXT KEYBOARD
// ======================================================

playText1
  ?.addEventListener(

    "keydown",

    (
      event
    ) => {


      if (

        event.key === "Enter"

        ||

        event.key === " "

      ) {


        enterEndScene(
          event
        );

      }

    }

  );



// ======================================================
// END TEXT CLICK
// ======================================================

endText1
  ?.addEventListener(

    "click",

    startEndTreeSequence

  );



// ======================================================
// END TEXT KEYBOARD
// ======================================================

endText1
  ?.addEventListener(

    "keydown",

    (
      event
    ) => {


      if (

        event.key === "Enter"

        ||

        event.key === " "

      ) {


        startEndTreeSequence(
          event
        );

      }

    }

  );



// ======================================================
// END FONT CLICK
// ======================================================

endFont
  ?.addEventListener(

    "click",

    returnToStart

  );



// ======================================================
// END FONT KEYBOARD
// ======================================================

endFont
  ?.addEventListener(

    "keydown",

    (
      event
    ) => {


      if (

        event.key === "Enter"

        ||

        event.key === " "

      ) {


        returnToStart(
          event
        );

      }

    }

  );



// ======================================================
// WATCH PLAY SCENE
//
// We watch the existing play-active body class.
// No changes to play.js or sketch.js are required.
// ======================================================

function syncPlayState() {


  const playIsActive =

    document.body.classList.contains(
      "play-active"
    );



  // ==================================================
  // JUST ENTERED PLAY
  // ==================================================

  if (

    playIsActive

    &&

    !playWasActive

  ) {


    resetEndScene();


    startPlayTextTimer();

  }



  // ==================================================
  // LEFT PLAY
  // ==================================================

  if (

    !playIsActive

    &&

    playWasActive

  ) {


    clearPlayTextTimer();


    hidePlayText();


    resetEndScene();

  }



  playWasActive =
    playIsActive;

}



// ======================================================
// BODY CLASS OBSERVER
// ======================================================

const bodyObserver =

  new MutationObserver(

    () => {


      syncPlayState();

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
// INITIAL SETUP
// ======================================================

setEndFontHidden();


syncPlayState();