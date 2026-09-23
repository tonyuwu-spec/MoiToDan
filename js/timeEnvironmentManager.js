// ======================================================
// MỜI TỪ ĐÀN
// GLOBAL TIME / ENVIRONMENT MANAGER
// ======================================================

const MINUTES_PER_DAY =
  24 * 60;

const ENVIRONMENT_NAMES = [
  "dawn",
  "morning",
  "dusk",
  "night"
];

const TRANSITION_FADE_TIME =
  420;

const MESSAGE_BEFORE_SWAP_TIME =
  900;

const MESSAGE_AFTER_SWAP_TIME =
  420;

const SCENE_STABLE_TIMEOUT =
  2600;

const SCENE_STABLE_POLL =
  50;

const VIDEO_LOAD_TIMEOUT =
  1800;

const ENVIRONMENT_MESSAGES = {

  dawn: {
    title:
      "It's... dawn.",
    note:
      "I need to charge my camera a bit."
  },

  morning: {
    title:
      "It's... morning.",
    note:
      "I need to charge my camera a bit."
  },

  dusk: {
    title:
      "It's... dusk.",
    note:
      "I need to charge my camera a bit."
  },

  night: {
    title:
      "It's... night.",
    note:
      "I need to charge my camera a bit."
  }

};

export class TimeEnvironmentManager {

  constructor(
    options = {}
  ) {

    this.state =
      options.state;

    this.scenes =
      options.scenes
      ||
      {};

    this.mount =
      options.mount
      ||
      document.getElementById(
        "design-stage"
      );

    this.startMinutes =
      null;

    this.currentEnvironment =
      "dawn";

    this.lastVirtualMinute =
      null;

    this.transitionInProgress =
      false;

    this.pendingEnvironment =
      null;

    this.overlay =
      null;

    this.overlayTitle =
      null;

    this.overlayNote =
      null;

    // ==================================================
    // DOM IS LOOKED UP ONCE ONLY.
    //
    // No repeated querySelector work happens in the
    // recording timer.
    // ==================================================

    this.elements = {

      introVideo:
        document.getElementById(
          "scene-video"
        ),

      introTree1:
        document.getElementById(
          "tree1"
        ),

      introTree2:
        document.getElementById(
          "tree2"
        ),

      introTree3:
        document.getElementById(
          "tree3"
        ),

      introText:
        document.getElementById(
          "intro-textbox"
        ),

      talkWindow:
        document.getElementById(
          "talk-window"
        ),

      talkVideo:
        document.getElementById(
          "talk-video"
        ),

      talkLayer3:
        document.getElementById(
          "talk-layer3"
        ),

      talkWorm:
        document.getElementById(
          "talk-worm"
        ),

      talkCharacter:
        document.getElementById(
          "talk-character"
        ),

      talkText:
        document.getElementById(
          "talk-textbox"
        ),

      roomWindow:
        document.getElementById(
          "room-window"
        ),

      roomScene:
        document.getElementById(
          "room-scene-image"
        ),

      roomLeftDoor:
        document.getElementById(
          "room-left-door"
        ),

      roomRightDoor:
        document.getElementById(
          "room-right-door"
        ),

      roomWorm:
        document.getElementById(
          "room-worm"
        ),

      roomText:
        document.getElementById(
          "room-textbox"
        ),

      cutWindow:
        document.getElementById(
          "cut-window"
        ),

      cutBackground:
        document.getElementById(
          "cut-bg"
        ),

      drawWindow:
        document.getElementById(
          "draw-window"
        ),

      drawBackground:
        document.getElementById(
          "draw-bg"
        ),

      drawVideo1:
        document.getElementById(
          "draw-video1"
        ),

      drawVideo2:
        document.getElementById(
          "draw-video2"
        ),

      playWindow:
        document.getElementById(
          "play-window"
        ),

      playBackground3:
        document.getElementById(
          "play-bg3"
        ),

      playWorm:
        document.getElementById(
          "play-worm"
        ),

      playBackground1:
        document.getElementById(
          "play-bg1"
        )

    };

  }



  // ====================================================
  // START TIME
  // ====================================================

