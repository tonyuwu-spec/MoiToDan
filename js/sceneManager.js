// ======================================================
// MỜI TỪ ĐÀN
// SCENE MANAGER
// ======================================================


export class SceneManager {


  constructor() {


    this.scenes =
      new Map();


    this.currentScene =
      null;


    this.currentName =
      null;

  }



  register(
    name,
    scene
  ) {


    this.scenes.set(

      name,

      scene

    );

  }



  async goTo(
    name,
    data = {}
  ) {


    const nextScene =

      this.scenes.get(
        name
      );



    if (
      !nextScene
    ) {


      console.warn(

        `Scene "${name}" is not built yet.`

      );


      return false;

    }



    if (

      this.currentScene

      &&

      this.currentScene !== nextScene

      &&

      typeof this.currentScene.exit === "function"

    ) {


      await this.currentScene.exit();

    }



    this.currentScene =
      nextScene;


    this.currentName =
      name;



    if (
      typeof nextScene.enter === "function"
    ) {


      await nextScene.enter(
        data
      );

    }



    return true;

  }



  update(
    now
  ) {


    if (

      this.currentScene

      &&

      typeof this.currentScene.update === "function"

    ) {


      this.currentScene.update(
        now
      );

    }

  }

}