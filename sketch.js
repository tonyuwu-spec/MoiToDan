// ======================================================
// IMPORTS
// ======================================================

import {
  HandGestureController
}
from
"./js/gesture.js";

import {
  SceneManager
}
from
"./js/sceneManager.js";

import {
  IntroScene
}
from
"./js/intro.js";

import {
  TalkScene
}
from
"./js/talk.js";

import {
  RoomScene
}
from
"./js/room.js";

import {
  OpeningSlime
}
from
"./js/openingSlime.js";

import {
  CutScene
}
from
"./js/cut.js";

import {
  DrawScene
}
from
"./js/draw.js";

import {
  PlayScene
}
from
"./js/play.js";

import {
  TimeEnvironmentManager
}
from
"./js/timeEnvironmentManager.js";



// ======================================================
// MASTER DESIGN
// ======================================================

const BASE_WIDTH =
  2560;

const BASE_HEIGHT =
  1440;



// ======================================================
// CAMERA
// ======================================================

const MIN_ZOOM =
  1.0;

const MAX_ZOOM =
  2.2;



// ======================================================
// SHARED STATE
// ======================================================

const state = {

  designScale:
    1,

  targetZoom:
    1,

  currentZoom:
    1,

  boardWidth:
    BASE_WIDTH,

  boardHeight:
    BASE_HEIGHT,

  mouseNormalizedX:
    0,

  mouseNormalizedY:
    0,

  currentPanX:
    0,

  currentPanY:
    0,

  handPanActive:
    false,

  handPanX:
    0,

  handPanY:
    0,

  introRunning:
    false,

  talkRunning:
    false,

  roomRunning:
    false,

  cutRunning:
    false,

  cutCameraActive:
    false,

  drawRunning:
    false,

  drawCameraActive:
    false,

  playRunning:
    false,

  cameraControlsActive:
    false,

  recordingActive:
    false,

  recordingStartedAt:
    0

};



// ======================================================
// CAMERA
// ======================================================

let cameraStream =
  null;

let cameraAllowed =
  false;

let previewVisible =
  true;



// ======================================================
// MICROPHONE
// ======================================================

let microphoneStream =
  null;

let audioContext =
  null;

let analyser =
  null;

let waveform =
  null;

let micAllowed =
  false;

let smoothMicLevel =
  0;



// ======================================================
// GUIDE
// ======================================================

let gestureGuideShowTimer =
  null;

let gestureGuideHideTimer =
  null;



// ======================================================
// STARTUP FADE
// ======================================================

let startupFadeFinishTimer =
  null;



// ======================================================
// SHARED DOM
// ======================================================

const designStage =

  document.getElementById(
    "design-stage"
  );

const startupFade =

  document.getElementById(
    "startup-fade"
  );



// ======================================================
// OPENING
// ======================================================

const openingScreen =

  document.getElementById(
    "opening-screen"
  );

const openingEnter =

  document.getElementById(
    "opening-enter"
  );



// ======================================================
// INTRO
// ======================================================

const sceneBoard =

  document.getElementById(
    "scene-board"
  );

const sceneVideo =

  document.getElementById(
    "scene-video"
  );

const tree1 =

  document.getElementById(
    "tree1"
  );

const tree2 =

  document.getElementById(
    "tree2"
  );

const tree3 =

  document.getElementById(
    "tree3"
  );

const introTextBox =

  document.getElementById(
    "intro-textbox"
  );



// ======================================================
// TALK
// ======================================================

const talkWindow =

  document.getElementById(
    "talk-window"
  );

const talkBoard =

  document.getElementById(
    "talk-board"
  );

const talkVideo =

  document.getElementById(
    "talk-video"
  );

const talkLayer3 =

  document.getElementById(
    "talk-layer3"
  );

const talkWorm =

  document.getElementById(
    "talk-worm"
  );

const talkCharacter =

  document.getElementById(
    "talk-character"
  );

const talkTextBox =

  document.getElementById(
    "talk-textbox"
  );



// ======================================================
// ROOM
// ======================================================

const roomWindow =

  document.getElementById(
    "room-window"
  );

const roomBoard =

  document.getElementById(
    "room-board"
  );

const roomSceneImage =

  document.getElementById(
    "room-scene-image"
  );

const roomLeftDoor =

  document.getElementById(
    "room-left-door"
  );

const roomRightDoor =

  document.getElementById(
    "room-right-door"
  );

const roomDoorHotspot =

  document.getElementById(
    "room-door-hotspot"
  );

const roomWorm =

  document.getElementById(
    "room-worm"
  );

const roomTextBox =

  document.getElementById(
    "room-textbox"
  );



// ======================================================
// CUT
// ======================================================

const cutWindow =

  document.getElementById(
    "cut-window"
  );

const cutBoard =

  document.getElementById(
    "cut-board"
  );

const cutBackground =

  document.getElementById(
    "cut-bg"
  );

const cutSilkMount =

  document.getElementById(
    "cut-silk-mount"
  );

const cutTalkArt =

  document.getElementById(
    "cut-talk-art"
  );

const cutTextBox =

  document.getElementById(
    "cut-textbox"
  );

const cutInputPanel =

  document.getElementById(
    "cut-input-panel"
  );