  setStartTime(
    value
  ) {

    this.startMinutes =
      parseTimeToMinutes(
        value
      );

    this.lastVirtualMinute =
      this.startMinutes;

    this.currentEnvironment =
      classifyMinutes(
        this.startMinutes
      );

    this.pendingEnvironment =
      null;

  }



  // ====================================================
  // CURRENT ENVIRONMENT
  // ====================================================

  getCurrentEnvironment() {

    return (
      this.currentEnvironment
      ||
      "dawn"
    );

  }



  // ====================================================
  // CURRENT VIRTUAL HH:MM
  //
  // Used when the user goes back to INTRO from the menu.
  // INTRO can keep using its existing classifyTime().
  // ====================================================

  getCurrentTimeValue() {

    const minute =
      this.getCurrentVirtualMinute();

    const hours =
      Math.floor(
        minute / 60
      );

    const minutes =
      minute % 60;

    return (
      `${pad2(hours)}:${pad2(minutes)}`
    );

  }



  // ====================================================
  // CURRENT VIRTUAL MINUTE
  // ====================================================

  getCurrentVirtualMinute() {

    if (
      this.startMinutes === null
    ) {

      return (
        5 * 60 + 30
      );

    }

    if (
      !this.state?.recordingActive
    ) {

      return this.startMinutes;

    }

    const elapsedSeconds =
      Math.max(
        0,
        Math.floor(
          (
            performance.now()
            -
            this.state.recordingStartedAt
          )
          /
          1000
        )
      );

    return wrapMinute(
      this.startMinutes
      +
      Math.floor(
        elapsedSeconds / 60
      )
    );

  }



  // ====================================================
  // TIMER UPDATE
  //
  // sketch.js already updates the Handycam timer every
  // 250ms. We reuse that timer instead of creating a new
  // interval.
  //
  // Almost every call returns immediately. Real work only
  // happens when the virtual minute changes.
  // ====================================================

  updateFromElapsedSeconds(
    elapsedSeconds
  ) {

    if (
      !this.state?.recordingActive
      ||
      this.startMinutes === null
    ) {

      return;

    }

    const virtualMinute =
      wrapMinute(
        this.startMinutes
        +
        Math.floor(
          Math.max(
            0,
            elapsedSeconds
          )
          /
          60
        )
      );

    // ==================================================
    // If a scene was entered during a very small timing
    // race, make sure its environment still matches the
    // global clock.
    // ==================================================

    const activeSceneKey =
      this.getActiveSceneKey();

    const activeScene =
      activeSceneKey
      ?
      this.scenes[
        activeSceneKey
      ]
      :
      null;

    if (
      activeScene
      &&
      activeScene.selectedEnvironment
      &&
      activeScene.selectedEnvironment
      !==
      this.currentEnvironment
      &&
      !this.transitionInProgress
    ) {

      void this.beginTransition(
        activeScene.selectedEnvironment,
        this.currentEnvironment
      );

      return;

    }

    // ==================================================
    // No minute change = no more work.
    // ==================================================

    if (
      virtualMinute ===
      this.lastVirtualMinute
    ) {

      return;

    }

    this.lastVirtualMinute =
      virtualMinute;

    const nextEnvironment =
      classifyMinutes(
        virtualMinute
      );

    if (
      nextEnvironment ===
      this.currentEnvironment
    ) {

      return;

    }

    const previousEnvironment =
      this.currentEnvironment;

    // Update the global truth immediately.
    // Any scene entered from this moment receives the new
    // time even while the black transition is playing.

    this.currentEnvironment =
      nextEnvironment;

    if (
      this.transitionInProgress
    ) {

      this.pendingEnvironment =
        nextEnvironment;

      return;

    }

    if (
      !this.getActiveSceneKey()
    ) {

      return;

    }

    void this.beginTransition(
      previousEnvironment,
      nextEnvironment
    );

  }



  // ====================================================
  // TRANSITION
  // ====================================================

