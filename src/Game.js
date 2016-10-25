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

class Game extends React.Component {
  componentDidMount() {
    babylonInit();
  }

  render() {
    return (
        <canvas id="renderCanvas"></canvas>
    )
  }
}

function babylonInit() {
  const canvas = document.getElementById('renderCanvas');
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const hdrTexture = new HDRCubeTexture('/public/textures/room.hdr', scene, 512);
  const nbCase = 19;
  const widthCaseGame = 2.5;
  const widthWoodPlank = 57;

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

  const woodPlank = MeshBuilder.CreateBox('plane', {width: 57, height: 1, depth: 57}, scene);
  const wood = new PBRMaterial('wood', scene);
  wood.reflectionTexture = hdrTexture;
  wood.directIntensity = 0.5;
  wood.environmentIntensity = 0.5;
  wood.specularIntensity = 0.3;
  wood.cameraExposure = 0.9;
  wood.cameraContrast = 1.6;

  wood.reflectivityTexture = new Texture('/public/textures/reflectivity.png', scene);
  wood.useMicroSurfaceFromReflectivityMapAlpha = false;

  wood.albedoColor = Color3.White();
  wood.albedoTexture = new Texture('/public/textures/albedo.png', scene);
  woodPlank.material = wood;

  const marble = new PBRMaterial('marble', scene);
  marble.reflectivityTexture = hdrTexture;
  marble.directIntensity = 0.5;
  marble.environmentIntensity = 0.5;
  marble.specularIntensity = 0.3;
  marble.cameraExposure = 0.9;
  marble.cameraContrast = 1.6;
  marble.alpha = 0.8;
  marble.reflectivityTexture = new Texture('/public/textures/reflectivity.png', scene);

  marble.useMicroSurfaceFromReflectivityMapAlpha = true;
  marble.albedoColor = Color3.White();

  marble.albedoTexture = new Texture('/public/textures/marble.jpg', scene);

  const caseGame = MeshBuilder.CreateBox('plane', {width: 2.2, height: 1, depth: 2.2}, scene);
  caseGame.material = marble;

  caseGame.position.y = 0.3;
  caseGame.position.x = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2);
  caseGame.position.z = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2);
  for (let i = 0; i < nbCase; i++) {
    for (let j = 0; j < nbCase; j++) {
      const clone = caseGame.clone('caseGame_' + j + '_' + i);
      clone.position.x = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2) - (widthWoodPlank / nbCase) * j;
      clone.position.z = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2) - (widthWoodPlank / nbCase) * i;
    }
  }
  caseGame.dispose();

  let troll = 0;

  // TODO : extract
  const addPawn = (x, y) => {
    const pawn = new Mesh.CreateCylinder('pawn_' + x + '_' + y, 0.6, widthCaseGame * 0.8, widthCaseGame * 0.8, 0, 16, scene);
    pawn.position.x = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2) - (widthWoodPlank / nbCase) * x;
    pawn.position.z = (widthWoodPlank / 2) - (widthWoodPlank / nbCase / 2) - (widthWoodPlank / nbCase) * y;
    pawn.position.y = 1.1;

    const wood = new PBRMaterial('wood', scene);
    wood.reflectionTexture = hdrTexture;
    wood.directIntensity = 0.5;
    wood.environmentIntensity = 0.5;
    wood.specularIntensity = 0.3;
    wood.cameraExposure = 0.9;
    wood.cameraContrast = 1.6;

    wood.reflectivityTexture = new Texture('/public/textures/reflectivity.png', scene);
    wood.useMicroSurfaceFromReflectivityMapAlpha = false;
    wood.albedoColor = Color3.White();

    if (troll % 2 === 0) {
      wood.ambientColor = Color3.White();
    } else {
      wood.ambientColor = Color3.Red();
    }
    troll += 1;
    wood.albedoTexture = new Texture('/public/textures/pawn.png', scene);
    pawn.material = wood;
    pawn.animations.push(animationAppear.clone());
    scene.beginAnimation(pawn, 0, 60, false, 2);
  };

  const camera = new ArcRotateCamera('Camera', -Math.PI / 4, Math.PI / 2.5, 200, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;
  camera.lowerRadiusLimit = 8;

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  scene.onPointerDown = (evt, hitResult) => {
    if (hitResult.hit && hitResult.pickedMesh) {
      const string = hitResult.pickedMesh.name.split('_');
      if (string[0] === 'caseGame') {
        console.log('Hit case : ', parseInt(string[1], 10), '/', parseInt(string[2], 10));
        addPawn(parseInt(string[1], 10), parseInt(string[2], 10));
      }
    }
  };

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
}

export default Game;
