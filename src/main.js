import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { createGeometries, createMaterials, drawDrawable } from './objects.js';
import { CameraController } from './camera.js';
import { createInput } from './input.js';
import { World } from './world.js';
import { Zeppelin } from './zeppelin.js';
import { getWorldPosition, normalize3 } from './utils.js';

const canvas = document.querySelector('#canvas');
const gl = canvas.getContext('webgl', { alpha: false });

if (!gl) {
    document.body.innerHTML = '<p>Este navegador nao conseguiu inicializar WebGL.</p>';
    throw new Error('WebGL nao disponivel');
}

const programInfo = window.twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);
const geometries = createGeometries(gl);
const materials = createMaterials(gl);
const world = new World(geometries, materials);
const zeppelin = new Zeppelin(geometries, materials, [world.landingPad.x, 9.0, world.landingPad.z]);
const cameraController = new CameraController();
const input = createInput();

let lightingOn = true;
let fogOn = false;
let lastTime = 0;

const statusElement = document.querySelector('#status');

requestAnimationFrame(render);

function render(timeMs) {
    const time = timeMs * 0.001;
    const dt = Math.min(time - lastTime || 0.016, 0.05);
    lastTime = time;

    handleControls();
    zeppelin.update(dt, input);

    window.twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const camera = cameraController.getCamera(zeppelin, canvas);
    const fogColor = [0.72, 0.78, 0.83];

    const commonUniforms = {
        u_viewProjection: camera.viewProjection,
        u_viewPosition: camera.position,
        u_lightDirection: normalize3([0.45, -1.0, 0.35]),
        u_lightColor: [1.0, 0.96, 0.86],
        u_ambientColor: [0.25, 0.27, 0.3],
        u_enableLighting: lightingOn ? 1 : 0,
        u_enableFog: fogOn ? 1 : 0,
        u_fogColor: fogColor,
        u_fogNear: 44,
        u_fogFar: 116
    };

    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);

    drawSkybox(camera, commonUniforms);

    const opaqueDrawables = [];
    const transparentDrawables = [];
    world.addDrawables(opaqueDrawables, transparentDrawables);
    zeppelin.addDrawables(opaqueDrawables, transparentDrawables);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    opaqueDrawables.forEach(drawable => {
        drawDrawable(gl, programInfo, drawable, commonUniforms);
    });

    transparentDrawables.sort((a, b) => distanceToCamera(b, camera.position) - distanceToCamera(a, camera.position));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    transparentDrawables.forEach(drawable => {
        drawDrawable(gl, programInfo, drawable, commonUniforms);
    });

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    updateStatus(camera);
    input.endFrame();
    requestAnimationFrame(render);
}

function handleControls() {
    if (input.wasPressed('1')) {
        cameraController.setMode('top');
    }
    if (input.wasPressed('2')) {
        cameraController.setMode('side');
    }
    if (input.wasPressed('c')) {
        cameraController.nextSide();
        cameraController.setMode('side');
    }
    if (input.wasPressed('l')) {
        lightingOn = !lightingOn;
    }
    if (input.wasPressed('n')) {
        fogOn = !fogOn;
    }
    if (input.wasPressed('p')) {
        zeppelin.toggleLanding(world.landingPad);
    }
}

function drawSkybox(camera, commonUniforms) {
    const skyDrawable = world.getSkyDrawable(camera.position);

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    drawDrawable(gl, programInfo, skyDrawable, {
        ...commonUniforms,
        u_enableLighting: 0,
        u_enableFog: 0
    });
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
}

function distanceToCamera(drawable, cameraPosition) {
    const p = getWorldPosition(drawable.world);
    const dx = p[0] - cameraPosition[0];
    const dy = p[1] - cameraPosition[1];
    const dz = p[2] - cameraPosition[2];
    return dx * dx + dy * dy + dz * dz;
}

function updateStatus(camera) {
    if (!statusElement) return;

    const cameraName = camera.mode === 'top' ? 'superior' : `lateral (${camera.side})`;
    const lightText = lightingOn ? 'Phong ligado' : 'Phong desligado';
    const fogText = fogOn ? 'neblina ligada' : 'neblina desligada';
    statusElement.textContent = `Camera: ${cameraName} | ${lightText} | ${fogText} | Zeppelin: ${zeppelin.getStatusText(world.landingPad)}`;
}