  async beginTransition(
    previousEnvironment,
    nextEnvironment
  ) {

    if (
      this.transitionInProgress
    ) {

      this.pendingEnvironment =
        nextEnvironment;

      return;

    }

    if (
      previousEnvironment ===
      nextEnvironment
      &&
      !this.sceneNeedsEnvironmentSync()
    ) {

      return;

    }

    this.transitionInProgress =
      true;

    this.pendingEnvironment =
      null;

    const overlay =
      this.ensureOverlay();

    this.setOverlayMessage(
      nextEnvironment
    );

    overlay.style.visibility =
      "visible";

    overlay.style.pointerEvents =
      "auto";

    overlay.style.opacity =
      "0";

    this.overlayTitle.style.opacity =
      "0";

    this.overlayNote.style.opacity =
      "0";

    await nextPaint();

    overlay.style.opacity =
      "1";

    await wait(
      TRANSITION_FADE_TIME
    );

    this.overlayTitle.style.opacity =
      "1";

    this.overlayNote.style.opacity =
      "1";

    await wait(
      MESSAGE_BEFORE_SWAP_TIME
    );

    const sceneKey =
      await this.waitForCurrentSceneStable();

    if (
      sceneKey
    ) {

      await this.applyEnvironmentToScene(
        sceneKey,
        nextEnvironment
      );

    }

    await wait(
      MESSAGE_AFTER_SWAP_TIME
    );

    this.overlayTitle.style.opacity =
      "0";

    this.overlayNote.style.opacity =
      "0";

    await wait(
      120
    );

    overlay.style.opacity =
      "0";

    await wait(
      TRANSITION_FADE_TIME
    );

    overlay.style.visibility =
      "hidden";

    overlay.style.pointerEvents =
      "none";

    this.transitionInProgress =
      false;

    const pending =
      this.pendingEnvironment;

    this.pendingEnvironment =
      null;

    if (
      pending
      &&
      pending !==
      nextEnvironment
    ) {

      void this.beginTransition(
        nextEnvironment,
        pending
      );

    }

  }



  // ====================================================
  // ACTIVE SCENE
  // ====================================================

  getActiveSceneKey() {

    if (
      this.state?.introRunning
    ) {

      return "intro";

    }

    if (
      this.state?.talkRunning
    ) {

      return "talk";

    }

    if (
      this.state?.roomRunning
    ) {

      return "room";

    }

    if (
      this.state?.cutRunning
    ) {

      return "cut";

    }

    if (
      this.state?.drawRunning
    ) {

      return "draw";

    }

    if (
      this.state?.playRunning
    ) {

      return "play";

    }

    return null;

  }



  // ====================================================
  // SCENE SYNC CHECK
  // ====================================================

  sceneNeedsEnvironmentSync() {

    const key =
      this.getActiveSceneKey();

    if (
      !key
    ) {

      return false;

    }

    const scene =
      this.scenes[
        key
      ];

    if (
      !scene
    ) {

      return false;

    }

    return (
      scene.selectedEnvironment
      !==
      this.currentEnvironment
    );

  }



  // ====================================================
  // WAIT UNTIL THE CURRENT STORY TRANSITION IS SAFE
  //
  // This polling only runs during the rare time-change
  // overlay. It does not run continuously.
  // ====================================================

  async waitForCurrentSceneStable() {

    const deadline =
      performance.now()
      +
      SCENE_STABLE_TIMEOUT;

    while (
      performance.now()
      <
      deadline
    ) {

      const key =
        this.getActiveSceneKey();

      if (
        !key
      ) {

        return null;

      }

      if (
        this.isSceneStable(
          key
        )
      ) {

        return key;

      }

      await wait(
        SCENE_STABLE_POLL
      );

    }

    return this.getActiveSceneKey();

  }



  // ====================================================
  // SCENE STABILITY
  // ====================================================

  isSceneStable(
    key
  ) {

    const scene =
      this.scenes[
        key
      ];

    if (
      !scene
    ) {

      return true;

    }

    if (
      key === "intro"
    ) {

      return !scene.textTransitioning;

    }

    if (
      key === "talk"
    ) {

      return !scene.textTransitioning;

    }

    if (
      key === "room"
    ) {

      return (
        !scene.textTransitioning
        &&
        !scene.roomTransitioning
      );

    }

    if (
      key === "draw"
    ) {

      return (
        scene.phase
        !==
        "transition"
      );

    }

    return true;

  }