const cutThoughtInput =

  document.getElementById(
    "cut-thought-input"
  );

const cutAddButton =

  document.getElementById(
    "cut-add-button"
  );

const cutFinishButton =

  document.getElementById(
    "cut-finish-button"
  );

const cutModeHint =

  document.getElementById(
    "cut-mode-hint"
  );



// ======================================================
// DRAW
// ======================================================

const drawWindow =

  document.getElementById(
    "draw-window"
  );

const drawBoard =

  document.getElementById(
    "draw-board"
  );

const drawBackground =

  document.getElementById(
    "draw-bg"
  );

const drawVideo1 =

  document.getElementById(
    "draw-video1"
  );

const drawVideo2 =

  document.getElementById(
    "draw-video2"
  );

const drawPaperMount =

  document.getElementById(
    "draw-paper-mount"
  );

const drawControls =

  document.getElementById(
    "draw-controls"
  );

const drawModeIndicator =

  document.getElementById(
    "draw-mode-indicator"
  );

const drawRotateButton =

  document.getElementById(
    "draw-rotate-button"
  );

const drawClearFrontButton =

  document.getElementById(
    "draw-clear-front-button"
  );

const drawClearBackButton =

  document.getElementById(
    "draw-clear-back-button"
  );

const drawResetButton =

  document.getElementById(
    "draw-reset-button"
  );

const drawFinishButton =

  document.getElementById(
    "draw-finish-button"
  );

const drawSilkHotspot =

  document.getElementById(
    "draw-silk-hotspot"
  );

const drawPenHotspot =

  document.getElementById(
    "draw-pen-hotspot"
  );

const drawTextBox =

  document.getElementById(
    "draw-textbox"
  );



// ======================================================
// PLAY
// ======================================================

const playWindow =

  document.getElementById(
    "play-window"
  );

const playBoard =

  document.getElementById(
    "play-board"
  );

const playBackground3 =

  document.getElementById(
    "play-bg3"
  );

const playWorm =

  document.getElementById(
    "play-worm"
  );

const playBackground1 =

  document.getElementById(
    "play-bg1"
  );

const playSilkMount =

  document.getElementById(
    "play-silk-mount"
  );



// ======================================================
// BOOT
// ======================================================

const bootScreen =

  document.getElementById(
    "boot-screen"
  );

const timeInput =

  document.getElementById(
    "time-input"
  );

const timeResult =

  document.getElementById(
    "time-result"
  );

const cameraButton =

  document.getElementById(
    "allow-camera"
  );

const cameraStatus =

  document.getElementById(
    "camera-status"
  );

const micButton =

  document.getElementById(
    "allow-mic"
  );

const micStatus =

  document.getElementById(
    "mic-status"
  );

const enterButton =

  document.getElementById(
    "enter-button"
  );



// ======================================================
// HANDYCAM
// ======================================================

const webcamPreview =

  document.getElementById(
    "webcam-preview"
  );

const previewMessage =

  document.getElementById(
    "preview-message"
  );

const eyeButton =

  document.getElementById(
    "eye-button"
  );

const zoomLabel =

  document.getElementById(
    "zoom-label"
  );

const zoomMarker =

  document.getElementById(
    "zoom-marker"
  );

const timerElement =

  document.getElementById(
    "record-timer"
  );

const menuButton =

  document.getElementById(
    "menu-button"
  );

const menuPanel =

  document.getElementById(
    "menu-panel"
  );

const navItems =

  document.querySelectorAll(
    ".nav-item"
  );

const meterLeft =

  document.getElementById(
    "meter-left"
  );

const meterRight =

  document.getElementById(
    "meter-right"
  );



// ======================================================
// GESTURE GUIDE
// ======================================================

const gestureGuide =

  document.getElementById(
    "gesture-guide"
  );

const gestureGuideButton =

  document.getElementById(
    "gesture-guide-button"
  );



// ======================================================
// RESPONSIVE DESIGN
// ======================================================

function resizeDesignStage() {

  const widthScale =

    window.innerWidth

    /

    BASE_WIDTH;

  const heightScale =

    window.innerHeight

    /

    BASE_HEIGHT;

  const scale =

    Math.min(

      widthScale,

      heightScale

    );

  state.designScale =
    scale;

  designStage.style.transform =

    `translate(-50%, -50%)
     scale(${scale})`;

}



// ======================================================
// OPENING
// ======================================================

const openingSlime =

  new OpeningSlime(
    "opening-slime"
  );

openingEnter.addEventListener(

  "pointerenter",

  () => {

    openingScreen.classList.add(
      "font-hover"
    );

    openingSlime.start();

  }

);

openingEnter.addEventListener(

  "pointerleave",

  () => {

    openingScreen.classList.remove(
      "font-hover"
    );

  }

);

openingEnter.addEventListener(

  "click",

  () => {

    openingScreen.classList.add(
      "is-hidden"
    );

    window.setTimeout(

      () => {

        openingSlime.stop();

      },

      700

    );

  }

);



// ======================================================
// SCENE MANAGER
// ======================================================

const sceneManager =

  new SceneManager();



