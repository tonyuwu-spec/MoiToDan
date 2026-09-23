// ======================================================
// OPENING SLIME
// ======================================================

export class OpeningSlime {


  constructor(
    containerId
  ) {


    this.containerId =
      containerId;


    this.instance =
      null;


    this.started =
      false;

  }



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
        "p5.js was not loaded."
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

      return;

    }



    this.started =
      true;



    this.instance =

      new window.p5(

        (p) => {


          const DISPLAY_WIDTH =
            2560;


          const DISPLAY_HEIGHT =
            1440;



          // Half-resolution internal simulation
          // for better performance.

          const SIMULATION_SCALE =
            0.25;



          const SIM_WIDTH =

            Math.round(

              DISPLAY_WIDTH
              *
              SIMULATION_SCALE

            );



          const SIM_HEIGHT =

            Math.round(

              DISPLAY_HEIGHT
              *
              SIMULATION_SCALE

            );



          const NUM_MOLDS =
            4000;



          const molds =
            [];



          let density =
            1;



          class Mold {


            constructor() {


              this.x =

                p.random(

                  p.width / 2 - 20,

                  p.width / 2 + 20

                );


              this.y =

                p.random(

                  p.height / 2 - 20,

                  p.height / 2 + 20

                );


              this.r =
                0.6;



              this.heading =

                p.random(
                  360
                );


              this.vx =

                p.cos(
                  this.heading
                );


              this.vy =

                p.sin(
                  this.heading
                );


              this.rotAngle =
                45;



              this.rSensorPos =

                p.createVector(
                  0,
                  0
                );


              this.lSensorPos =

                p.createVector(
                  0,
                  0
                );


              this.fSensorPos =

                p.createVector(
                  0,
                  0
                );


              this.sensorAngle =
                45;


              this.sensorDist =
                10;

            }



            update() {


              this.vx =

                p.cos(
                  this.heading
                );


              this.vy =

                p.sin(
                  this.heading
                );



              this.x =

                (

                  this.x

                  +

                  this.vx

                  +

                  p.width

                )

                %

                p.width;



              this.y =

                (

                  this.y

                  +

                  this.vy

                  +

                  p.height

                )

                %

                p.height;



              this.getSensorPos(

                this.rSensorPos,

                this.heading
                +
                this.sensorAngle

              );



              this.getSensorPos(

                this.lSensorPos,

                this.heading
                -
                this.sensorAngle

              );



              this.getSensorPos(

                this.fSensorPos,

                this.heading

              );



              const r =

                this.readSensor(
                  this.rSensorPos
                );


              const l =

                this.readSensor(
                  this.lSensorPos
                );


              const f =

                this.readSensor(
                  this.fSensorPos
                );



              if (

                f > l

                &&

                f > r

              ) {


                return;

              }



              if (

                f < l

                &&

                f < r

              ) {


                if (
                  p.random(1) < 0.5
                ) {


                  this.heading +=
                    this.rotAngle;

                }


                else {


                  this.heading -=
                    this.rotAngle;

                }


                return;

              }



              if (
                l > r
              ) {


                this.heading -=
                  this.rotAngle;

              }


              else if (
                r > l
              ) {


                this.heading +=
                  this.rotAngle;

              }

            }



            readSensor(
              sensor
            ) {


              const sx =

                Math.max(

                  0,

                  Math.min(

                    p.width - 1,

                    Math.floor(
                      sensor.x
                    )

                  )

                );



              const sy =

                Math.max(

                  0,

                  Math.min(

                    p.height - 1,

                    Math.floor(
                      sensor.y
                    )

                  )

                );



              const index =

                4

                *

                (

                  density
                  *
                  sy

                )

                *

                (

                  density
                  *
                  p.width

                )

                +

                4

                *

                (

                  density
                  *
                  sx

                );



              return p.pixels[index] || 0;

            }



            display() {


              p.noStroke();



              p.fill(

                235,

                15,

                30,

                220

              );



              p.ellipse(

                this.x,

                this.y,

                this.r * 2,

                this.r * 2

              );

            }



            getSensorPos(
              sensor,
              angle
            ) {


              sensor.x =

                (

                  this.x

                  +

                  this.sensorDist
                  *
                  p.cos(
                    angle
                  )

                  +

                  p.width

                )

                %

                p.width;



              sensor.y =

                (

                  this.y

                  +

                  this.sensorDist
                  *
                  p.sin(
                    angle
                  )

                  +

                  p.height

                )

                %

                p.height;

            }

          }



          p.setup = () => {


            const canvas =

              p.createCanvas(

                SIM_WIDTH,

                SIM_HEIGHT

              );



            canvas.parent(
              container
            );



            p.pixelDensity(
              1
            );



            density =
              p.pixelDensity();



            p.angleMode(
              p.DEGREES
            );



            p.frameRate(
              30
            );



            p.background(
              0
            );



            canvas.elt.style.width =

              `${DISPLAY_WIDTH}px`;



            canvas.elt.style.height =

              `${DISPLAY_HEIGHT}px`;



            for (
              let i = 0;
              i < NUM_MOLDS;
              i++
            ) {


              molds.push(

                new Mold()

              );

            }

          };



          p.draw = () => {


            p.background(

              0,

              8

            );



            p.loadPixels();



            for (
              let i = 0;
              i < molds.length;
              i++
            ) {


              molds[i].update();


              molds[i].display();

            }

          };


        },

        container

      );

  }



  stop() {


    if (
      this.instance
    ) {


      this.instance.remove();


      this.instance =
        null;

    }



    this.started =
      false;

  }

}