  // ====================================================
  // APPLY ONLY TO THE SCENE THAT IS CURRENTLY VISIBLE
  //
  // Hidden scenes are not reloaded. This keeps network,
  // decoding and browser work low.
  // ====================================================

  async applyEnvironmentToScene(
    key,
    environmentName
  ) {

    if (
      !ENVIRONMENT_NAMES.includes(
        environmentName
      )
    ) {

      return;

    }

    const scene =
      this.scenes[
        key
      ];

    if (
      scene
    ) {

      scene.selectedEnvironment =
        environmentName;

      if (
        scene.window?.dataset
      ) {

        scene.window.dataset.environment =
          environmentName;

      }

    }

    if (
      key === "intro"
    ) {

      this.swapImage(
        this.elements.introTree1,
        environmentName
      );

      this.swapImage(
        this.elements.introTree2,
        environmentName
      );

      this.swapImage(
        this.elements.introTree3,
        environmentName
      );

      this.swapImage(
        this.elements.introText,
        environmentName
      );

      await this.swapActiveVideo(
        this.elements.introVideo,
        environmentName
      );

      return;

    }

    if (
      key === "talk"
    ) {

      this.elements.talkWindow.dataset.environment =
        environmentName;

      this.swapImage(
        this.elements.talkLayer3,
        environmentName
      );

      this.swapImage(
        this.elements.talkWorm,
        environmentName
      );

      this.swapImage(
        this.elements.talkCharacter,
        environmentName
      );

      this.swapImage(
        this.elements.talkText,
        environmentName
      );

      await this.swapActiveVideo(
        this.elements.talkVideo,
        environmentName
      );

      return;

    }

    if (
      key === "room"
    ) {

      this.elements.roomWindow.dataset.environment =
        environmentName;

      this.swapImage(
        this.elements.roomScene,
        environmentName
      );

      this.swapImage(
        this.elements.roomLeftDoor,
        environmentName
      );

      this.swapImage(
        this.elements.roomRightDoor,
        environmentName
      );

      this.swapImage(
        this.elements.roomWorm,
        environmentName
      );

      this.swapImage(
        this.elements.roomText,
        environmentName
      );

      return;

    }

    if (
      key === "cut"
    ) {

      this.elements.cutWindow.dataset.environment =
        environmentName;

      this.swapImage(
        this.elements.cutBackground,
        environmentName
      );

      return;

    }

    if (
      key === "draw"
    ) {

      this.elements.drawWindow.dataset.environment =
        environmentName;

      this.swapImage(
        this.elements.drawBackground,
        environmentName
      );

      const phase =
        scene?.phase
        ||
        "idle";

      if (
        phase === "video1"
      ) {

        this.swapIdleVideo(
          this.elements.drawVideo2,
          environmentName
        );

        await this.swapActiveVideo(
          this.elements.drawVideo1,
          environmentName
        );

        return;

      }

      if (
        phase === "video2"
      ) {

        this.swapIdleVideo(
          this.elements.drawVideo1,
          environmentName
        );

        await this.swapActiveVideo(
          this.elements.drawVideo2,
          environmentName
        );

        return;

      }

      this.swapIdleVideo(
        this.elements.drawVideo1,
        environmentName
      );

      this.swapIdleVideo(
        this.elements.drawVideo2,
        environmentName
      );

      return;

    }

    if (
      key === "play"
    ) {

      this.elements.playWindow.dataset.environment =
        environmentName;

      this.swapImage(
        this.elements.playBackground3,
        environmentName
      );

      this.swapImage(
        this.elements.playWorm,
        environmentName
      );

      this.swapImage(
        this.elements.playBackground1,
        environmentName
      );

    }

  }



  // ====================================================
  // IMAGE SWAP
  // ====================================================