// ======================================================
// NORMAL SCENE CHANGE
//
// Every scene change returns the shared camera to 1×.
// Time-of-day asset changes do NOT use this function,
// so a time change keeps the current zoom / pan exactly
// where the user is.
// ======================================================

function resetSharedCamera() {

  state.targetZoom =
    1;

  state.currentZoom =
    1;

  state.currentPanX =
    0;

  state.currentPanY =
    0;

  state.handPanActive =
    false;

  state.handPanX =
    0;

  state.handPanY =
    0;

}


async function goToScene(
  sceneName,
  data = {}
) {

  resetSharedCamera();

  return sceneManager.goTo(
    sceneName,
    data
  );

}



// ======================================================
// INTRO
// ======================================================

const introScene =

  new IntroScene(

    {

      state,

      sceneVideo,

      tree1,

      tree2,

      tree3,

      textBox:
        introTextBox,

      timeResult,

      resizeSceneBoard:
        resizeSceneBoards

    }

  );

sceneManager.register(
  "intro",
  introScene
);



// ======================================================
// TALK
// ======================================================

const talkScene =

  new TalkScene(

    {

      state,

      window:
        talkWindow,

      board:
        talkBoard,

      video:
        talkVideo,

      layer3:
        talkLayer3,

      worm:
        talkWorm,

      character:
        talkCharacter,

      textBox:
        talkTextBox

    }

  );

sceneManager.register(
  "talking",
  talkScene
);



// ======================================================
// ROOM
// ======================================================

const roomScene =

  new RoomScene(

    {

      state,

      window:
        roomWindow,

      board:
        roomBoard,

      sceneImage:
        roomSceneImage,

      leftDoor:
        roomLeftDoor,

      rightDoor:
        roomRightDoor,

      hotspot:
        roomDoorHotspot,

      worm:
        roomWorm,

      textBox:
        roomTextBox

    }

  );

sceneManager.register(
  "room",
  roomScene
);



// ======================================================
// HAND CONTROLLER
// ======================================================

const handController =

  new HandGestureController(

    {

      // =================================================
      // ZOOM
      // =================================================

      onZoom: (
        amount
      ) => {

        if (
          !state.cameraControlsActive
        ) {

          return;

        }

        if (

          state.cutRunning

          &&

          !state.cutCameraActive

        ) {

          return;

        }

        if (

          state.drawRunning

          &&

          !state.drawCameraActive

        ) {

          return;

        }

        // PLAY IS FIXED ZOOM

        if (
          state.playRunning
        ) {

          return;

        }

        state.targetZoom +=
          amount;

        state.targetZoom =

          clamp(

            state.targetZoom,

            MIN_ZOOM,

            MAX_ZOOM

          );

      },

      // =================================================
      // OPEN HAND
      // =================================================

      onPan: (

        x,

        y,

        active

      ) => {

        // =================================================
        // PLAY
        //
        // Do NOT use these low-frequency palm coordinates.
        //
        // The animation loop below reads the actual
        // visible cursor every frame instead.
        // =================================================

        if (
          state.playRunning
        ) {

          state.handPanX =
            0;

          state.handPanY =
            0;

          state.handPanActive =
            false;

          return;

        }

        if (

          state.cutRunning

          &&

          !state.cutCameraActive

        ) {

          state.handPanX =
            0;

          state.handPanY =
            0;

          state.handPanActive =
            false;

          return;

        }

        if (

          state.drawRunning

          &&

          !state.drawCameraActive

        ) {

          state.handPanX =
            0;

          state.handPanY =
            0;

          state.handPanActive =
            false;

          return;

        }

        state.handPanX =
          x;

        state.handPanY =
          y;

        state.handPanActive =
          active;

      },

      // =================================================
      // CLICK
      // =================================================

      onClick: (

        x,

        y

      ) => {

        if (

          state.drawRunning

          &&

          !state.drawCameraActive

          &&

          drawScene
            ?.handleHandClick(
              x,
              y
            )

        ) {

          return;

        }

        virtualClick(
          x,
          y
        );

      }

    }

  );



// ======================================================
// CUT
// ======================================================

const cutScene =

  new CutScene(

    {

      state,

      window:
        cutWindow,

      board:
        cutBoard,

      background:
        cutBackground,

      talkArt:
        cutTalkArt,

      textBox:
        cutTextBox,

      inputPanel:
        cutInputPanel,

      input:
        cutThoughtInput,

      addButton:
        cutAddButton,

      finishButton:
        cutFinishButton,

      modeHint:
        cutModeHint,

      silkMount:
        cutSilkMount,

      getHandState:

        () => ({

          active:
            handController.active,

          visible:
            handController.cursorVisible,

          x:
            handController.cursorX,

          y:
            handController.cursorY,

          fingerCount:
            handController.fingerCount,

          pinching:
            handController.pinching

        }),

      getAudioLevel:

        () =>
          smoothMicLevel

    }

  );

sceneManager.register(
  "cut",
  cutScene
);



// ======================================================
// DRAW
// ======================================================

