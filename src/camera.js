import { forwardFromYaw, rightFromYaw } from './utils.js';

export class CameraController {
    constructor() {
        this.mode = 'top';
        this.sideIndex = 1;
        this.sides = ['frente', 'tras', 'direita', 'esquerda'];
    }

    setMode(mode) {
        this.mode = mode;
    }

    nextSide() {
        this.sideIndex = (this.sideIndex + 1) % this.sides.length;
    }

    getCurrentSideName() {
        return this.sides[this.sideIndex];
    }

    getCamera(zeppelin, canvas) {
        const m4 = window.twgl.m4;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projection = m4.perspective(60 * Math.PI / 180, aspect, 0.1, 500);

        let eye;
        let target;
        let up = [0, 1, 0];
        const zpos = zeppelin.position;

        if (this.mode === 'top') {
            eye = [zpos[0], zpos[1] + 64, zpos[2] + 0.01];
            target = [zpos[0], zpos[1], zpos[2]];
            up = [0, 0, -1];
        } else {
            const distance = 13;
            const height = 5.2;
            const forward = forwardFromYaw(zeppelin.yaw);
            const right = rightFromYaw(zeppelin.yaw);
            const side = this.sides[this.sideIndex];

            if (side === 'frente') {
                eye = [zpos[0] + forward[0] * distance, zpos[1] + height, zpos[2] + forward[2] * distance];
            } else if (side === 'tras') {
                eye = [zpos[0] - forward[0] * distance, zpos[1] + height, zpos[2] - forward[2] * distance];
            } else if (side === 'direita') {
                eye = [zpos[0] + right[0] * distance, zpos[1] + height, zpos[2] + right[2] * distance];
            } else {
                eye = [zpos[0] - right[0] * distance, zpos[1] + height, zpos[2] - right[2] * distance];
            }

            target = [zpos[0], zpos[1] - 0.55, zpos[2]];
        }

        const cameraMatrix = m4.lookAt(eye, target, up);
        const view = m4.inverse(cameraMatrix);
        const viewProjection = m4.multiply(projection, view);

        return {
            position: eye,
            view,
            projection,
            viewProjection,
            mode: this.mode,
            side: this.getCurrentSideName()
        };
    }
}