  swapImage(
    image,
    environmentName
  ) {

    if (
      !image
    ) {

      return;

    }

    const currentSource =
      image.getAttribute(
        "src"
      )
      ||
      "";

    const nextSource =
      replaceEnvironmentToken(
        currentSource,
        environmentName
      );

    if (
      !nextSource
      ||
      nextSource === currentSource
    ) {

      return;

    }

    image.src =
      nextSource;

  }



  // ====================================================
  // IDLE VIDEO SWAP
  //
  // Used for a DRAW video that is not currently playing.
  // No explicit load() is forced here.
  // ====================================================

  swapIdleVideo(
    video,
    environmentName
  ) {

    if (
      !video
    ) {

      return;

    }

    const currentSource =
      video.getAttribute(
        "src"
      )
      ||
      "";

    const nextSource =
      replaceEnvironmentToken(
        currentSource,
        environmentName
      );

    if (
      !nextSource
      ||
      nextSource === currentSource
    ) {

      return;

    }

    video.src =
      nextSource;

  }



  // ====================================================
  // PLAYING VIDEO SWAP
  //
  // Keeps the current video timestamp and whether the
  // video was playing. This means only the time-of-day
  // version changes; the story position does not.
  // ====================================================

  async swapActiveVideo(
    video,
    environmentName
  ) {

    if (
      !video
    ) {

      return;

    }

    const currentSource =
      video.getAttribute(
        "src"
      )
      ||
      "";

    const nextSource =
      replaceEnvironmentToken(
        currentSource,
        environmentName
      );

    if (
      !nextSource
      ||
      nextSource === currentSource
    ) {

      return;

    }

    const oldTime =
      Number.isFinite(
        video.currentTime
      )
      ?
      video.currentTime
      :
      0;

    const shouldResume =
      !video.paused
      &&
      !video.ended;

    try {

      video.pause();

    }

    catch (
      error
    ) {

      void error;

    }

    await new Promise(

      (
        resolve
      ) => {

        let finished =
          false;

        let timeoutId =
          null;

        const finish =
          () => {

            if (
              finished
            ) {

              return;

            }

            finished =
              true;

            if (
              timeoutId
            ) {

              clearTimeout(
                timeoutId
              );

            }

            video.removeEventListener(
              "loadedmetadata",
              restore
            );

            resolve();

          };

        const restore =
          () => {

            if (
              finished
            ) {

              return;

            }

            let targetTime =
              oldTime;

            if (
              Number.isFinite(
                video.duration
              )
              &&
              video.duration > 0
            ) {

              targetTime =
                Math.min(
                  oldTime,
                  Math.max(
                    0,
                    video.duration - 0.05
                  )
                );

            }

            try {

              video.currentTime =
                targetTime;

            }

            catch (
              error
            ) {

              void error;

            }

            if (
              shouldResume
            ) {

              video
                .play()
                .catch(
                  () => {}
                );

            }

            finish();

          };

        video.addEventListener(
          "loadedmetadata",
          restore,
          {
            once:
              true
          }
        );

        video.src =
          nextSource;

        video.load();

        timeoutId =
          window.setTimeout(
            restore,
            VIDEO_LOAD_TIMEOUT
          );

      }

    );

  }



  // ====================================================
  // OVERLAY
  //
  // Created lazily only on the first actual environment
  // boundary. Nothing extra is added during normal use.
  // ====================================================

  ensureOverlay() {

    if (
      this.overlay
    ) {

      return this.overlay;

    }

    const overlay =
      document.createElement(
        "div"
      );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    Object.assign(
      overlay.style,
      {
        position:
          "absolute",
        inset:
          "0",
        zIndex:
          "140",
        display:
          "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        gap:
          "16px",
        width:
          "2560px",
        height:
          "1440px",
        background:
          "#000",
        color:
          "#fff",
        opacity:
          "0",
        visibility:
          "hidden",
        pointerEvents:
          "none",
        transition:
          `opacity ${TRANSITION_FADE_TIME}ms ease`,
        fontFamily:
          '"Lucida Console", "Courier New", monospace',
        textAlign:
          "center"
      }
    );

    const title =
      document.createElement(
        "div"
      );

    Object.assign(
      title.style,
      {
        fontSize:
          "38px",
        fontWeight:
          "700",
        lineHeight:
          "1.2",
        letterSpacing:
          "0.025em",
        opacity:
          "0",
        transition:
          "opacity 220ms ease"
      }
    );

    const note =
      document.createElement(
        "div"
      );

    Object.assign(
      note.style,
      {
        fontSize:
          "18px",
        fontWeight:
          "700",
        lineHeight:
          "1.5",
        letterSpacing:
          "0.035em",
        color:
          "rgba(255,255,255,0.58)",
        opacity:
          "0",
        transition:
          "opacity 220ms ease"
      }
    );

    overlay.appendChild(
      title
    );

    overlay.appendChild(
      note
    );

    this.mount?.appendChild(
      overlay
    );

    this.overlay =
      overlay;

    this.overlayTitle =
      title;

    this.overlayNote =
      note;

    return overlay;

  }