const drawScene =

  new DrawScene(

    {

      state,

      window:
        drawWindow,

      board:
        drawBoard,

      background:
        drawBackground,

      video1:
        drawVideo1,

      video2:
        drawVideo2,

      paperMount:
        drawPaperMount,

      controls:
        drawControls,

      modeIndicator:
        drawModeIndicator,

      rotateButton:
        drawRotateButton,

      clearFrontButton:
        drawClearFrontButton,

      clearBackButton:
        drawClearBackButton,

      resetButton:
        drawResetButton,

      finishButton:
        drawFinishButton,

      silkHotspot:
        drawSilkHotspot,

      penHotspot:
        drawPenHotspot,

      getHandState:

        () => ({

          active:
            handController.active,

          visible:
            handController.cursorVisible,

          x:
            handController.cursorX,

          y:
            handController.cursorY,

          fingerCount:
            handController.fingerCount,

          pinching:
            handController.pinching

        }),

      textBox:
        drawTextBox

    }

  );

sceneManager.register(
  "draw",
  drawScene
);



// ======================================================
// PLAY
// ======================================================

const playScene =

  new PlayScene(

    {

      state,

      window:
        playWindow,

      board:
        playBoard,

      background3:
        playBackground3,

      worm:
        playWorm,

      background1:
        playBackground1,

      silkMount:
        playSilkMount

    }

  );

sceneManager.register(
  "play",
  playScene
);



// ======================================================
// GLOBAL TIME / ENVIRONMENT
//
// One global source of truth for the virtual clock.
// It only swaps the CURRENT scene when a real time-of-day
// boundary is crossed. Hidden scenes are left alone.
// ======================================================

const timeEnvironmentManager =

  new TimeEnvironmentManager(

    {

      state,

      mount:
        designStage,

      scenes: {

        intro:
          introScene,

        talk:
          talkScene,

        room:
          roomScene,

        cut:
          cutScene,

        draw:
          drawScene,

        play:
          playScene

      }

    }

  );



// ======================================================
// INITIAL PRELOAD
// ======================================================

introScene.updateTime(
  timeInput.value
);

timeEnvironmentManager.setStartTime(
  timeInput.value
);

talkScene.preloadEnvironment(
  introScene.selectedEnvironment
);

roomScene.preload();

cutScene.preload();

drawScene.preload();

playScene.preload();



// ======================================================
// TIME CHANGE
// ======================================================

timeInput.addEventListener(

  "input",

  () => {

    // The setup time can only define the world clock
    // before recording begins. Once recording is active,
    // the virtual clock advances from that original time.

    if (
      state.recordingActive
    ) {

      return;

    }

    introScene.updateTime(
      timeInput.value
    );

    timeEnvironmentManager.setStartTime(
      timeInput.value
    );

    talkScene.preloadEnvironment(
      introScene.selectedEnvironment
    );

  }

);



// ======================================================
// INTRO → TALK
// ======================================================

document.addEventListener(

  "intro-text-complete",

  async (
    event
  ) => {

    const environment =

      timeEnvironmentManager
        .getCurrentEnvironment();

    const success =

      await goToScene(

        "talking",

        {
          environment
        }

      );

    if (
      success
    ) {

      setActiveNavigation(
        "talking"
      );

    }

  }

);



// ======================================================
// TALK → ROOM
// ======================================================

document.addEventListener(

  "talk-complete",

  async (
    event
  ) => {

    const environment =

      timeEnvironmentManager
        .getCurrentEnvironment();

    const success =

      await goToScene(

        "room",

        {
          environment
        }

      );

    if (
      success
    ) {

      setActiveNavigation(
        "tangle"
      );

    }

  }

);



// ======================================================
// ROOM → CUT
// ======================================================

document.addEventListener(

  "room-complete",

  async (
    event
  ) => {

    const environment =

      timeEnvironmentManager
        .getCurrentEnvironment();

    const success =

      await goToScene(

        "cut",

        {
          environment
        }

      );

    if (
      success
    ) {

      setActiveNavigation(
        "tangle"
      );

    }

  }

);



// ======================================================
// CUT → DRAW
// ======================================================

document.addEventListener(

  "cut-complete",

  async (
    event
  ) => {

    const environment =

      timeEnvironmentManager
        .getCurrentEnvironment();

    const success =

      await goToScene(

        "draw",

        {
          environment
        }

      );

    if (
      success
    ) {

      setActiveNavigation(
        "collection"
      );

    }

  }

);



// ======================================================
// DRAW TEXT 1 → PLAY
// ======================================================

drawTextBox.addEventListener(

  "click",

  async (
    event
  ) => {

    if (
      !state.drawRunning
    ) {

      return;

    }

    if (
      !document.body.classList.contains(
        "draw-video2-phase"
      )
    ) {

      return;

    }

    if (
      !document.body.classList.contains(
        "draw-video2-visible"
      )
    ) {

      return;

    }

    if (
      drawTextBox.classList.contains(
        "is-intro"
      )
    ) {

      return;

    }

    event.preventDefault();

    event.stopPropagation();

    void playScene.unlockAudio();

    const letterRecord =

      await playScene
        .finalizeLetterAnalysis();

    const environment =

      timeEnvironmentManager
        .getCurrentEnvironment();

    const success =

      await goToScene(

        "play",

        {

          environment,

          letterRecord

        }

      );

    if (
      success
    ) {

      setActiveNavigation(
        "collection"
      );

    }

  }

);



