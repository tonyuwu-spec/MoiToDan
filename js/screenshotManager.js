// ======================================================
// MỜI TỪ ĐÀN
// SCREENSHOT MANAGER
//
// CAPTURE:
//
// - PNG / image scene layers
// - current video frame
// - p5 canvases
// - CUT silk
// - DRAW paper
// - PLAY strings
//
// EXCLUDED:
//
// - Handycam interface
// - REC
// - zoom HUD
// - recording timer
// - camera preview
// - menu
// - screenshot button
// - gesture guide
// - dialogue / text PNGs
// - CUT input UI
// - DRAW controls
//
// CONTROLS:
//
// - Camera icon
// - S key
//
// DRAW:
//
// While actively writing:
// S = normal typed letter
//
// After clicking FINISH:
// S = screenshot again
//
// OUTPUT:
//
// 2560 × 1440 PNG
//
// CAPTURE FEEDBACK:
//
// 1. quick white camera flash
// 2. sharp preview appears
// 3. preview holds for 1.5 seconds
// 4. preview flies straight upward
// 5. NO fade during fly-out
// ======================================================



// ======================================================
// MASTER SIZE
// ======================================================

const CAPTURE_WIDTH =
  2560;


const CAPTURE_HEIGHT =
  1440;



// ======================================================
// PREVIEW SETTINGS
// ======================================================

const PREVIEW_SCALE =
  0.75;


const PREVIEW_INTERNAL_WIDTH =
  1280;


const PREVIEW_INTERNAL_HEIGHT =
  720;


const PREVIEW_HOLD_DURATION =
  1500;


const PREVIEW_FLY_DURATION =
  650;



// ======================================================
// CAMERA FLASH SETTINGS
// ======================================================

const CAPTURE_FLASH_DURATION =
  220;


const CAPTURE_FLASH_PEAK =
  0.46;



// ======================================================
// DOM
// ======================================================

const captureButton =

  document.getElementById(
    "capture-button"
  );


const designStage =

  document.getElementById(
    "design-stage"
  );


const drawFinishButton =

  document.getElementById(
    "draw-finish-button"
  );


const drawResetButton =

  document.getElementById(
    "draw-reset-button"
  );



// ======================================================
// NORMAL SCENE BOARDS
//
// DRAW is handled separately because its zoom/pan
// needs special capture handling.
// ======================================================

const CAPTURE_BOARD_IDS = [

  "scene-board",

  "talk-board",

  "room-board",

  "cut-board",

  "play-board",

  "end-board"

];



// ======================================================
// ELEMENTS EXCLUDED FROM CAPTURE
//
// This does NOT depend on asset filenames.
// ======================================================

const IGNORE_SELECTORS = [

  // ==================================================
  // HANDYCAM
  // ==================================================

  "#handycam-ui",


  // ==================================================
  // STARTUP
  // ==================================================

  "#startup-fade",

  "#boot-screen",

  "#opening-screen",


  // ==================================================
  // TEXT PNGs
  // ==================================================

  "#intro-textbox",

  "#talk-textbox",

  "#room-textbox",

  "#cut-textbox",

  "#draw-textbox",

  "#play-text1",

  "#end-text1",

  "#end-font",


  // ==================================================
  // CUT UI
  // ==================================================

  "#cut-input-panel",

  "#cut-mode-hint",


  // ==================================================
  // ROOM UI
  // ==================================================

  "#room-door-hotspot",


  // ==================================================
  // DRAW UI
  // ==================================================

  "#draw-controls",

  "#draw-mode-indicator",

  "#draw-silk-hotspot",

  "#draw-pen-hotspot"

];



// ======================================================
// STATE
// ======================================================

let capturing =
  false;



// ======================================================
// DRAW WRITING SAFEGUARD
// ======================================================

let drawWritingFinished =
  false;


let drawWasActive =
  false;



// ======================================================
// CAPTURE FEEDBACK STATE
// ======================================================

let captureFeedbackTimer =
  null;



// ======================================================
// WAIT ONE FRAME
// ======================================================