  // ====================================================
  // OVERLAY MESSAGE
  // ====================================================

  setOverlayMessage(
    environmentName
  ) {

    const message =
      ENVIRONMENT_MESSAGES[
        environmentName
      ]
      ||
      ENVIRONMENT_MESSAGES.dawn;

    this.overlayTitle.textContent =
      message.title;

    this.overlayNote.textContent =
      message.note;

  }

}



// ======================================================
// TIME HELPERS
// ======================================================

function parseTimeToMinutes(
  value
) {

  const match =
    String(
      value
      ||
      ""
    )
    .match(
      /^(\d{1,2}):(\d{2})$/
    );

  if (
    !match
  ) {

    return (
      5 * 60 + 30
    );

  }

  const hour =
    clampInteger(
      Number(
        match[1]
      ),
      0,
      23
    );

  const minute =
    clampInteger(
      Number(
        match[2]
      ),
      0,
      59
    );

  return (
    hour * 60
    +
    minute
  );

}


function classifyMinutes(
  totalMinutes
) {

  const total =
    wrapMinute(
      totalMinutes
    );

  if (
    total >= 4 * 60
    &&
    total <= 6 * 60 + 59
  ) {

    return "dawn";

  }

  if (
    total >= 7 * 60
    &&
    total <= 16 * 60 + 59
  ) {

    return "morning";

  }

  if (
    total >= 17 * 60
    &&
    total <= 18 * 60 + 30
  ) {

    return "dusk";

  }

  return "night";

}


function wrapMinute(
  value
) {

  return (
    (
      value
      %
      MINUTES_PER_DAY
    )
    +
    MINUTES_PER_DAY
  )
  %
  MINUTES_PER_DAY;

}


function clampInteger(
  value,
  minimum,
  maximum
) {

  const safeValue =
    Number.isFinite(
      value
    )
    ?
    Math.trunc(
      value
    )
    :
    minimum;

  return Math.max(
    minimum,
    Math.min(
      maximum,
      safeValue
    )
  );

}


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



// ======================================================
// FILE SOURCE HELPER
//
// Only the time token in the filename is changed.
// Examples:
//
// Talk_night1_3.png  -> Talk_dawn1_3.png
// Room_dusk2.png     -> Room_night2.png
// Draw_dawnvid2.mp4  -> Draw_morningvid2.mp4
// ======================================================

function replaceEnvironmentToken(
  source,
  environmentName
) {

  if (
    !source
  ) {

    return source;

  }

  const slashIndex =
    source.lastIndexOf(
      "/"
    );

  const prefix =
    slashIndex >= 0
    ?
    source.slice(
      0,
      slashIndex + 1
    )
    :
    "";

  const fileName =
    slashIndex >= 0
    ?
    source.slice(
      slashIndex + 1
    )
    :
    source;

  const nextFileName =
    fileName.replace(
      /_(dawn|morning|dusk|night)/i,
      `_${environmentName}`
    );

  return (
    prefix
    +
    nextFileName
  );

}


function wait(
  milliseconds
) {

  return new Promise(
    (
      resolve
    ) => {

      window.setTimeout(
        resolve,
        milliseconds
      );

    }
  );

}


function nextPaint() {

  return new Promise(
    (
      resolve
    ) => {

      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            resolve
          );

        }
      );

    }
  );

}