// ======================================================
// GESTURE GUIDE
// ======================================================

function clearGestureGuideTimers() {

  if (
    gestureGuideShowTimer
  ) {

    clearTimeout(
      gestureGuideShowTimer
    );

    gestureGuideShowTimer =
      null;

  }

  if (
    gestureGuideHideTimer
  ) {

    clearTimeout(
      gestureGuideHideTimer
    );

    gestureGuideHideTimer =
      null;

  }

}


function setGestureGuideOpen(
  open
) {

  gestureGuide.classList.toggle(

    "is-open",

    open

  );

  gestureGuide.setAttribute(

    "aria-hidden",

    open
      ?
      "false"
      :
      "true"

  );

  gestureGuideButton.setAttribute(

    "aria-expanded",

    open
      ?
      "true"
      :
      "false"

  );

}


function showGestureGuideIntro() {

  clearGestureGuideTimers();

  setGestureGuideOpen(
    false
  );

  gestureGuideShowTimer =

    window.setTimeout(

      () => {

        setGestureGuideOpen(
          true
        );

        gestureGuideShowTimer =
          null;

        gestureGuideHideTimer =

          window.setTimeout(

            () => {

              setGestureGuideOpen(
                false
              );

              gestureGuideHideTimer =
                null;

            },

            2000

          );

      },

      350

    );

}


gestureGuideButton.addEventListener(

  "click",

  () => {

    clearGestureGuideTimers();

    const open =

      gestureGuide.classList.contains(
        "is-open"
      );

    setGestureGuideOpen(
      !open
    );

  }

);



// ======================================================
// STARTUP FADE
// ======================================================

function finishStartupFadeAfterAnimation() {

  if (
    startupFade.classList.contains(
      "is-finished"
    )
  ) {

    return;

  }

  if (
    startupFadeFinishTimer
  ) {

    clearTimeout(
      startupFadeFinishTimer
    );

  }

  startupFadeFinishTimer =

    window.setTimeout(

      () => {

        startupFade.classList.add(
          "is-finished"
        );

        startupFadeFinishTimer =
          null;

      },

      950

    );

}



// ======================================================
// MIC BARS
// ======================================================

const meterBarsLeft =
  [];

const meterBarsRight =
  [];

const NUMBER_OF_BARS =
  12;


for (
  let i = 0;
  i < NUMBER_OF_BARS;
  i++
) {

  const leftBar =

    document.createElement(
      "span"
    );

  leftBar.className =
    "meter-bar";

  meterLeft.appendChild(
    leftBar
  );

  meterBarsLeft.push(
    leftBar
  );

  const rightBar =

    document.createElement(
      "span"
    );

  rightBar.className =
    "meter-bar";

  meterRight.appendChild(
    rightBar
  );

  meterBarsRight.push(
    rightBar
  );

}



// ======================================================
// CAMERA PERMISSION
// ======================================================

cameraButton.addEventListener(

  "click",

  async () => {

    if (
      cameraAllowed
    ) {

      return;

    }

    cameraStatus.textContent =
      "REQUESTING...";

    try {

      cameraStream =

        await navigator
          .mediaDevices
          .getUserMedia(

            {

              video: {

                width: {
                  ideal: 480
                },

                height: {
                  ideal: 360
                },

                frameRate: {

                  ideal: 24,

                  max: 30

                },

                facingMode:
                  "user"

              },

              audio:
                false

            }

          );

      webcamPreview.srcObject =
        cameraStream;

      await webcamPreview.play();

      cameraAllowed =
        true;

      cameraStatus.textContent =
        "ALLOWED";

      cameraStatus.classList.add(
        "allowed"
      );

      previewMessage.textContent =
        "";

      await handController.load();

      handController.setActive(
        previewVisible
      );

    }

    catch (
      error
    ) {

      console.error(

        "CAMERA ERROR:",

        error

      );

      cameraStatus.textContent =
        "BLOCKED";

      handController.setActive(
        false
      );

    }

  }

);



// ======================================================
// MICROPHONE
// ======================================================

micButton.addEventListener(

  "click",

  async () => {

    if (
      micAllowed
    ) {

      return;

    }

    micStatus.textContent =
      "REQUESTING...";

    try {

      microphoneStream =

        await navigator
          .mediaDevices
          .getUserMedia(

            {

              audio:
                true,

              video:
                false

            }

          );

      audioContext =

        new (

          window.AudioContext

          ||

          window.webkitAudioContext

        )();

      await audioContext.resume();

      const source =

        audioContext
          .createMediaStreamSource(

            microphoneStream

          );

      analyser =

        audioContext
          .createAnalyser();

      analyser.fftSize =
        256;

      analyser.smoothingTimeConstant =
        0.72;

      waveform =

        new Uint8Array(

          analyser.fftSize

        );

      source.connect(
        analyser
      );

      micAllowed =
        true;

      micStatus.textContent =
        "ALLOWED";

      micStatus.classList.add(
        "allowed"
      );

    }

    catch (
      error
    ) {

      console.error(

        "MIC ERROR:",

        error

      );

      micStatus.textContent =
        "BLOCKED";

    }

  }

);



// ======================================================
// START INTRO
// ======================================================

