// ======================================================
// MỜI TỪ ĐÀN
// CUT SILK SIMULATION
//
// Isolated p5 instance.
// Does NOT create another camera.
// Does NOT create another hand tracker.
// ======================================================

export class CutSilk {

  constructor(
    containerId,
    options = {}
  ) {

    this.containerId =
      containerId;

    this.size =
      780;

    this.instance =
      null;

    this.api =
      null;

    this.started =
      false;

    this.cutEnabled =
      false;

    this.pendingThoughts =
      [];

    this.getAudioLevel =
      options.getAudioLevel
      ||
      (() => 0);

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
        "CUT SILK: p5.js is not loaded."
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
        "CUT SILK MOUNT NOT FOUND:",
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
          // SETTINGS
          // =================================================

          const SIZE =
            780;


          const EDGE =
            8;


          const MAX_STRANDS =
            58;


          const MAIN_NODE_MIN =
            24;


          const MAIN_NODE_MAX =
            34;


          const CONSTRAINT_ITERATIONS =
            6;


          const BASE_DAMPING =
            0.91;


          const strands =
            [];



          // =================================================
          // HELPERS
          // =================================================

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


          function lerp(
            a,
            b,
            t
          ) {

            return a + (b - a) * t;

          }


          function randomInteger(
            minimum,
            maximum
          ) {

            const min =
              Math.ceil(minimum);

            const max =
              Math.floor(maximum);

            return Math.floor(
              p.random(
                min,
                max + 1
              )
            );

          }


          function cubicBezier(
            p0,
            p1,
            p2,
            p3,
            t
          ) {

            const oneMinus =
              1 - t;

            const a =
              oneMinus
              *
              oneMinus
              *
              oneMinus;

            const b =
              3
              *
              oneMinus
              *
              oneMinus
              *
              t;

            const c =
              3
              *
              oneMinus
              *
              t
              *
              t;

            const d =
              t
              *
              t
              *
              t;

            return {

              x:
                a * p0.x
                +
                b * p1.x
                +
                c * p2.x
                +
                d * p3.x,

              y:
                a * p0.y
                +
                b * p1.y
                +
                c * p2.y
                +
                d * p3.y

            };

          }



          // =================================================
          // RANDOM POINT EXACTLY ON 780 × 780 EDGE
          // =================================================

          function randomBoundaryPoint(
            side
          ) {

            switch (
              side
            ) {

              // TOP

              case 0:

                return {

                  x:
                    p.random(
                      EDGE,
                      SIZE - EDGE
                    ),

                  y:
                    EDGE

                };


              // RIGHT

              case 1:

                return {

                  x:
                    SIZE - EDGE,

                  y:
                    p.random(
                      EDGE,
                      SIZE - EDGE
                    )

                };


              // BOTTOM

              case 2:

                return {

                  x:
                    p.random(
                      EDGE,
                      SIZE - EDGE
                    ),

                  y:
                    SIZE - EDGE

                };


              // LEFT

              default:

                return {

                  x:
                    EDGE,

                  y:
                    p.random(
                      EDGE,
                      SIZE - EDGE
                    )

                };

            }

          }



          // =================================================
          // SPLIT END ATTACHMENT ON SAME OUTER EDGE
          // =================================================

          function boundaryPointNear(
            side,
            original,
            spread
          ) {

            if (
              side === 0
              ||
              side === 2
            ) {

              return {

                x:
                  clamp(
                    original.x
                    +
                    p.random(
                      -spread,
                      spread
                    ),
                    EDGE,
                    SIZE - EDGE
                  ),

                y:
                  side === 0
                  ?
                  EDGE
                  :
                  SIZE - EDGE

              };

            }


            return {

              x:
                side === 1
                ?
                SIZE - EDGE
                :
                EDGE,

              y:
                clamp(
                  original.y
                  +
                  p.random(
                    -spread,
                    spread
                  ),
                  EDGE,
                  SIZE - EDGE
                )

            };

          }



          // =================================================
          // CONTROL POINT DIRECTED TOWARD INSIDE
          // =================================================

          function inwardControlPoint(
            point,
            side,
            distance,
            tangentJitter
          ) {

            let x =
              point.x;

            let y =
              point.y;


            if (
              side === 0
            ) {

              y +=
                distance;

              x +=
                tangentJitter;

            }

            else if (
              side === 1
            ) {

              x -=
                distance;

              y +=
                tangentJitter;

            }

            else if (
              side === 2
            ) {

              y -=
                distance;

              x +=
                tangentJitter;

            }

            else {

              x +=
                distance;

              y +=
                tangentJitter;

            }


            return {

              x:
                clamp(
                  x,
                  EDGE,
                  SIZE - EDGE
                ),

              y:
                clamp(
                  y,
                  EDGE,
                  SIZE - EDGE
                )

            };

          }



          // =================================================
          // POINT → LINE SEGMENT DISTANCE
          // =================================================

          function pointSegmentDistance(
            px,
            py,
            ax,
            ay,
            bx,
            by
          ) {

            const vx =
              bx - ax;

            const vy =
              by - ay;

            const wx =
              px - ax;

            const wy =
              py - ay;


            const lengthSquared =
              vx * vx
              +
              vy * vy;


            if (
              lengthSquared <= 0.0001
            ) {

              return Math.hypot(
                px - ax,
                py - ay
              );

            }


            let t =
              (
                wx * vx
                +
                wy * vy
              )
              /
              lengthSquared;


            t =
              clamp(
                t,
                0,
                1
              );


            const closestX =
              ax
              +
              vx * t;


            const closestY =
              ay
              +
              vy * t;


            return Math.hypot(
              px - closestX,
              py - closestY
            );

          }



          // =================================================
          // SILK NODE
          // =================================================

          class SilkNode {

            constructor(
              x,
              y,
              options = {}
            ) {

              this.x =
                x;

              this.y =
                y;

              this.oldX =
                x;

              this.oldY =
                y;

              this.baseX =
                x;

              this.baseY =
                y;

              this.pinned =
                Boolean(
                  options.pinned
                );

              this.anchorProvider =
                options.anchorProvider
                ||
                null;

            }


            isAnchored() {

              return (
                this.pinned
                ||
                Boolean(
                  this.anchorProvider
                )
              );

            }


            forceAnchor() {

              if (
                this.anchorProvider
              ) {

                const position =
                  this.anchorProvider();


                this.x =
                  position.x;

                this.y =
                  position.y;

                this.oldX =
                  position.x;

                this.oldY =
                  position.y;


                return;

              }


              if (
                this.pinned
              ) {

                this.x =
                  this.baseX;

                this.y =
                  this.baseY;

                this.oldX =
                  this.baseX;

                this.oldY =
                  this.baseY;

              }

            }


            update(
              time,
              index,
              audio,
              responsiveness,
              phaseOffset = 0
            ) {

              if (
                this.isAnchored()
              ) {

                this.forceAnchor();

                return;

              }



              const velocityX =
                (
                  this.x
                  -
                  this.oldX
                )
                *
                BASE_DAMPING;


              const velocityY =
                (
                  this.y
                  -
                  this.oldY
                )
                *
                BASE_DAMPING;


              this.oldX =
                this.x;

              this.oldY =
                this.y;



              // -----------------------------------------
              // STIFFNESS
              // -----------------------------------------

              const basePull =
                0.034;


              this.x +=
                velocityX
                +
                (
                  this.baseX
                  -
                  this.x
                )
                *
                basePull;


              this.y +=
                velocityY
                +
                (
                  this.baseY
                  -
                  this.y
                )
                *
                basePull;



              // -----------------------------------------
              // MICROPHONE SWAY
              // -----------------------------------------

              const quietMotion =
                0.06;


              const microphoneMotion =
                audio
                *
                4.3
                *
                responsiveness;


              const sway =
                quietMotion
                +
                microphoneMotion;


              const phase =
                time
                *
                0.0026
                +
                index
                *
                0.34
                +
                phaseOffset;


              this.x +=
                Math.sin(
                  phase
                )
                *
                sway;


              this.y +=
                Math.cos(
                  phase * 0.83
                )
                *
                sway
                *
                0.64;



              // -----------------------------------------
              // KEEP EVERYTHING INSIDE 780 × 780
              // -----------------------------------------

              this.x =
                clamp(
                  this.x,
                  EDGE,
                  SIZE - EDGE
                );


              this.y =
                clamp(
                  this.y,
                  EDGE,
                  SIZE - EDGE
                );

            }

          }



          // =================================================
          // CHAIN CONSTRAINT
          // =================================================

          function solveChainConstraints(
            nodes,
            restLengths,
            activeSegments
          ) {

            for (
              let i = 0;
              i < nodes.length - 1;
              i++
            ) {

              if (
                !activeSegments[i]
              ) {

                continue;

              }


              const a =
                nodes[i];

              const b =
                nodes[i + 1];


              const dx =
                b.x
                -
                a.x;

              const dy =
                b.y
                -
                a.y;


              const currentLength =
                Math.max(
                  0.0001,
                  Math.hypot(
                    dx,
                    dy
                  )
                );


              const targetLength =
                restLengths[i];


              const difference =
                (
                  currentLength
                  -
                  targetLength
                )
                /
                currentLength;


              const adjustX =
                dx
                *
                difference
                *
                0.5;


              const adjustY =
                dy
                *
                difference
                *
                0.5;


              if (
                !a.isAnchored()
              ) {

                a.x +=
                  adjustX;

                a.y +=
                  adjustY;

              }


              if (
                !b.isAnchored()
              ) {

                b.x -=
                  adjustX;

                b.y -=
                  adjustY;

              }

            }


            if (
              nodes.length > 0
            ) {

              nodes[0]
                .forceAnchor();


              nodes[
                nodes.length - 1
              ]
                .forceAnchor();

            }

          }



          // =================================================
          // REMOVE DETACHED FLOATING MIDDLE PIECES
          // =================================================

          function removeDetachedMiddleSegments(
            activeSegments
          ) {

            const count =
              activeSegments.length;


            if (
              count === 0
            ) {

              return;

            }


            const connectedToStart =
              new Array(
                count
              )
              .fill(
                false
              );


            const connectedToEnd =
              new Array(
                count
              )
              .fill(
                false
              );


            for (
              let i = 0;
              i < count;
              i++
            ) {

              if (
                !activeSegments[i]
              ) {

                break;

              }

              connectedToStart[i] =
                true;

            }


            for (
              let i = count - 1;
              i >= 0;
              i--
            ) {

              if (
                !activeSegments[i]
              ) {

                break;

              }

              connectedToEnd[i] =
                true;

            }


            for (
              let i = 0;
              i < count;
              i++
            ) {

              if (
                !activeSegments[i]
              ) {

                continue;

              }


              if (
                !connectedToStart[i]
                &&
                !connectedToEnd[i]
              ) {

                activeSegments[i] =
                  false;

              }

            }

          }



          // =================================================
          // CUT CHAIN
          // =================================================

          function cutChain(
            nodes,
            activeSegments,
            x,
            y,
            radius
          ) {

            let nearestIndex =
              -1;


            let nearestDistance =
              Infinity;


            for (
              let i = 0;
              i < activeSegments.length;
              i++
            ) {

              if (
                !activeSegments[i]
              ) {

                continue;

              }


              const a =
                nodes[i];


              const b =
                nodes[i + 1];


              const distance =
                pointSegmentDistance(
                  x,
                  y,
                  a.x,
                  a.y,
                  b.x,
                  b.y
                );


              if (
                distance
                <
                nearestDistance
              ) {

                nearestDistance =
                  distance;

                nearestIndex =
                  i;

              }

            }


            if (
              nearestIndex < 0
              ||
              nearestDistance > radius
            ) {

              return false;

            }


            activeSegments[
              nearestIndex
            ] =
              false;



            // -----------------------------------------
            // SMALL SNAP WHEN CUT
            // -----------------------------------------

            const a =
              nodes[
                nearestIndex
              ];


            const b =
              nodes[
                nearestIndex + 1
              ];


            let dx =
              b.x
              -
              a.x;


            let dy =
              b.y
              -
              a.y;


            const length =
              Math.max(
                0.0001,
                Math.hypot(
                  dx,
                  dy
                )
              );


            dx /=
              length;


            dy /=
              length;


            const snap =
              5.5;


            if (
              !a.isAnchored()
            ) {

              a.oldX =
                a.x
                +
                dx
                *
                snap;


              a.oldY =
                a.y
                +
                dy
                *
                snap;

            }


            if (
              !b.isAnchored()
            ) {

              b.oldX =
                b.x
                -
                dx
                *
                snap;


              b.oldY =
                b.y
                -
                dy
                *
                snap;

            }


            removeDetachedMiddleSegments(
              activeSegments
            );


            return true;

          }



          // =================================================
          // SILK DRAWING
          //
          // Important fix:
          //
          // no curveVertex().
          //
          // The path itself is Bézier-generated,
          // but rendered using reliable line() calls.
          // =================================================

          function drawSilkChain(
            nodes,
            activeSegments,
            color,
            width
          ) {

            p.strokeCap(
              p.ROUND
            );


            for (
              let i = 0;
              i < activeSegments.length;
              i++
            ) {

              if (
                !activeSegments[i]
              ) {

                continue;

              }


              const a =
                nodes[i];


              const b =
                nodes[i + 1];


              const dx =
                b.x
                -
                a.x;


              const dy =
                b.y
                -
                a.y;


              const length =
                Math.max(
                  0.0001,
                  Math.hypot(
                    dx,
                    dy
                  )
                );


              const normalX =
                -dy
                /
                length;


              const normalY =
                dx
                /
                length;



              // -----------------------------------------
              // SOFT OUTER FIBER
              // -----------------------------------------

              p.stroke(
                color.r,
                color.g,
                color.b,
                42
              );


              p.strokeWeight(
                width
                *
                2.3
              );


              p.line(
                a.x,
                a.y,
                b.x,
                b.y
              );



              // -----------------------------------------
              // MAIN COLOR
              // -----------------------------------------

              p.stroke(
                color.r,
                color.g,
                color.b,
                210
              );


              p.strokeWeight(
                width
              );


              p.line(
                a.x,
                a.y,
                b.x,
                b.y
              );



              const offset =
                Math.max(
                  0.9,
                  width
                  *
                  0.27
                );



              // -----------------------------------------
              // FINE PARALLEL SILK 1
              // -----------------------------------------

              p.stroke(
                color.r,
                color.g,
                color.b,
                95
              );


              p.strokeWeight(
                Math.max(
                  0.7,
                  width
                  *
                  0.24
                )
              );


              p.line(
                a.x
                +
                normalX
                *
                offset,

                a.y
                +
                normalY
                *
                offset,

                b.x
                +
                normalX
                *
                offset,

                b.y
                +
                normalY
                *
                offset
              );



              // -----------------------------------------
              // FINE PARALLEL SILK 2
              // -----------------------------------------

              p.stroke(
                255,
                247,
                205,
                72
              );


              p.strokeWeight(
                Math.max(
                  0.65,
                  width
                  *
                  0.20
                )
              );


              p.line(
                a.x
                -
                normalX
                *
                offset,

                a.y
                -
                normalY
                *
                offset,

                b.x
                -
                normalX
                *
                offset,

                b.y
                -
                normalY
                *
                offset
              );



              // -----------------------------------------
              // LIGHT CENTER FILAMENT
              // -----------------------------------------

              p.stroke(
                255,
                252,
                225,
                105
              );


              p.strokeWeight(
                Math.max(
                  0.55,
                  width
                  *
                  0.16
                )
              );


              p.line(
                a.x,
                a.y,
                b.x,
                b.y
              );

            }

          }



          // =================================================
          // SPLIT SILK BRANCH
          // =================================================

          class SilkBranch {

            constructor(
              options
            ) {

              this.rootNode =
                options.rootNode;


              this.edgeSide =
                options.edgeSide;


              this.edgeOrigin =
                options.edgeOrigin;


              this.color =
                options.color;


              this.strokeWidth =
                options.strokeWidth;


              this.responsiveness =
                options.responsiveness;


              this.scale =
                options.scale;


              this.phaseOffset =
                p.random(
                  0,
                  Math.PI
                  *
                  2
                );


              this.nodes =
                [];


              this.restLengths =
                [];


              this.activeSegments =
                [];


              this.createGeometry();

            }


            createGeometry() {

              const spread =
                52
                +
                120
                *
                this.scale;


              const start = {

                x:
                  this.rootNode.x,

                y:
                  this.rootNode.y

              };


              const end =
                boundaryPointNear(
                  this.edgeSide,
                  this.edgeOrigin,
                  spread
                );


              const distance =
                Math.hypot(
                  end.x
                  -
                  start.x,

                  end.y
                  -
                  start.y
                );


              const controlDistance =
                clamp(
                  distance
                  *
                  0.42,
                  35,
                  150
                );


              const control1 = {

                x:
                  lerp(
                    start.x,
                    end.x,
                    0.30
                  )
                  +
                  p.random(
                    -35,
                    35
                  )
                  *
                  this.scale,

                y:
                  lerp(
                    start.y,
                    end.y,
                    0.30
                  )
                  +
                  p.random(
                    -35,
                    35
                  )
                  *
                  this.scale

              };


              const control2 =
                inwardControlPoint(
                  end,
                  this.edgeSide,
                  controlDistance,
                  p.random(
                    -40,
                    40
                  )
                  *
                  this.scale
                );


              const nodeCount =
                randomInteger(
                  9,
                  14
                );


              for (
                let i = 0;
                i < nodeCount;
                i++
              ) {

                const t =
                  i
                  /
                  (
                    nodeCount - 1
                  );


                if (
                  i === 0
                ) {

                  this.nodes.push(

                    new SilkNode(
                      start.x,
                      start.y,
                      {

                        anchorProvider:
                          () => {

                            return {

                              x:
                                this.rootNode.x,

                              y:
                                this.rootNode.y

                            };

                          }

                      }
                    )

                  );


                  continue;

                }


                if (
                  i ===
                  nodeCount - 1
                ) {

                  this.nodes.push(

                    new SilkNode(
                      end.x,
                      end.y,
                      {

                        pinned:
                          true

                      }
                    )

                  );


                  continue;

                }


                const point =
                  cubicBezier(
                    start,
                    control1,
                    control2,
                    end,
                    t
                  );


                const jitter =
                  Math.sin(
                    Math.PI
                    *
                    t
                  )
                  *
                  p.random(
                    -7,
                    7
                  )
                  *
                  this.scale;


                point.x =
                  clamp(
                    point.x
                    +
                    jitter,
                    EDGE,
                    SIZE - EDGE
                  );


                point.y =
                  clamp(
                    point.y
                    -
                    jitter
                    *
                    0.65,
                    EDGE,
                    SIZE - EDGE
                  );


                this.nodes.push(

                  new SilkNode(
                    point.x,
                    point.y
                  )

                );

              }


              for (
                let i = 0;
                i < this.nodes.length - 1;
                i++
              ) {

                const a =
                  this.nodes[i];


                const b =
                  this.nodes[i + 1];


                this.restLengths.push(

                  Math.hypot(
                    b.x - a.x,
                    b.y - a.y
                  )

                );


                this.activeSegments.push(
                  true
                );

              }

            }


            update(
              time,
              audio
            ) {

              for (
                let i = 0;
                i < this.nodes.length;
                i++
              ) {

                this.nodes[i].update(
                  time,
                  i,
                  audio,
                  this.responsiveness
                  *
                  0.82,
                  this.phaseOffset
                );

              }


              for (
                let iteration = 0;
                iteration < CONSTRAINT_ITERATIONS;
                iteration++
              ) {

                solveChainConstraints(
                  this.nodes,
                  this.restLengths,
                  this.activeSegments
                );

              }

            }


            draw() {

              drawSilkChain(
                this.nodes,
                this.activeSegments,
                this.color,
                this.strokeWidth
              );

            }


            cutAt(
              x,
              y,
              radius
            ) {

              return cutChain(
                this.nodes,
                this.activeSegments,
                x,
                y,
                radius
              );

            }

          }



          // =================================================
          // MAIN SILK STRAND
          // =================================================

          class SilkStrand {

            constructor(
              analysis,
              text,
              options = {}
            ) {

              this.analysis =
                analysis;


              this.text =
                text;


              this.nodes =
                [];


              this.restLengths =
                [];


              this.activeSegments =
                [];


              this.branches =
                [];


              const rgb =
                analysis.rgb
                ||
                [
                  255,
                  135,
                  45
                ];


              this.color = {

                r:
                  rgb[0],

                g:
                  rgb[1],

                b:
                  rgb[2]

              };


              this.strokeWidth =
                2.8
                +
                (
                  analysis.intensity
                  ||
                  0
                )
                *
                1.8;


              this.responsiveness =
                0.70
                +
                (
                  analysis.intensity
                  ||
                  0
                )
                *
                0.68;


              this.splitCount =
                clamp(
                  options.splitCount
                  ??
                  2,
                  1,
                  6
                );


              this.splitScale =
                clamp(
                  analysis.splitScale
                  ??
                  0.9,
                  0.65,
                  1.5
                );


              this.sideA =
                0;


              this.sideB =
                2;


              this.startPoint =
                null;


              this.endPoint =
                null;


              this.createGeometry();


              this.createSplitEnds();

            }



            // =============================================
            // MAIN SILK CURVE
            // =============================================

            createGeometry() {

              this.sideA =
                Math.floor(
                  p.random(4)
                );


              this.sideB =
                Math.floor(
                  p.random(4)
                );


              while (
                this.sideB ===
                this.sideA
              ) {

                this.sideB =
                  Math.floor(
                    p.random(4)
                  );

              }


              const start =
                randomBoundaryPoint(
                  this.sideA
                );


              const end =
                randomBoundaryPoint(
                  this.sideB
                );


              this.startPoint =
                start;


              this.endPoint =
                end;


              const directDistance =
                Math.hypot(
                  end.x
                  -
                  start.x,

                  end.y
                  -
                  start.y
                );


              const controlDistance =
                clamp(
                  directDistance
                  *
                  0.38,
                  90,
                  270
                );


              const control1 =
                inwardControlPoint(
                  start,
                  this.sideA,
                  controlDistance,
                  p.random(
                    -150,
                    150
                  )
                );


              const control2 =
                inwardControlPoint(
                  end,
                  this.sideB,
                  controlDistance,
                  p.random(
                    -150,
                    150
                  )
                );


              control1.x =
                lerp(
                  control1.x,
                  SIZE * 0.5,
                  p.random(
                    0.08,
                    0.28
                  )
                );


              control1.y =
                lerp(
                  control1.y,
                  SIZE * 0.5,
                  p.random(
                    0.08,
                    0.28
                  )
                );


              control2.x =
                lerp(
                  control2.x,
                  SIZE * 0.5,
                  p.random(
                    0.08,
                    0.28
                  )
                );


              control2.y =
                lerp(
                  control2.y,
                  SIZE * 0.5,
                  p.random(
                    0.08,
                    0.28
                  )
                );


              const nodeCount =
                randomInteger(
                  MAIN_NODE_MIN,
                  MAIN_NODE_MAX
                );


              const wavePhase =
                p.random(
                  Math.PI
                  *
                  2
                );


              const waveStrength =
                p.random(
                  3,
                  12
                );


              for (
                let i = 0;
                i < nodeCount;
                i++
              ) {

                const t =
                  i
                  /
                  (
                    nodeCount - 1
                  );


                if (
                  i === 0
                ) {

                  this.nodes.push(

                    new SilkNode(
                      start.x,
                      start.y,
                      {
                        pinned:
                          true
                      }
                    )

                  );


                  continue;

                }


                if (
                  i ===
                  nodeCount - 1
                ) {

                  this.nodes.push(

                    new SilkNode(
                      end.x,
                      end.y,
                      {
                        pinned:
                          true
                      }
                    )

                  );


                  continue;

                }


                const point =
                  cubicBezier(
                    start,
                    control1,
                    control2,
                    end,
                    t
                  );


                const wave =
                  Math.sin(
                    t
                    *
                    Math.PI
                    *
                    3
                    +
                    wavePhase
                  )
                  *
                  waveStrength
                  *
                  Math.sin(
                    Math.PI
                    *
                    t
                  );


                point.x =
                  clamp(
                    point.x
                    +
                    wave,
                    EDGE,
                    SIZE - EDGE
                  );


                point.y =
                  clamp(
                    point.y
                    -
                    wave
                    *
                    0.48,
                    EDGE,
                    SIZE - EDGE
                  );


                this.nodes.push(

                  new SilkNode(
                    point.x,
                    point.y
                  )

                );

              }


              for (
                let i = 0;
                i < this.nodes.length - 1;
                i++
              ) {

                const a =
                  this.nodes[i];


                const b =
                  this.nodes[i + 1];


                this.restLengths.push(

                  Math.hypot(
                    b.x - a.x,
                    b.y - a.y
                  )

                );


                this.activeSegments.push(
                  true
                );

              }

            }



            // =============================================
            // SPLIT / FORKED ENDS
            // =============================================

            createSplitEnds() {

              if (
                this.nodes.length < 10
              ) {

                return;

              }


              const total =
                Math.round(
                  this.splitCount
                );


              for (
                let i = 0;
                i < total;
                i++
              ) {

                const fromStart =
                  total === 1
                  ?
                  p.random(1) < 0.5
                  :
                  i % 2 === 0;


                let rootIndex;

                let edgeSide;

                let edgeOrigin;


                if (
                  fromStart
                ) {

                  const maximum =
                    Math.max(
                      2,
                      Math.floor(
                        this.nodes.length
                        *
                        (
                          0.16
                          +
                          this.splitScale
                          *
                          0.06
                        )
                      )
                    );


                  rootIndex =
                    randomInteger(
                      2,
                      Math.min(
                        maximum,
                        this.nodes.length - 4
                      )
                    );


                  edgeSide =
                    this.sideA;


                  edgeOrigin =
                    this.startPoint;

                }

                else {

                  const offset =
                    Math.max(
                      2,
                      Math.floor(
                        this.nodes.length
                        *
                        (
                          0.16
                          +
                          this.splitScale
                          *
                          0.06
                        )
                      )
                    );


                  rootIndex =
                    randomInteger(
                      Math.max(
                        3,
                        this.nodes.length
                        -
                        offset
                        -
                        1
                      ),
                      this.nodes.length
                      -
                      3
                    );


                  edgeSide =
                    this.sideB;


                  edgeOrigin =
                    this.endPoint;

                }


                const rootNode =
                  this.nodes[
                    rootIndex
                  ];


                this.branches.push(

                  new SilkBranch(
                    {

                      rootNode,

                      edgeSide,

                      edgeOrigin,

                      color:
                        this.color,

                      strokeWidth:
                        Math.max(
                          1.0,
                          this.strokeWidth
                          *
                          p.random(
                            0.36,
                            0.62
                          )
                        ),

                      responsiveness:
                        this.responsiveness,

                      scale:
                        this.splitScale

                    }
                  )

                );

              }

            }


            update(
              time,
              audio
            ) {

              for (
                let i = 0;
                i < this.nodes.length;
                i++
              ) {

                this.nodes[i].update(
                  time,
                  i,
                  audio,
                  this.responsiveness
                );

              }


              for (
                let iteration = 0;
                iteration < CONSTRAINT_ITERATIONS;
                iteration++
              ) {

                solveChainConstraints(
                  this.nodes,
                  this.restLengths,
                  this.activeSegments
                );

              }


              for (
                const branch of this.branches
              ) {

                branch.update(
                  time,
                  audio
                );

              }

            }


            draw() {

              drawSilkChain(
                this.nodes,
                this.activeSegments,
                this.color,
                this.strokeWidth
              );


              for (
                const branch of this.branches
              ) {

                branch.draw();

              }

            }


            cutAt(
              x,
              y,
              radius
            ) {

              let cutAnything =
                false;


              if (
                cutChain(
                  this.nodes,
                  this.activeSegments,
                  x,
                  y,
                  radius
                )
              ) {

                cutAnything =
                  true;

              }


              for (
                const branch of this.branches
              ) {

                if (
                  branch.cutAt(
                    x,
                    y,
                    radius
                  )
                ) {

                  cutAnything =
                    true;

                }

              }


              return cutAnything;

            }

          }



          // =================================================
          // ADD THOUGHT
          // =================================================

          function addThought(
            text,
            analysis
          ) {

            const wordCount =
              text
                .trim()
                .split(
                  /\s+/
                )
                .filter(
                  Boolean
                )
                .length;


            let strandCount =
              2
              +
              Math.floor(
                wordCount / 20
              )
              +
              Math.round(
                (
                  analysis.intensity
                  ||
                  0
                )
                *
                2
              );


            strandCount =
              clamp(
                strandCount,
                2,
                6
              );


            const splitBudget =
              clamp(
                analysis.splitCount
                ??
                (
                  2
                  +
                  Math.floor(
                    wordCount / 10
                  )
                ),
                2,
                14
              );


            const averageSplits =
              splitBudget
              /
              strandCount;


            for (
              let i = 0;
              i < strandCount;
              i++
            ) {

              const localSplitCount =
                clamp(
                  Math.round(
                    averageSplits
                    +
                    p.random(
                      -0.45,
                      0.85
                    )
                  ),
                  1,
                  6
                );


              strands.push(

                new SilkStrand(
                  analysis,
                  text,
                  {
                    splitCount:
                      localSplitCount
                  }
                )

              );

            }


            while (
              strands.length
              >
              MAX_STRANDS
            ) {

              strands.shift();

            }

          }



          // =================================================
          // CUT AT POSITION
          // =================================================

          function cutAt(
            x,
            y,
            radius = 18
          ) {

            if (
              !controller.cutEnabled
            ) {

              return false;

            }


            if (
              x < 0
              ||
              y < 0
              ||
              x > SIZE
              ||
              y > SIZE
            ) {

              return false;

            }


            let cutAnything =
              false;


            for (
              const strand of strands
            ) {

              if (
                strand.cutAt(
                  x,
                  y,
                  radius
                )
              ) {

                cutAnything =
                  true;

              }

            }


            return cutAnything;

          }



          // =================================================
          // POINTER → LOCAL 780 × 780 COORDINATE
          // =================================================

          function pointerToLocal(
            event
          ) {

            const canvas =
              p.canvas;


            if (
              !canvas
            ) {

              return null;

            }


            const rect =
              canvas
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
                  event.clientX
                  -
                  rect.left
                )
                /
                rect.width
                *
                SIZE,

              y:
                (
                  event.clientY
                  -
                  rect.top
                )
                /
                rect.height
                *
                SIZE

            };

          }



          // =================================================
          // SETUP
          // =================================================

          p.setup = () => {

            const canvas =
              p.createCanvas(
                SIZE,
                SIZE
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


            p.clear();



            // -----------------------------------------
            // FORCE REAL CANVAS SIZE
            // -----------------------------------------

            canvas.elt.style.display =
              "block";


            canvas.elt.style.width =
              `${SIZE}px`;


            canvas.elt.style.height =
              `${SIZE}px`;



            // -----------------------------------------
            // MOUSE MOVEMENT CUT
            // -----------------------------------------

            canvas.elt.addEventListener(

              "pointermove",

              (
                event
              ) => {

                if (
                  !controller.cutEnabled
                ) {

                  return;

                }


                const point =
                  pointerToLocal(
                    event
                  );


                if (
                  !point
                ) {

                  return;

                }


                cutAt(
                  point.x,
                  point.y,
                  19
                );

              }

            );



            // -----------------------------------------
            // CLICK CUT
            // -----------------------------------------

            const cutPointerEvent =

              (
                event
              ) => {

                if (
                  !controller.cutEnabled
                ) {

                  return;

                }


                const point =
                  pointerToLocal(
                    event
                  );


                if (
                  !point
                ) {

                  return;

                }


                cutAt(
                  point.x,
                  point.y,
                  24
                );

              };


            canvas.elt.addEventListener(
              "pointerdown",
              cutPointerEvent
            );


            canvas.elt.addEventListener(
              "click",
              cutPointerEvent
            );



            controller.api = {

              addThought,

              cutAt,

              reset:
                () => {

                  strands.length =
                    0;

                }

            };



            // -----------------------------------------
            // IMPORTANT:
            //
            // If ADD was clicked while p5 was still
            // initializing, restore those thoughts here.
            // -----------------------------------------

            if (
              controller
                .pendingThoughts
                .length
              >
              0
            ) {

              const queued =
                controller
                  .pendingThoughts
                  .splice(0);


              for (
                const item of queued
              ) {

                addThought(
                  item.text,
                  item.analysis
                );

              }

            }

          };



          // =================================================
          // DRAW
          // =================================================

          p.draw = () => {

            p.clear();


            const audio =
              clamp(
                Number(
                  controller
                    .getAudioLevel()
                )
                ||
                0,
                0,
                1
              );


            const now =
              p.millis();


            for (
              const strand of strands
            ) {

              strand.update(
                now,
                audio
              );


              strand.draw();

            }

          };


        },

        container

      );

  }



  // ====================================================
  // ADD THOUGHT
  // ====================================================

  addThought(
    text,
    analysis
  ) {

    if (
      !this.started
    ) {

      this.start();

    }


    // ==================================================
    // IMPORTANT FIX:
    //
    // p5 setup can complete slightly after start().
    //
    // Previously this could silently lose the thought,
    // leaving an empty canvas.
    // ==================================================

    if (
      !this.api
    ) {

      this.pendingThoughts.push(
        {
          text,
          analysis
        }
      );


      return;

    }


    this.api.addThought(
      text,
      analysis
    );

  }



  // ====================================================
  // CUT
  // ====================================================

  cutAt(
    x,
    y,
    radius = 18
  ) {

    if (
      !this.cutEnabled
    ) {

      return false;

    }


    return (
      this.api
        ?.cutAt(
          x,
          y,
          radius
        )
      ||
      false
    );

  }



  // ====================================================
  // CUT MODE
  // ====================================================

  setCutEnabled(
    enabled
  ) {

    this.cutEnabled =
      Boolean(
        enabled
      );

  }



  // ====================================================
  // RESET
  // ====================================================

  reset() {

    this.cutEnabled =
      false;


    this.pendingThoughts.length =
      0;


    this.api
      ?.reset();

  }



  // ====================================================
  // STOP
  // ====================================================

  stop() {

    if (
      this.instance
    ) {

      this.instance.remove();


      this.instance =
        null;

    }


    this.pendingThoughts.length =
      0;


    this.api =
      null;


    this.started =
      false;


    this.cutEnabled =
      false;

  }

}