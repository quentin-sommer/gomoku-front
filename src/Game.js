import React from 'react';
import {
    Engine,
    Scene,
    Texture,
    MeshBuilder,
    HDRCubeTexture,
    Animation,
    PBRMaterial,
    Mesh,
    Color3,
    Vector3,
    ArcRotateCamera,
    HemisphericLight
} from 'babylonjs';
import config from './config'

const genPawnAppearAnimation = () => {
  const animationAppear = new Animation('appear', 'material.alpha', 50, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
  const keys = [{
    frame: 0,
    value: 0
  }, {
    frame: 30,
    value: 0.7
  }, {
    frame: 60,
    value: 1
  }];

  animationAppear.setKeys(keys);
  return animationAppear
};

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.pawns = [];
    this.troll = 0;
  }

  render() {
    this.pawns.forEach(pawn => {
      pawn.dispose();
    });
    this.props.pawns.forEach(pawn => {
      this.addPawn(pawn.x, pawn.y);
    });
    return (
        <canvas id="renderCanvas"></canvas>
    )
  }

  addPawn(x, y) {
    const pawn = new Mesh.CreateCylinder(`pawn_${x}_${y}`, 0.6, this.widthCaseGame * 0.8, this.widthCaseGame * 0.8, 0, 16, this.scene);
    pawn.position.x = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2) - (this.widthWoodPlank / this.nbCase) * x;
    pawn.position.z = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2) - (this.widthWoodPlank / this.nbCase) * y;
    pawn.position.y = 1.1;

    const wood = new PBRMaterial('wood', this.scene);
    wood.reflectionTexture = this.hdrTexture;
    wood.directIntensity = 0.5;
    wood.environmentIntensity = 0.5;
    wood.specularIntensity = 0.3;
    wood.cameraExposure = 0.9;
    wood.cameraContrast = 1.6;

    wood.reflectivityTexture = new Texture('/textures/reflectivity.png', this.scene);
    wood.useMicroSurfaceFromReflectivityMapAlpha = false;
    wood.albedoColor = Color3.White();

    if (this.troll % 2 === 0) {
      wood.ambientColor = Color3.White();
    } else {
      wood.ambientColor = Color3.Red();
    }
    this.troll += 1;
    wood.albedoTexture = new Texture('/textures/pawn.png', this.scene);
    pawn.material = wood;
    // pawn.animations.push(this.animationAppear.clone());
    // this.scene.beginAnimation(pawn, 0, 60, false, 2);
    this.pawns.push(pawn);
  }

  componentDidMount() {
    const canvas = document.getElementById('renderCanvas');
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    //this.hdrTexture = new HDRCubeTexture('/textures/room.hdr', this.scene, 512);
    this.hdrTexture = new HDRCubeTexture('/textures/room.hdr', this.scene, 64);
    this.nbCase = config.nbCase;
    this.widthCaseGame = 2.5;
    this.widthWoodPlank = 57;
    this.animationAppear = genPawnAppearAnimation();

    const woodPlank = MeshBuilder.CreateBox('plane', {width: 57, height: 1, depth: 57}, this.scene);
    const wood = new PBRMaterial('wood', this.scene);
    wood.reflectionTexture = this.hdrTexture;
    wood.directIntensity = 0.5;
    wood.environmentIntensity = 0.5;
    wood.specularIntensity = 0.3;
    wood.cameraExposure = 0.9;
    wood.cameraContrast = 1.6;
    wood.reflectivityTexture = new Texture('/textures/reflectivity.png', this.scene);
    wood.useMicroSurfaceFromReflectivityMapAlpha = false;
    wood.albedoColor = Color3.White();
    wood.albedoTexture = new Texture('/textures/albedo.png', this.scene);
    woodPlank.material = wood;

    const marble = new PBRMaterial('marble', this.scene);
    marble.reflectivityTexture = this.hdrTexture;
    marble.directIntensity = 0.5;
    marble.environmentIntensity = 0.5;
    marble.specularIntensity = 0.3;
    marble.cameraExposure = 0.9;
    marble.cameraContrast = 1.6;
    marble.alpha = 0.95;
    marble.reflectivityTexture = new Texture('/textures/reflectivity.png', this.scene);
    marble.useMicroSurfaceFromReflectivityMapAlpha = true;
    marble.albedoColor = Color3.White();
    marble.albedoTexture = new Texture('/textures/marble.jpg', this.scene);

    const caseGame = MeshBuilder.CreateBox('plane', {width: 2.2, height: 1, depth: 2.2}, this.scene);
    caseGame.material = marble;
    caseGame.position.y = 0.3;
    caseGame.position.x = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2);
    caseGame.position.z = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2);
    for (let i = 0; i < this.nbCase; i++) {
      for (let j = 0; j < this.nbCase; j++) {
        const clone = caseGame.clone(`caseGame_${j}_${i}`);
        clone.position.x = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2) - (this.widthWoodPlank / this.nbCase) * j;
        clone.position.z = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2) - (this.widthWoodPlank / this.nbCase) * i;
      }
    }
    caseGame.dispose();

    const camera = new ArcRotateCamera('Camera', -Math.PI / 4, Math.PI / 2.5, 200, Vector3.Zero(), this.scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    camera.lowerRadiusLimit = 8;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.scene.onPointerDown = (evt, hitResult) => {
      if (hitResult.hit && hitResult.pickedMesh) {
        const string = hitResult.pickedMesh.name.split('_');
        if (string[0] === 'caseGame') {
          console.log('Hit case : ', parseInt(string[1], 10), '/', parseInt(string[2], 10));
          this.addPawn(parseInt(string[1], 10), parseInt(string[2], 10));
        }
      }
    };

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
}

export default Game;