enterButton.addEventListener(

  "click",

  async () => {

    timeEnvironmentManager.setStartTime(
      timeInput.value
    );

    bootScreen.classList.add(
      "is-hidden"
    );

    await goToScene(

      "intro",

      {

        timeValue:
          timeInput.value

      }

    );

    handController.setActive(

      cameraAllowed

      &&

      previewVisible

    );

    setActiveNavigation(
      "intro"
    );

    showGestureGuideIntro();

    finishStartupFadeAfterAnimation();

  }

);



// ======================================================
// CAMERA PREVIEW
// ======================================================

eyeButton.addEventListener(

  "click",

  () => {

    previewVisible =
      !previewVisible;

    webcamPreview.classList.toggle(

      "preview-hidden",

      !previewVisible

    );

    eyeButton.classList.toggle(

      "is-off",

      !previewVisible

    );

    if (
      !cameraAllowed
    ) {

      previewMessage.textContent =
        "CAMERA OFF";

      handController.setActive(
        false
      );

      return;

    }

    if (
      previewVisible
    ) {

      previewMessage.textContent =
        "";

      handController.setActive(
        true
      );

    }

    else {

      previewMessage.textContent =
        "PREVIEW OFF";

      handController.setActive(
        false
      );

    }

  }

);



// ======================================================
// MENU
// ======================================================

menuButton.addEventListener(

  "click",

  () => {

    menuPanel.classList.toggle(
      "is-open"
    );

  }

);



// ======================================================
// ACTIVE NAVIGATION
// ======================================================

function setActiveNavigation(
  stage
) {

  navItems.forEach(

    (
      item
    ) => {

      item.classList.toggle(

        "active",

        item.dataset.stage === stage

      );

    }

  );

}



// ======================================================
// MENU
// ======================================================

navItems.forEach(

  (
    item
  ) => {

    item.addEventListener(

      "click",

      async () => {

        const stage =
          item.dataset.stage;

        if (
          stage === "intro"
        ) {

          const success =

            await goToScene(

              "intro",

              {

                timeValue:
                  timeEnvironmentManager
                    .getCurrentTimeValue()

              }

            );

          if (
            success
          ) {

            setActiveNavigation(
              "intro"
            );

          }

          menuPanel.classList.remove(
            "is-open"
          );

          return;

        }

        if (
          stage === "talking"
        ) {

          const success =

            await goToScene(

              "talking",

              {

                environment:
                  timeEnvironmentManager
                    .getCurrentEnvironment()

              }

            );

          if (
            success
          ) {

            setActiveNavigation(
              "talking"
            );

          }

          menuPanel.classList.remove(
            "is-open"
          );

          return;

        }

        if (
          stage === "tangle"
        ) {

          const success =

            await goToScene(

              "room",

              {

                environment:
                  timeEnvironmentManager
                    .getCurrentEnvironment()

              }

            );

          if (
            success
          ) {

            setActiveNavigation(
              "tangle"
            );

          }

          menuPanel.classList.remove(
            "is-open"
          );

          return;

        }

        if (
          stage === "collection"
        ) {

          const success =

            await goToScene(

              "draw",

              {

                environment:
                  timeEnvironmentManager
                    .getCurrentEnvironment()

              }

            );

          if (
            success
          ) {

            setActiveNavigation(
              "collection"
            );

          }

          menuPanel.classList.remove(
            "is-open"
          );

          return;

        }

      }

    );

  }

);



// ======================================================
// MOUSE POSITION
// ======================================================

window.addEventListener(

  "mousemove",

  (
    event
  ) => {

    const rect =

      designStage
        .getBoundingClientRect();

    let normalizedX =

      (

        event.clientX

        -

        rect.left

      )

      /

      rect.width;

    let normalizedY =

      (

        event.clientY

        -

        rect.top

      )

      /

      rect.height;

    normalizedX =

      clamp(

        normalizedX,

        0,

        1

      );

    normalizedY =

      clamp(

        normalizedY,

        0,

        1

      );

    state.mouseNormalizedX =

      normalizedX

      *

      2

      -

      1;

    state.mouseNormalizedY =

      normalizedY

      *

      2

      -

      1;

  }

);



// ======================================================
// SHARED WHEEL ZOOM
// ======================================================

window.addEventListener(

  "wheel",

  (
    event
  ) => {

    if (
      !state.cameraControlsActive
    ) {

      return;

    }

    if (

      state.cutRunning

      &&

      !state.cutCameraActive

    ) {

      return;

    }

    if (

      state.drawRunning

      &&

      !state.drawCameraActive

    ) {

      return;

    }

    if (
      state.playRunning
    ) {

      return;

    }

    event.preventDefault();

    if (
      event.deltaY < 0
    ) {

      state.targetZoom +=
        0.12;

    }

    else {

      state.targetZoom -=
        0.12;

    }

    state.targetZoom =

      clamp(

        state.targetZoom,

        MIN_ZOOM,

        MAX_ZOOM

      );

  },

  {

    passive:
      false

  }

);



// ======================================================
// VIRTUAL CLICK
// ======================================================

