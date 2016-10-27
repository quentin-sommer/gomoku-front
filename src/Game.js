import React from 'react';
import {
    Engine,
    Scene,
    Texture,
    MeshBuilder,
    HDRCubeTexture,
    Animation,
    PBRMaterial,
    StandardMaterial,
    Mesh,
    Color3,
    Vector3,
    ArcRotateCamera,
    HemisphericLight,
    Observable
} from 'babylonjs';
import forEach from 'lodash/forEach';
import config from './config';
import { toCoord, toIdx } from './lib/Map';

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

    this.visualPawns = [];
  }

  componentWillReceiveProps(nextProps) {
    forEach(this.visualPawns, pawn => {
      pawn.dispose();
    });
    this.visualPawns = [];
  }

  render() {
    forEach(this.props.map, (cell, index) => {
      if (!cell.empty) {
        // optimizing cpu using bitshift
        const coords = toCoord(index);
        this.addPawnToBoard(coords.x, coords.y);
      }
    });
    return (
        <canvas id="renderCanvas"></canvas>
    )
  }

  playPawn(x, y) {
    const idx = toIdx(x, y);
    const cell = this.props.map[idx];

    if (cell.empty && cell.playable) {
      this.addPawnToBoard(x, y);
      this.props.onPawnPlayed(idx);
    }
  }

  addPawnToBoard(x, y) {
    const pawn = new Mesh.CreateCylinder(`pawn_${x}_${y}`, 0.6, this.widthCaseGame * 0.8, this.widthCaseGame * 0.8, 0, 16, this.scene);
    pawn.position.x = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (x + 0.5);
    pawn.position.z = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (y + 0.5);
    pawn.position.y = 1.1;

    if (this.testModuloPawn % 2 === 0) {
      pawn.material = this.blackPawnMaterial;
    } else {
      pawn.material = this.whitePawnMaterial;
    }
    this.testModuloPawn += 1;
    // pawn.animations.push(this.animationAppear.clone());
    // this.scene.beginAnimation(pawn, 0, 60, false, 2);
    this.visualPawns.push(pawn);
  }

  componentDidMount() {
    const canvas = document.getElementById('renderCanvas');
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    //this.hdrTexture = new HDRCubeTexture('/textures/room.hdr', this.scene, 512);
    this.hdrTexture = new HDRCubeTexture('/textures/room.hdr', this.scene, 64);
    this.nbCase = config.nbCase;
    this.widthCaseGame = 2.6;
    this.widthBoardGame = 60;
    this.widthGrid = 57;
    this.animationAppear = genPawnAppearAnimation();
    this.reflectivityTexture = new Texture('/textures/reflectivity.png', this.scene);
    this.pawnTexture = new Texture('/textures/pawn.png', this.scene);
    this.initWoodMaterial();
    this.whitePawnTexture = new Texture('/textures/whitePawn.jpg', this.scene);
    this.blackPawnTexture = new Texture('/textures/blackPawn.jpg', this.scene);
    this.initPawnMaterial();

    this.testModuloPawn = 0;

    this.hitBox = MeshBuilder.CreateBox('hitbox', {width: this.widthGrid, height: 1, depth: this.widthGrid}, this.scene);
    this.hitBox.position.y = 1;
    this.hitBox.material = new StandardMaterial('hitbox', this.scene);
    this.hitBox.material.alpha = 0;

    const marble = new PBRMaterial('marble', this.scene);
    //marble.reflectivityTexture = this.hdrTexture;
    marble.directIntensity = 0.5;
    marble.environmentIntensity = 0.5;
    marble.specularIntensity = 0.3;
    marble.cameraExposure = 0.9;
    marble.cameraContrast = 1.6;
    marble.alpha = 0.95;
    marble.reflectivityTexture = this.reflectivityTexture;
    marble.useMicroSurfaceFromReflectivityMapAlpha = true;
    marble.albedoColor = Color3.White();
    marble.albedoTexture = new Texture('/textures/boardGame.jpg', this.scene);

    const woodPlank = MeshBuilder.CreateBox('plane', {width: this.widthBoardGame, height: 1, depth: this.widthBoardGame}, this.scene);
    const wood = new PBRMaterial('wood', this.scene);
    wood.reflectionTexture = this.hdrTexture;
    wood.directIntensity = 0.5;
    wood.environmentIntensity = 0.5;
    wood.specularIntensity = 0.3;
    wood.cameraExposure = 0.9;
    wood.cameraContrast = 1.6;
    wood.reflectivityTexture = this.reflectivityTexture;
    wood.useMicroSurfaceFromReflectivityMapAlpha = false;
    wood.albedoColor = Color3.White();
    wood.albedoTexture = new Texture('/textures/albedo.png', this.scene);
    woodPlank.material = marble;

    const marblePlank = MeshBuilder.CreateBox('marblePlank', {width: this.widthGrid - 2.5, height: 1, depth: this.widthGrid - 2.5}, this.scene);
    marblePlank.material = wood;
    marblePlank.position.y = 0.25;

    const caseGame = MeshBuilder.CreateBox('plane', {width: this.widthCaseGame, height: 1, depth: this.widthCaseGame}, this.scene);
    caseGame.material = marble;
    caseGame.position.y = 0.3;
    caseGame.position.x = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2);
    caseGame.position.z = (this.widthWoodPlank / 2) - (this.widthWoodPlank / this.nbCase / 2);
    for (let i = 0; i < this.nbCase - 1; i++) {
      for (let j = 0; j < this.nbCase - 1; j++) {
        const clone = caseGame.clone(`caseGame_${j}_${i}`);
        clone.position.x = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (j + 1);
        clone.position.z = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (i + 1);
      }
    }
    caseGame.dispose();

    this.ghostPawn = Mesh.CreateSphere('ghost', 32, 1, this.scene);
    this.ghostPawn.position.x = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * 0;
    this.ghostPawn.position.z = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * 0;
    this.ghostPawn.position.y = 1.5;
    this.ghostPawn.material = new StandardMaterial('ghost', this.scene);
    this.ghostPawn.material.alpha = 0.6;
    this.ghostPawn.material.ambientColor = Color3.Red();

    const camera = new ArcRotateCamera('Camera', -Math.PI / 4, Math.PI / 2.5, 200, Vector3.Zero(), this.scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    camera.lowerRadiusLimit = 8;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    if (!this.scene.onPointerObservable) {
      this.scene.onPointerObservable = new Observable();
    }

    this.scene.onPointerObservable.add((ptrInfo) => {
      //console.log(ptrInfo.event);
      const hitResult = this.scene.pick(ptrInfo.event.offsetX, ptrInfo.event.offsetY, (mesh) => {return (mesh === this.hitBox)});
      if (hitResult.hit && hitResult.pickedMesh && hitResult.pickedMesh.name === 'hitbox') {
        const x = ((hitResult.pickedPoint.x + this.widthGrid / 2) / (this.widthGrid / this.nbCase)) | 0;
        const z = ((hitResult.pickedPoint.z + this.widthGrid / 2) / (this.widthGrid / this.nbCase)) | 0;
        this.ghostPawn.position.x = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (x + 0.5);
        this.ghostPawn.position.z = - (this.widthGrid / 2) + (this.widthGrid / this.nbCase) * (z + 0.5);
        //console.log(hitResult);
      }
    }, 0x04);

    this.scene.onPointerDown = (evt, hitResult) => {
      if (hitResult.hit && hitResult.pickedMesh) {
        if (hitResult.pickedMesh.name === 'hitbox') {
          const x = ((hitResult.pickedPoint.x + this.widthGrid / 2) / (this.widthGrid / this.nbCase)) | 0;
          const z = ((hitResult.pickedPoint.z + this.widthGrid / 2) / (this.widthGrid / this.nbCase)) | 0;
          console.log('Hit case : ', x, '/', z);
          this.playPawn(x, z);
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

  initWoodMaterial() {
    this.woodMaterial = new PBRMaterial('wood', this.scene);
    this.woodMaterial.reflectionTexture = this.hdrTexture;
    this.woodMaterial.directIntensity = 0.5;
    this.woodMaterial.environmentIntensity = 0.5;
    this.woodMaterial.specularIntensity = 0.3;
    this.woodMaterial.cameraExposure = 0.9;
    this.woodMaterial.cameraContrast = 1.6;

    this.woodMaterial.reflectivityTexture = this.reflectivityTexture;
    this.woodMaterial.useMicroSurfaceFromReflectivityMapAlpha = false;
    this.woodMaterial.albedoColor = Color3.White();
    this.woodMaterial.albedoTexture = this.pawnTexture;
    this.woodMaterial.ambientColor = Color3.White();
  }

  initPawnMaterial() {
    this.whitePawnMaterial = new PBRMaterial('whitePawnMaterial', this.scene);
    this.whitePawnMaterial.reflectionTexture = this.hdrTexture;
    this.whitePawnMaterial.directIntensity = 0.5;
    this.whitePawnMaterial.environmentIntensity = 0.5;
    this.whitePawnMaterial.specularIntensity = 0.3;
    this.whitePawnMaterial.cameraExposure = 0.9;
    this.whitePawnMaterial.cameraContrast = 1.6;

    this.whitePawnMaterial.reflectivityTexture = this.reflectivityTexture;
    this.whitePawnMaterial.useMicroSurfaceFromReflectivityMapAlpha = false;
    this.whitePawnMaterial.albedoColor = Color3.White();
    this.whitePawnMaterial.albedoTexture = this.whitePawnTexture;
    this.whitePawnMaterial.ambientColor = Color3.White();

    this.blackPawnMaterial = new PBRMaterial('blackPawnMaterial', this.scene);
    this.blackPawnMaterial.reflectionTexture = this.hdrTexture;
    this.blackPawnMaterial.directIntensity = 0.5;
    this.blackPawnMaterial.environmentIntensity = 0.5;
    this.blackPawnMaterial.specularIntensity = 0.3;
    this.blackPawnMaterial.cameraExposure = 0.9;
    this.blackPawnMaterial.cameraContrast = 1.6;

    this.blackPawnMaterial.reflectivityTexture = this.reflectivityTexture;
    this.blackPawnMaterial.useMicroSurfaceFromReflectivityMapAlpha = false;
    this.blackPawnMaterial.albedoColor = Color3.White();
    this.blackPawnMaterial.albedoTexture = this.blackPawnTexture;
    this.blackPawnMaterial.ambientColor = Color3.White();
  }
}

export default Game;