function waitFrame() {


  return new Promise(

    (
      resolve
    ) => {


      requestAnimationFrame(

        () => {


          resolve();

        }

      );

    }

  );

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



// ======================================================
// VISIBLE
// ======================================================

function isActuallyVisible(
  element
) {


  if (
    !element
  ) {

    return false;

  }



  let current =
    element;



  while (
    current
  ) {


    const style =

      getComputedStyle(
        current
      );



    if (

      style.display === "none"

      ||

      style.visibility === "hidden"

      ||

      Number(
        style.opacity
      ) <= 0

    ) {


      return false;

    }



    if (
      current === designStage
    ) {


      break;

    }



    current =
      current.parentElement;

  }



  const rect =

    element.getBoundingClientRect();



  return (

    rect.width > 0

    &&

    rect.height > 0

  );

}



// ======================================================
// EFFECTIVE OPACITY
// ======================================================

function getEffectiveOpacity(
  element
) {


  let opacity =
    1;



  let current =
    element;



  while (
    current
  ) {


    const style =

      getComputedStyle(
        current
      );



    const value =

      Number(
        style.opacity
      );



    if (
      Number.isFinite(
        value
      )
    ) {


      opacity *=
        value;

    }



    if (
      current === designStage
    ) {


      break;

    }



    current =
      current.parentElement;

  }



  return clamp(

    opacity,

    0,

    1

  );

}



// ======================================================
// IGNORE CHECK
// ======================================================

function shouldIgnoreElement(
  element
) {


  if (
    !(element instanceof Element)
  ) {


    return false;

  }



  for (
    const selector
    of
    IGNORE_SELECTORS
  ) {


    if (

      element.matches(
        selector
      )

      ||

      element.closest(
        selector
      )

    ) {


      return true;

    }

  }



  return false;

}



// ======================================================
// SOURCE IGNORE CHECK
// ======================================================

function sourceIsIgnored(
  element
) {


  if (
    !element
  ) {


    return true;

  }



  for (
    const selector
    of
    IGNORE_SELECTORS
  ) {


    if (
      element.closest(
        selector
      )
    ) {


      return true;

    }

  }



  return false;

}



// ======================================================
// LIVE STAGE GEOMETRY
// ======================================================

function getLiveStageGeometry() {


  const rect =

    designStage
      .getBoundingClientRect();



  let scaleX =

    rect.width

    /

    CAPTURE_WIDTH;



  let scaleY =

    rect.height

    /

    CAPTURE_HEIGHT;



  if (

    !Number.isFinite(
      scaleX
    )

    ||

    scaleX <= 0

  ) {


    scaleX =
      1;

  }



  if (

    !Number.isFinite(
      scaleY
    )

    ||

    scaleY <= 0

  ) {


    scaleY =
      1;

  }



  return {

    rect,

    scaleX,

    scaleY

  };

}



// ======================================================
// SCREEN RECT → DESIGN RECT
// ======================================================

function getStageRect(
  element,
  stage
) {


  const rect =

    element
      .getBoundingClientRect();



  return {

    x:

      (

        rect.left

        -

        stage.rect.left

      )

      /

      stage.scaleX,


    y:

      (

        rect.top

        -

        stage.rect.top

      )

      /

      stage.scaleY,


    width:

      rect.width

      /

      stage.scaleX,


    height:

      rect.height

      /

      stage.scaleY

  };

}



// ======================================================
// OBJECT-FIT DRAWING
// ======================================================

function drawObjectFit(

  context,

  source,

  sourceWidth,

  sourceHeight,

  x,

  y,

  width,

  height,

  fit

) {


  if (

    !sourceWidth

    ||

    !sourceHeight

    ||

    width <= 0

    ||

    height <= 0

  ) {


    return;

  }



  // ==================================================
  // FILL
  // ==================================================

  if (

    fit === "fill"

    ||

    !fit

  ) {


    context.drawImage(

      source,

      0,
      0,

      sourceWidth,
      sourceHeight,

      x,
      y,

      width,
      height

    );


    return;

  }



  const sourceRatio =

    sourceWidth

    /

    sourceHeight;



  const destinationRatio =

    width

    /

    height;



  // ==================================================
  // CONTAIN
  // ==================================================

  if (
    fit === "contain"
  ) {


    let drawWidth;
    let drawHeight;



    if (
      sourceRatio > destinationRatio
    ) {


      drawWidth =
        width;


      drawHeight =

        width

        /

        sourceRatio;

    }


    else {


      drawHeight =
        height;


      drawWidth =

        height

        *

        sourceRatio;

    }



    const drawX =

      x

      +

      (

        width

        -

        drawWidth

      )

      /

      2;



    const drawY =

      y

      +

      (

        height

        -

        drawHeight

      )

      /

      2;



    context.drawImage(

      source,

      0,
      0,

      sourceWidth,
      sourceHeight,

      drawX,
      drawY,

      drawWidth,
      drawHeight

    );


    return;

  }



  // ==================================================
  // COVER
  // ==================================================

  if (
    fit === "cover"
  ) {


    let cropWidth =
      sourceWidth;


    let cropHeight =
      sourceHeight;


    let cropX =
      0;


    let cropY =
      0;



    if (
      sourceRatio > destinationRatio
    ) {


      cropWidth =

        sourceHeight

        *

        destinationRatio;


      cropX =

        (

          sourceWidth

          -

          cropWidth

        )

        /

        2;

    }


    else {


      cropHeight =

        sourceWidth

        /

        destinationRatio;


      cropY =

        (

          sourceHeight

          -

          cropHeight

        )

        /

        2;

    }



    context.drawImage(

      source,

      cropX,
      cropY,

      cropWidth,
      cropHeight,

      x,
      y,

      width,
      height

    );


    return;

  }



  // ==================================================
  // FALLBACK
  // ==================================================

  context.drawImage(

    source,

    0,
    0,

    sourceWidth,
    sourceHeight,

    x,
    y,

    width,
    height

  );

}



// ======================================================
// DRAW ONE DRAW-SCENE MEDIA ELEMENT
// ======================================================

function drawDrawSceneMedia(

  context,

  element,

  stage

) {


  if (
    !isActuallyVisible(
      element
    )
  ) {


    return;

  }



  if (
    sourceIsIgnored(
      element
    )
  ) {


    return;

  }



  const rect =

    getStageRect(

      element,

      stage

    );



  if (

    rect.x >= CAPTURE_WIDTH

    ||

    rect.y >= CAPTURE_HEIGHT

    ||

    rect.x + rect.width <= 0

    ||

    rect.y + rect.height <= 0

  ) {


    return;

  }



  const style =

    getComputedStyle(
      element
    );



  context.save();



  context.globalAlpha =

    getEffectiveOpacity(
      element
    );



  try {


    // =================================================
    // IMAGE
    // =================================================

    if (
      element instanceof HTMLImageElement
    ) {


      if (

        !element.complete

        ||

        !element.naturalWidth

        ||

        !element.naturalHeight

      ) {


        context.restore();


        return;

      }



      drawObjectFit(

        context,

        element,

        element.naturalWidth,

        element.naturalHeight,

        rect.x,

        rect.y,

        rect.width,

        rect.height,

        style.objectFit

      );

    }



    // =================================================
    // VIDEO
    // =================================================

    else if (
      element instanceof HTMLVideoElement
    ) {


      if (

        element.readyState < 2

        ||

        !element.videoWidth

        ||

        !element.videoHeight

      ) {


        context.restore();


        return;

      }



      drawObjectFit(

        context,

        element,

        element.videoWidth,

        element.videoHeight,

        rect.x,

        rect.y,

        rect.width,

        rect.height,

        style.objectFit

      );

    }



    // =================================================
    // P5 / CANVAS
    // =================================================

    else if (
      element instanceof HTMLCanvasElement
    ) {


      if (

        element.width <= 0

        ||

        element.height <= 0

      ) {


        context.restore();


        return;

      }



      context.drawImage(

        element,

        0,
        0,

        element.width,
        element.height,

        rect.x,
        rect.y,

        rect.width,
        rect.height

      );

    }


  }


  catch (
    error
  ) {


    console.warn(

      "SCREENSHOT: DRAW media could not be rendered:",

      error

    );

  }



  context.restore();

}



// ======================================================
// SPECIAL DRAW CAPTURE
//
// Keeps current:
//
// - zoom
// - pan
// - video
// - p5 paper
//
// OUTPUT IS STILL 2560 × 1440.
// ======================================================

async function captureDrawSceneDirect() {


  const drawBoard =

    document.getElementById(
      "draw-board"
    );



  if (
    !drawBoard
  ) {


    throw new Error(
      "SCREENSHOT: #draw-board was not found."
    );

  }



  await waitFrame();



  const output =

    document.createElement(
      "canvas"
    );



  output.width =
    CAPTURE_WIDTH;


  output.height =
    CAPTURE_HEIGHT;



  const context =

    output.getContext(

      "2d",

      {

        alpha:
          false

      }

    );



  context.fillStyle =
    "#000";


  context.fillRect(

    0,
    0,

    CAPTURE_WIDTH,
    CAPTURE_HEIGHT

  );



  const stage =

    getLiveStageGeometry();



  const media =

    drawBoard.querySelectorAll(

      "img, video, canvas"

    );



  for (
    const element
    of
    media
  ) {


    drawDrawSceneMedia(

      context,

      element,

      stage

    );

  }



  return output;

}



// ======================================================
// NORMAL BOARD GEOMETRY
// ======================================================

function captureBoardGeometry() {


  const stage =

    getLiveStageGeometry();



  const result = {};



  for (
    const id
    of
    CAPTURE_BOARD_IDS
  ) {


    const board =

      document.getElementById(
        id
      );



    if (
      !board
    ) {


      continue;

    }



    const boardRect =

      board
        .getBoundingClientRect();



    if (

      boardRect.width <= 0

      ||

      boardRect.height <= 0

    ) {


      continue;

    }



    const style =

      getComputedStyle(
        board
      );



    let baseWidth =

      parseFloat(
        style.width
      );



    let baseHeight =

      parseFloat(
        style.height
      );



    if (

      !Number.isFinite(
        baseWidth
      )

      ||

      baseWidth <= 0

    ) {


      baseWidth =
        CAPTURE_WIDTH;

    }



    if (

      !Number.isFinite(
        baseHeight
      )

      ||

      baseHeight <= 0

    ) {


      baseHeight =
        CAPTURE_HEIGHT;

    }



    const x =

      (

        boardRect.left

        -

        stage.rect.left

      )

      /

      stage.scaleX;



    const y =

      (

        boardRect.top

        -

        stage.rect.top

      )

      /

      stage.scaleY;



    const renderedWidth =

      boardRect.width

      /

      stage.scaleX;



    const renderedHeight =

      boardRect.height

      /

      stage.scaleY;



    result[id] = {

      x,

      y,

      baseWidth,

      baseHeight,

      scaleX:

        renderedWidth

        /

        baseWidth,

      scaleY:

        renderedHeight

        /

        baseHeight

    };

  }



  return result;

}



// ======================================================
// APPLY NORMAL BOARD GEOMETRY
// ======================================================

function applyBoardGeometryToClone(

  clonedDocument,

  geometry

) {


  for (
    const id
    of
    Object.keys(
      geometry
    )
  ) {


    const clonedBoard =

      clonedDocument.getElementById(
        id
      );



    if (
      !clonedBoard
    ) {


      continue;

    }



    const boardGeometry =

      geometry[id];



    clonedBoard.style.setProperty(

      "position",

      "absolute",

      "important"

    );



    clonedBoard.style.setProperty(

      "left",

      `${boardGeometry.x}px`,

      "important"

    );



    clonedBoard.style.setProperty(

      "top",

      `${boardGeometry.y}px`,

      "important"

    );



    clonedBoard.style.setProperty(

      "right",

      "auto",

      "important"

    );



    clonedBoard.style.setProperty(

      "bottom",

      "auto",

      "important"

    );



    clonedBoard.style.setProperty(

      "width",

      `${boardGeometry.baseWidth}px`,

      "important"

    );



    clonedBoard.style.setProperty(

      "height",

      `${boardGeometry.baseHeight}px`,

      "important"

    );



    clonedBoard.style.setProperty(

      "transform-origin",

      "0 0",

      "important"

    );



    clonedBoard.style.setProperty(

      "transform",

      `scale(
        ${boardGeometry.scaleX},
        ${boardGeometry.scaleY}
      )`,

      "important"

    );

  }

}



// ======================================================
// VIDEO FRAME FOR NORMAL CAPTURE
// ======================================================

function drawVideoFrame(

  context,

  video,

  width,

  height

) {


  if (

    !video.videoWidth

    ||

    !video.videoHeight

  ) {


    return;

  }



  drawObjectFit(

    context,

    video,

    video.videoWidth,

    video.videoHeight,

    0,

    0,

    width,

    height,

    getComputedStyle(
      video
    ).objectFit

  );

}



// ======================================================
// COPY MEDIA STYLE
// ======================================================

function copyVisualStyle(

  source,

  proxy

) {


  const style =

    getComputedStyle(
      source
    );



  const properties = [

    "position",

    "left",

    "top",

    "right",

    "bottom",

    "width",

    "height",

    "marginLeft",

    "marginTop",

    "marginRight",

    "marginBottom",

    "transform",

    "transformOrigin",

    "zIndex",

    "opacity",

    "filter",

    "borderRadius",

    "clipPath",

    "mixBlendMode"

  ];



  for (
    const property
    of
    properties
  ) {


    proxy.style[property] =

      style[property];

  }



  proxy.style.pointerEvents =
    "none";


  proxy.style.maxWidth =
    "none";


  proxy.style.maxHeight =
    "none";


  proxy.style.background =
    "transparent";

}



// ======================================================
// NORMAL VIDEO / P5 PROXIES
// ======================================================

function createCaptureProxies() {


  const records = [];



  const sources =

    designStage.querySelectorAll(

      "video, canvas"

    );



  for (
    const source
    of
    sources
  ) {


    if (
      source.closest(
        "#draw-board"
      )
    ) {


      continue;

    }



    if (
      !isActuallyVisible(
        source
      )
    ) {


      continue;

    }



    if (
      source.closest(
        "#handycam-ui"
      )
    ) {


      continue;

    }



    if (
      sourceIsIgnored(
        source
      )
    ) {


      continue;

    }



    const style =

      getComputedStyle(
        source
      );



    let width =

      parseFloat(
        style.width
      );



    let height =

      parseFloat(
        style.height
      );



    if (

      !Number.isFinite(
        width
      )

      ||

      width <= 0

    ) {


      width =

        source.clientWidth

        ||

        source.width

        ||

        1;

    }



    if (

      !Number.isFinite(
        height
      )

      ||

      height <= 0

    ) {


      height =

        source.clientHeight

        ||

        source.height

        ||

        1;

    }



    width =

      Math.max(

        1,

        Math.round(
          width
        )

      );



    height =

      Math.max(

        1,

        Math.round(
          height
        )

      );



    const proxy =

      document.createElement(
        "canvas"
      );



    proxy.width =
      width;


    proxy.height =
      height;


    proxy.className =
      "capture-media-proxy";



    copyVisualStyle(

      source,

      proxy

    );



    const context =

      proxy.getContext(

        "2d",

        {

          alpha:
            true

        }

      );



    if (
      !context
    ) {


      continue;

    }



    try {


      // =================================================
      // VIDEO
      // =================================================

      if (
        source instanceof HTMLVideoElement
      ) {


        if (

          source.readyState < 2

          ||

          !source.videoWidth

          ||

          !source.videoHeight

        ) {


          continue;

        }



        drawVideoFrame(

          context,

          source,

          width,

          height

        );

      }



      // =================================================
      // P5 / CANVAS
      // =================================================

      else if (
        source instanceof HTMLCanvasElement
      ) {


        context.drawImage(

          source,

          0,
          0,

          source.width,
          source.height,

          0,
          0,

          width,
          height

        );

      }



      const oldVisibility =

        source.style.visibility;



      source.style.visibility =
        "hidden";



      source.parentNode.insertBefore(

        proxy,

        source.nextSibling

      );



      records.push(

        {

          source,

          proxy,

          oldVisibility

        }

      );


    }


    catch (
      error
    ) {


      console.warn(

        "SCREENSHOT: media freeze failed:",

        error

      );

    }

  }



  return records;

}



// ======================================================
// RESTORE MEDIA
// ======================================================

function restoreCaptureProxies(
  records
) {


  for (
    const record
    of
    records
  ) {


    record.source.style.visibility =

      record.oldVisibility;



    record.proxy.remove();

  }

}



// ======================================================
// FILE NAME
// ======================================================

function createFilename() {


  const now =
    new Date();



  const pad =

    (
      value
    ) => {


      return String(
        value
      )
      .padStart(

        2,

        "0"

      );

    };



  return (

    "MoiToDan_"

    +

    now.getFullYear()

    +

    "-"

    +

    pad(
      now.getMonth() + 1
    )

    +

    "-"

    +

    pad(
      now.getDate()
    )

    +

    "_"

    +

    pad(
      now.getHours()
    )

    +

    "-"

    +

    pad(
      now.getMinutes()
    )

    +

    "-"

    +

    pad(
      now.getSeconds()
    )

    +

    ".png"

  );

}



// ======================================================
// QUICK CAMERA FLASH
//
// This happens AFTER the real screenshot has already
// been captured.
//
// Therefore:
//
// - flash is NOT in downloaded PNG
// - preview is NOT in downloaded PNG
//
// It is only user feedback.
// ======================================================

function showCaptureFlash() {


  // ==================================================
  // CLEAR EXISTING FLASH
  // ==================================================

  document
    .querySelectorAll(
      ".mtd-capture-flash"
    )
    .forEach(

      (
        element
      ) => {


        element.remove();

      }

    );



  const stageRect =

    designStage
      .getBoundingClientRect();



  const flash =

    document.createElement(
      "div"
    );



  flash.className =
    "mtd-capture-flash";



  flash.style.position =
    "fixed";


  flash.style.left =
    `${stageRect.left}px`;


  flash.style.top =
    `${stageRect.top}px`;


  flash.style.width =
    `${stageRect.width}px`;


  flash.style.height =
    `${stageRect.height}px`;


  flash.style.zIndex =
    "999998";


  flash.style.background =
    "#ffffff";


  flash.style.opacity =
    "0";


  flash.style.pointerEvents =
    "none";


  flash.style.willChange =
    "opacity";


  flash.style.backfaceVisibility =
    "hidden";



  document.body.appendChild(
    flash
  );



  const animation =

    flash.animate(

      [

        // =============================================
        // START
        // =============================================

        {

          opacity:
            0,

          offset:
            0

        },


        // =============================================
        // CAMERA FLASH
        // =============================================

        {

          opacity:
            CAPTURE_FLASH_PEAK,

          offset:
            0.32

        },


        // =============================================
        // CLEAR AGAIN
        // =============================================

        {

          opacity:
            0,

          offset:
            1

        }

      ],

      {

        duration:
          CAPTURE_FLASH_DURATION,

        easing:
          "ease-out",

        fill:
          "forwards"

      }

    );



  animation.addEventListener(

    "finish",

    () => {


      flash.remove();

    },

    {

      once:
        true

    }

  );

}



// ======================================================
// SHARP CAPTURE PREVIEW
//
// - 75% of visible stage
// - 1280 × 720 internal resolution
// - centered
// - hold 1.5 sec
// - fly straight upward
// - NO FADE
// ======================================================

function showCaptureTease(
  sourceCanvas
) {


  // ==================================================
  // REMOVE OLD PREVIEW
  // ==================================================

  document
    .querySelectorAll(
      ".mtd-capture-tease"
    )
    .forEach(

      (
        element
      ) => {


        element.remove();

      }

    );



  const stageRect =

    designStage
      .getBoundingClientRect();



  // ==================================================
  // DISPLAY SIZE
  // ==================================================

  const previewWidth =

    Math.round(

      stageRect.width

      *

      PREVIEW_SCALE

    );



  const previewHeight =

    Math.round(

      stageRect.height

      *

      PREVIEW_SCALE

    );



  // ==================================================
  // SHARP INTERNAL PREVIEW
  // ==================================================

  const previewCanvas =

    document.createElement(
      "canvas"
    );



  previewCanvas.width =
    PREVIEW_INTERNAL_WIDTH;


  previewCanvas.height =
    PREVIEW_INTERNAL_HEIGHT;



  const previewContext =

    previewCanvas.getContext(

      "2d",

      {

        alpha:
          false

      }

    );



  previewContext.imageSmoothingEnabled =
    true;


  previewContext.imageSmoothingQuality =
    "high";



  previewContext.drawImage(

    sourceCanvas,

    0,
    0,

    sourceCanvas.width,
    sourceCanvas.height,

    0,
    0,

    PREVIEW_INTERNAL_WIDTH,
    PREVIEW_INTERNAL_HEIGHT

  );



  // ==================================================
  // WHITE PHOTO FRAME
  // ==================================================

  const frame =

    document.createElement(
      "div"
    );



  frame.className =
    "mtd-capture-tease";



  const left =

    stageRect.left

    +

    (

      stageRect.width

      -

      previewWidth

    )

    /

    2;



  const top =

    stageRect.top

    +

    (

      stageRect.height

      -

      previewHeight

    )

    /

    2;



  frame.style.position =
    "fixed";


  frame.style.left =
    `${left}px`;


  frame.style.top =
    `${top}px`;


  frame.style.zIndex =
    "999999";


  frame.style.width =
    `${previewWidth}px`;


  frame.style.padding =
    "10px";


  frame.style.background =
    "#ffffff";


  frame.style.boxShadow =
    "0 12px 28px rgba(0, 0, 0, 0.35)";


  frame.style.pointerEvents =
    "none";


  // ==================================================
  // ALWAYS FULLY VISIBLE
  //
  // NO FADE.
  // ==================================================

  frame.style.opacity =
    "1";


  frame.style.transform =
    "translate3d(0, 0, 0)";


  frame.style.willChange =
    "transform";


  frame.style.backfaceVisibility =
    "hidden";


  frame.style.contain =
    "layout paint";



  previewCanvas.style.display =
    "block";


  previewCanvas.style.width =
    "100%";


  previewCanvas.style.height =
    "auto";



  frame.appendChild(
    previewCanvas
  );



  document.body.appendChild(
    frame
  );



  // ==================================================
  // HOLD FOR 1.5 SECONDS
  // ==================================================

  window.setTimeout(

    () => {


      if (
        !frame.isConnected
      ) {


        return;

      }



      // =================================================
      // FLY STRAIGHT UP
      //
      // IMPORTANT:
      //
      // NO OPACITY CHANGE.
      //
      // This keeps the preview visually sharp until
      // it completely leaves the screen.
      // =================================================

      const animation =

        frame.animate(

          [

            {

              transform:
                "translate3d(0, 0, 0)"

            },


            {

              transform:
                "translate3d(0, -120vh, 0)"

            }

          ],

          {

            duration:
              PREVIEW_FLY_DURATION,

            easing:
              "cubic-bezier(0.32, 0, 0.18, 1)",

            fill:
              "forwards"

          }

        );



      animation.addEventListener(

        "finish",

        () => {


          frame.remove();

        },

        {

          once:
            true

        }

      );

    },

    PREVIEW_HOLD_DURATION

  );

}



// ======================================================
// CAPTURE FEEDBACK SEQUENCE
//
// SCREENSHOT
// ↓
// QUICK FLASH
// ↓
// PREVIEW
//
// Preview appears only after the flash has had enough
// time to read visually.
// ======================================================

function showCaptureFeedback(
  sourceCanvas
) {


  // ==================================================
  // CANCEL PENDING PREVIEW FROM PREVIOUS SHOT
  // ==================================================

  if (
    captureFeedbackTimer
  ) {


    window.clearTimeout(
      captureFeedbackTimer
    );


    captureFeedbackTimer =
      null;

  }



  // ==================================================
  // REMOVE OLD VISUAL FEEDBACK
  // ==================================================

  document
    .querySelectorAll(

      ".mtd-capture-flash, .mtd-capture-tease"

    )
    .forEach(

      (
        element
      ) => {


        element.remove();

      }

    );



  // ==================================================
  // STEP 1:
  // FLASH
  // ==================================================

  showCaptureFlash();



  // ==================================================
  // STEP 2:
  // AFTER FLASH → SHOW PREVIEW
  // ==================================================

  captureFeedbackTimer =

    window.setTimeout(

      () => {


        captureFeedbackTimer =
          null;



        showCaptureTease(
          sourceCanvas
        );

      },

      CAPTURE_FLASH_DURATION

      +

      30

    );

}



// ======================================================
// DOWNLOAD PNG
//
// FULL DOWNLOAD:
// 2560 × 1440
// ======================================================

function downloadCanvas(
  canvas
) {


  canvas.toBlob(

    (
      blob
    ) => {


      if (
        !blob
      ) {


        console.error(
          "SCREENSHOT: PNG creation failed."
        );


        return;

      }



      const objectURL =

        URL.createObjectURL(
          blob
        );



      const link =

        document.createElement(
          "a"
        );



      link.href =
        objectURL;


      link.download =
        createFilename();



      document.body.appendChild(
        link
      );



      link.click();



      link.remove();



      window.setTimeout(

        () => {


          URL.revokeObjectURL(
            objectURL
          );

        },

        1000

      );

    },

    "image/png",

    1

  );

}



// ======================================================
// NORMALIZE OUTPUT
//
// GUARANTEES:
// 2560 × 1440
// ======================================================

function normalizeOutputCanvas(
  canvas
) {


  if (

    canvas.width === CAPTURE_WIDTH

    &&

    canvas.height === CAPTURE_HEIGHT

  ) {


    return canvas;

  }



  const output =

    document.createElement(
      "canvas"
    );



  output.width =
    CAPTURE_WIDTH;


  output.height =
    CAPTURE_HEIGHT;



  const context =

    output.getContext(
      "2d"
    );



  context.fillStyle =
    "#000";


  context.fillRect(

    0,
    0,

    CAPTURE_WIDTH,
    CAPTURE_HEIGHT

  );



  context.drawImage(

    canvas,

    0,
    0,

    canvas.width,
    canvas.height,

    0,
    0,

    CAPTURE_WIDTH,
    CAPTURE_HEIGHT

  );



  return output;

}



// ======================================================
// NORMAL HTML2CANVAS CAPTURE
//
// INTRO
// TALK
// ROOM
// CUT
// PLAY
// ======================================================

async function captureNormalScene() {


  const boardGeometry =

    captureBoardGeometry();



  const mediaRecords =

    createCaptureProxies();



  try {


    await waitFrame();



    const screenshot =

      await window.html2canvas(

        designStage,

        {

          backgroundColor:
            "#000000",


          scale:
            1,


          width:
            CAPTURE_WIDTH,


          height:
            CAPTURE_HEIGHT,


          windowWidth:
            CAPTURE_WIDTH,


          windowHeight:
            CAPTURE_HEIGHT,


          scrollX:
            0,


          scrollY:
            0,


          useCORS:
            true,


          allowTaint:
            false,


          imageTimeout:
            15000,


          logging:
            false,


          removeContainer:
            true,



          // =============================================
          // EXCLUDE INTERFACE
          // =============================================

          ignoreElements:

            (
              element
            ) => {


              return shouldIgnoreElement(
                element
              );

            },



          // =============================================
          // FIX CLONE
          // =============================================

          onclone:

            (
              clonedDocument
            ) => {


              // =========================================
              // HTML
              // =========================================

              const clonedHtml =

                clonedDocument
                  .documentElement;



              clonedHtml.style.setProperty(

                "width",

                `${CAPTURE_WIDTH}px`,

                "important"

              );


              clonedHtml.style.setProperty(

                "height",

                `${CAPTURE_HEIGHT}px`,

                "important"

              );


              clonedHtml.style.setProperty(

                "margin",

                "0",

                "important"

              );


              clonedHtml.style.setProperty(

                "padding",

                "0",

                "important"

              );


              clonedHtml.style.setProperty(

                "overflow",

                "hidden",

                "important"

              );


              clonedHtml.style.setProperty(

                "background",

                "#000",

                "important"

              );



              // =========================================
              // BODY
              // =========================================

              const clonedBody =

                clonedDocument.body;



              clonedBody.style.setProperty(

                "width",

                `${CAPTURE_WIDTH}px`,

                "important"

              );


              clonedBody.style.setProperty(

                "height",

                `${CAPTURE_HEIGHT}px`,

                "important"

              );


              clonedBody.style.setProperty(

                "margin",

                "0",

                "important"

              );


              clonedBody.style.setProperty(

                "padding",

                "0",

                "important"

              );


              clonedBody.style.setProperty(

                "overflow",

                "hidden",

                "important"

              );


              clonedBody.style.setProperty(

                "background",

                "#000",

                "important"

              );



              // =========================================
              // APP
              // =========================================

              const clonedApp =

                clonedDocument
                  .getElementById(
                    "app"
                  );



              if (
                clonedApp
              ) {


                clonedApp.style.setProperty(

                  "position",

                  "absolute",

                  "important"

                );


                clonedApp.style.setProperty(

                  "left",

                  "0",

                  "important"

                );


                clonedApp.style.setProperty(

                  "top",

                  "0",

                  "important"

                );


                clonedApp.style.setProperty(

                  "width",

                  `${CAPTURE_WIDTH}px`,

                  "important"

                );


                clonedApp.style.setProperty(

                  "height",

                  `${CAPTURE_HEIGHT}px`,

                  "important"

                );


                clonedApp.style.setProperty(

                  "overflow",

                  "hidden",

                  "important"

                );


                clonedApp.style.setProperty(

                  "background",

                  "#000",

                  "important"

                );

              }



              // =========================================
              // MASTER DESIGN STAGE
              // =========================================

              const clonedStage =

                clonedDocument
                  .getElementById(
                    "design-stage"
                  );



              if (
                clonedStage
              ) {


                clonedStage.style.setProperty(

                  "position",

                  "absolute",

                  "important"

                );


                clonedStage.style.setProperty(

                  "left",

                  "0",

                  "important"

                );


                clonedStage.style.setProperty(

                  "top",

                  "0",

                  "important"

                );


                clonedStage.style.setProperty(

                  "width",

                  `${CAPTURE_WIDTH}px`,

                  "important"

                );


                clonedStage.style.setProperty(

                  "height",

                  `${CAPTURE_HEIGHT}px`,

                  "important"

                );


                clonedStage.style.setProperty(

                  "transform",

                  "none",

                  "important"

                );


                clonedStage.style.setProperty(

                  "transform-origin",

                  "0 0",

                  "important"

                );


                clonedStage.style.setProperty(

                  "overflow",

                  "hidden",

                  "important"

                );


                clonedStage.style.setProperty(

                  "background",

                  "#000",

                  "important"

                );

              }



              // =========================================
              // NORMAL SCENE BOARDS
              // =========================================

              applyBoardGeometryToClone(

                clonedDocument,

                boardGeometry

              );

            }

        }

      );



    return normalizeOutputCanvas(
      screenshot
    );


  }


  finally {


    restoreCaptureProxies(
      mediaRecords
    );

  }

}



// ======================================================
// MASTER CAPTURE
// ======================================================

async function captureScene() {


  if (
    capturing
  ) {


    return;

  }



  if (
    !designStage
  ) {


    console.error(
      "SCREENSHOT: #design-stage was not found."
    );


    return;

  }



  if (

    !document.body.classList.contains(
      "draw-active"
    )

    &&

    typeof window.html2canvas
      !==
      "function"

  ) {


    console.error(
      "SCREENSHOT: html2canvas is not loaded."
    );


    return;

  }



  capturing =
    true;



  if (
    captureButton
  ) {


    captureButton.disabled =
      true;


    captureButton.classList.add(
      "is-capturing"
    );

  }



  try {


    await waitFrame();



    let finalCanvas;



    // ==================================================
    // DRAW
    // ==================================================

    if (
      document.body.classList.contains(
        "draw-active"
      )
    ) {


      finalCanvas =

        await captureDrawSceneDirect();

    }



    // ==================================================
    // EVERYTHING ELSE
    // ==================================================

    else {


      finalCanvas =

        await captureNormalScene();

    }



    // ==================================================
    // GUARANTEE 2560 × 1440
    // ==================================================

    finalCanvas =

      normalizeOutputCanvas(
        finalCanvas
      );



    // ==================================================
    // DOWNLOAD FIRST
    //
    // This remains completely independent from
    // the visual camera feedback.
    // ==================================================

    downloadCanvas(
      finalCanvas
    );



    // ==================================================
    // CAMERA FLASH → PREVIEW
    // ==================================================

    showCaptureFeedback(
      finalCanvas
    );


  }


  catch (
    error
  ) {


    console.error(

      "SCREENSHOT FAILED:",

      error

    );

  }


  finally {


    if (
      captureButton
    ) {


      captureButton.disabled =
        false;


      captureButton.classList.remove(
        "is-capturing"
      );

    }



    capturing =
      false;

  }

}



// ======================================================
// CAMERA ICON
// ======================================================

captureButton
  ?.addEventListener(

    "click",

    (
      event
    ) => {


      event.preventDefault();


      event.stopPropagation();



      void captureScene();

    }

  );



// ======================================================
// DRAW FINISH
//
// AFTER FINISH:
//
// S = SCREENSHOT
// ======================================================

drawFinishButton
  ?.addEventListener(

    "click",

    () => {


      drawWritingFinished =
        true;

    },

    true

  );



// ======================================================
// DRAW RESET
// ======================================================

drawResetButton
  ?.addEventListener(

    "click",

    () => {


      drawWritingFinished =
        false;

    },

    true

  );



// ======================================================
// WATCH DRAW ENTER / EXIT
// ======================================================

function syncDrawSceneState() {


  const drawActive =

    document.body.classList.contains(
      "draw-active"
    );



  if (

    drawActive

    &&

    !drawWasActive

  ) {


    drawWritingFinished =
      false;

  }



  if (

    !drawActive

    &&

    drawWasActive

  ) {


    drawWritingFinished =
      false;

  }



  drawWasActive =
    drawActive;

}



const drawSceneObserver =

  new MutationObserver(

    () => {


      syncDrawSceneState();

    }

  );



drawSceneObserver.observe(

  document.body,

  {

    attributes:
      true,

    attributeFilter: [
      "class"
    ]

  }

);



syncDrawSceneState();



// ======================================================
// NORMAL HTML TEXT INPUT CHECK
// ======================================================

function isTypingIntoHTMLElement(
  target
) {


  if (
    !(target instanceof Element)
  ) {


    return false;

  }



  if (
    target.matches(
      "input, textarea, select"
    )
  ) {


    return true;

  }



  if (
    target.closest(
      "[contenteditable='true']"
    )
  ) {


    return true;

  }



  return false;

}



// ======================================================
// DRAW LETTER WRITING MODE
// ======================================================

function isDrawLetterWritingMode() {


  if (
    !document.body.classList.contains(
      "draw-active"
    )
  ) {


    return false;

  }



  if (
    drawWritingFinished
  ) {


    return false;

  }



  const indicator =

    document.getElementById(
      "draw-mode-indicator"
    );



  const text =

    String(

      indicator?.textContent

      ||

      ""

    )
      .trim()
      .toUpperCase();



  return (

    text.includes(
      "WRITE ON LINED BACK"
    )

    ||

    text.includes(
      "WRITE"
    )

  );

}



// ======================================================
// S HOTKEY
//
// S
// → screenshot
//
// Ctrl + S
// Cmd + S
// Alt + S
// → untouched
//
// DRAW while actively writing:
// S
// → normal letter
//
// DRAW after FINISH:
// S
// → screenshot
// ======================================================

document.addEventListener(

  "keydown",

  (
    event
  ) => {


    if (
      event.repeat
    ) {


      return;

    }



    if (

      event.ctrlKey

      ||

      event.metaKey

      ||

      event.altKey

    ) {


      return;

    }



    if (

      String(
        event.key
      )
      .toLowerCase()

      !==

      "s"

    ) {


      return;

    }



    if (
      isTypingIntoHTMLElement(
        event.target
      )
    ) {


      return;

    }



    if (
      isDrawLetterWritingMode()
    ) {


      return;

    }



    if (
      !document.body.classList.contains(
        "recording-active"
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



    event.preventDefault();


    event.stopPropagation();



    void captureScene();

  },

  true

);