function virtualClick(
  x,
  y
) {

  const element =

    document.elementFromPoint(

      x,

      y

    );

  if (
    !element
  ) {

    return;

  }

  element.dispatchEvent(

    new MouseEvent(

      "mousedown",

      {

        bubbles:
          true,

        clientX:
          x,

        clientY:
          y

      }

    )

  );

  element.dispatchEvent(

    new MouseEvent(

      "mouseup",

      {

        bubbles:
          true,

        clientX:
          x,

        clientY:
          y

      }

    )

  );

  element.dispatchEvent(

    new MouseEvent(

      "click",

      {

        bubbles:
          true,

        clientX:
          x,

        clientY:
          y

      }

    )

  );

}



// ======================================================
// BOARD SIZE
// ======================================================

function resizeSceneBoards() {

  state.boardWidth =
    BASE_WIDTH;

  state.boardHeight =
    BASE_HEIGHT;

  sceneBoard.style.width =
    `${BASE_WIDTH}px`;

  sceneBoard.style.height =
    `${BASE_HEIGHT}px`;

  talkBoard.style.width =
    `${BASE_WIDTH}px`;

  talkBoard.style.height =
    `${BASE_HEIGHT}px`;

  roomBoard.style.width =
    `${BASE_WIDTH}px`;

  roomBoard.style.height =
    `${BASE_HEIGHT}px`;

  cutBoard.style.width =
    `${BASE_WIDTH}px`;

  cutBoard.style.height =
    `${BASE_HEIGHT}px`;

  drawBoard.style.width =
    `${BASE_WIDTH}px`;

  drawBoard.style.height =
    `${BASE_HEIGHT}px`;

  playBoard.style.width =
    `${BASE_WIDTH}px`;

  playBoard.style.height =
    `${BASE_HEIGHT}px`;

}



// ======================================================
// RESIZE
// ======================================================

window.addEventListener(

  "resize",

  () => {

    resizeDesignStage();

    resizeSceneBoards();

  }

);

resizeDesignStage();

resizeSceneBoards();



// ======================================================
// HELPERS
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


function lerpValue(

  from,

  to,

  amount

) {

  return (

    from

    +

    (

      to

      -

      from

    )

    *

    amount

  );

}



// ======================================================
// MAIN LOOP
// ======================================================

function animationLoop(
  now
) {

  // ===================================================
  // HAND TRACKING
  // ===================================================

  if (

    cameraAllowed

    &&

    previewVisible

    &&

    state.cameraControlsActive

  ) {

    handController.update(

      webcamPreview,

      now

    );

  }

  // ===================================================
  // PLAY OPEN-HAND INSTRUMENT
  //
  // THIS IS THE IMPORTANT NEW PART.
  //
  // Every animation frame:
  //
  // 5 fingers =
  // use the ACTUAL white hand cursor coordinates.
  //
  // This gives PLAY the same spatial movement feeling
  // as the real mouse.
  // ===================================================

  if (
    state.playRunning
  ) {

    const fiveFingerPlaying =

      handController.active

      &&

      handController.cursorVisible

      &&

      handController.fingerCount >= 5;

    playScene.handleHandCursor(

      handController.cursorX,

      handController.cursorY,

      fiveFingerPlaying

    );

  }

  // ===================================================
  // FIXED CAMERA
  // ===================================================

  const fixedCamera =

    (

      state.cutRunning

      &&

      !state.cutCameraActive

    )

    ||

    (

      state.drawRunning

      &&

      !state.drawCameraActive

    )

    ||

    state.playRunning;

  // ===================================================
  // ZOOM
  // ===================================================

  if (
    fixedCamera
  ) {

    state.targetZoom =
      1;

    state.currentZoom =
      1;

  }

  else {

    state.currentZoom =

      lerpValue(

        state.currentZoom,

        state.targetZoom,

        0.085

      );

  }

  // ===================================================
  // SAFE PAN
  // ===================================================

  const scaledWidth =

    BASE_WIDTH

    *

    state.currentZoom;

  const scaledHeight =

    BASE_HEIGHT

    *

    state.currentZoom;

  const safePanX =

    Math.max(

      0,

      (

        scaledWidth

        -

        BASE_WIDTH

      )

      /

      2

      -

      3

    );

  const safePanY =

    Math.max(

      0,

      (

        scaledHeight

        -

        BASE_HEIGHT

      )

      /

      2

      -

      3

    );

  let desiredPanX =
    0;

  let desiredPanY =
    0;

  if (
    fixedCamera
  ) {

    desiredPanX =
      0;

    desiredPanY =
      0;

    state.handPanActive =
      false;

  }

  else if (
    state.handPanActive
  ) {

    desiredPanX =

      -state.handPanX

      *

      Math.min(

        safePanX,

        BASE_WIDTH

        *

        0.22

      );

    desiredPanY =

      -state.handPanY

      *

      Math.min(

        safePanY,

        BASE_HEIGHT

        *

        0.16

      );

  }

  else {

    desiredPanX =

      -state.mouseNormalizedX

      *

      Math.min(

        safePanX,

        BASE_WIDTH

        *

        0.12

      );

    desiredPanY =

      -state.mouseNormalizedY

      *

      Math.min(

        safePanY,

        BASE_HEIGHT

        *

        0.08

      );

  }

  state.currentPanX =

    lerpValue(

      state.currentPanX,

      desiredPanX,

      0.06

    );

  state.currentPanY =

    lerpValue(

      state.currentPanY,

      desiredPanY,

      0.06

    );

  // ===================================================
  // CAMERA TRANSFORM
  // ===================================================

  const cameraTransform =

    `translate(-50%, -50%)

     translate3d(
       ${state.currentPanX}px,
       ${state.currentPanY}px,
       0
     )

     scale(${state.currentZoom})`;

  sceneBoard.style.transform =
    cameraTransform;

  talkBoard.style.transform =
    cameraTransform;

  roomBoard.style.transform =
    cameraTransform;

  if (

    state.drawRunning

    &&

    state.drawCameraActive

  ) {

    drawBoard.style.transform =
      cameraTransform;

  }

  else {

    drawBoard.style.transform =
      "translate(-50%, -50%)";

  }

  // ===================================================
  // PLAY ALWAYS FIXED
  // ===================================================

  playBoard.style.transform =
    "translate(-50%, -50%)";

  // ===================================================
  // CURRENT SCENE
  // ===================================================

  sceneManager.update(
    now
  );

  updateZoomUI();

  requestAnimationFrame(
    animationLoop
  );

}


requestAnimationFrame(
  animationLoop
);



// ======================================================
// ZOOM HUD
// ======================================================

function updateZoomUI() {

  if (

    state.cutRunning

    &&

    !state.cutCameraActive

  ) {

    zoomLabel.textContent =
      "FIXED FISHEYE ZOOM";

    zoomMarker.style.left =
      "50%";

    return;

  }

  if (

    state.drawRunning

    &&

    !state.drawCameraActive

  ) {

    zoomLabel.textContent =
      "FIXED ZOOM";

    zoomMarker.style.left =
      "50%";

    return;

  }

  if (
    state.playRunning
  ) {

    zoomLabel.textContent =
      "FIXED ZOOM";

    zoomMarker.style.left =
      "50%";

    return;

  }

  zoomLabel.textContent =

    `ZOOM ${
      state.currentZoom.toFixed(
        1
      )
    }×`;

  const percentage =

    (

      (

        state.currentZoom

        -

        MIN_ZOOM

      )

      /

      (

        MAX_ZOOM

        -

        MIN_ZOOM

      )

    )

    *

    100;

  zoomMarker.style.left =

    `${
      clamp(

        percentage,

        0,

        100

      )
    }%`;

}



// ======================================================
// MIC
// ======================================================

function readMicLevel() {

  if (

    !micAllowed

    ||

    !analyser

    ||

    !waveform

  ) {

    return 0;

  }

  analyser.getByteTimeDomainData(
    waveform
  );

  let total =
    0;

  for (
    let i = 0;
    i < waveform.length;
    i++
  ) {

    const value =

      (

        waveform[i]

        -

        128

      )

      /

      128;

    total +=

      value

      *

      value;

  }

  const rms =

    Math.sqrt(

      total

      /

      waveform.length

    );

  return clamp(

    rms

    *

    5,

    0,

    1

  );

}



// ======================================================
// METERS
// ======================================================

function updateMeters() {

  const level =
    readMicLevel();

  smoothMicLevel =

    lerpValue(

      smoothMicLevel,

      level,

      0.28

    );

  const activeBars =

    Math.floor(

      smoothMicLevel

      *

      18

    );

  updateMeterRow(

    meterBarsLeft,

    activeBars

  );

  const rightActive =

    clamp(

      activeBars

      +

      Math.round(

        Math.sin(

          performance.now()

          *

          0.006

        )

      ),

      0,

      NUMBER_OF_BARS

    );

  updateMeterRow(

    meterBarsRight,

    rightActive

  );

}


setInterval(

  updateMeters,

  50

);


function updateMeterRow(

  bars,

  activeCount

) {

  bars.forEach(

    (
      bar,
      index
    ) => {

      bar.classList.remove(

        "is-active",

        "is-green",

        "is-yellow",

        "is-red"

      );

      if (
        index >= activeCount
      ) {

        return;

      }

      bar.classList.add(
        "is-active"
      );

      if (
        index < 8
      ) {

        bar.classList.add(
          "is-green"
        );

      }

      else if (
        index < 10
      ) {

        bar.classList.add(
          "is-yellow"
        );

      }

      else {

        bar.classList.add(
          "is-red"
        );

      }

    }

  );

}



// ======================================================
// RECORD TIMER
// ======================================================

function updateTimer() {

  if (
    !state.recordingActive
  ) {

    timerElement.textContent =
      "00:00:00";

    return;

  }

  const elapsed =

    Math.floor(

      (

        performance.now()

        -

        state.recordingStartedAt

      )

      /

      1000

    );

  timeEnvironmentManager.updateFromElapsedSeconds(
    elapsed
  );

  const hours =

    Math.floor(

      elapsed

      /

      3600

    );

  const minutes =

    Math.floor(

      (

        elapsed

        %

        3600

      )

      /

      60

    );

  const seconds =

    elapsed

    %

    60;

  timerElement.textContent =

    `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

}


setInterval(

  updateTimer,

  250

);


function pad2(
  value
) {

  return String(
    value
  )
  .padStart(

    2,

    "0"

  );

}