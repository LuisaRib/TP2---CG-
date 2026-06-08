import { makeTransform, applyTransform, forwardFromYaw, distanceXZ, clamp, approach } from './utils.js';

export class Zeppelin {
    constructor(geometries, materials, startPosition) {
        this.g = geometries;
        this.m = materials;

        this.position = startPosition.slice();
        this.yaw = Math.PI;
        this.propellerAngle = 0;

        this.cruiseHeight = startPosition[1];
        this.landedHeight = 2.15;
        this.state = 'flying';
        this.landingTarget = null;
    }

    update(dt, input) {
        this.propellerAngle += dt * 12.0;

        if (this.state === 'flying') {
            this.updateMovement(dt, input);
        } else if (this.state === 'landing') {
            this.updateLanding(dt);
        } else if (this.state === 'takingOff') {
            this.updateTakeOff(dt);
        }
    }

    updateMovement(dt, input) {
        const turnSpeed = 1.7;
        const moveSpeed = 10.0;

        if (input.isDown('a')) {
            this.yaw += turnSpeed * dt;
        }
        if (input.isDown('d')) {
            this.yaw -= turnSpeed * dt;
        }

        let direction = 0;
        if (input.isDown('w')) {
            direction += 1;
        }
        if (input.isDown('s')) {
            direction -= 1;
        }

        if (direction !== 0) {
            const forward = forwardFromYaw(this.yaw);
            this.position[0] += forward[0] * moveSpeed * direction * dt;
            this.position[2] += forward[2] * moveSpeed * direction * dt;
        }

        this.position[0] = clamp(this.position[0], -52, 52);
        this.position[2] = clamp(this.position[2], -52, 52);
        this.position[1] = this.cruiseHeight;
    }

    updateLanding(dt) {
        if (!this.landingTarget) {
            this.state = 'flying';
            return;
        }

        // A pequena correção em XZ ajuda o zeppelin a ficar bem alinhado com o zeppeliporto.
        this.position[0] = approach(this.position[0], this.landingTarget.x, dt * 2.2);
        this.position[2] = approach(this.position[2], this.landingTarget.z, dt * 2.2);
        this.position[1] = approach(this.position[1], this.landedHeight, dt * 2.5);

        if (Math.abs(this.position[1] - this.landedHeight) < 0.02) {
            this.position[1] = this.landedHeight;
            this.state = 'landed';
        }
    }

    updateTakeOff(dt) {
        this.position[1] = approach(this.position[1], this.cruiseHeight, dt * 2.5);

        if (Math.abs(this.position[1] - this.cruiseHeight) < 0.02) {
            this.position[1] = this.cruiseHeight;
            this.state = 'flying';
            this.landingTarget = null;
        }
    }

    toggleLanding(landingPad) {
        if (this.state === 'flying' && this.isOverLandingPad(landingPad)) {
            this.landingTarget = landingPad;
            this.state = 'landing';
        } else if (this.state === 'landed') {
            this.state = 'takingOff';
        }
    }

    isOverLandingPad(landingPad) {
        return distanceXZ([this.position[0], this.position[2]], [landingPad.x, landingPad.z]) <= landingPad.radius;
    }

    getStatusText(landingPad) {
        const overPad = this.isOverLandingPad(landingPad) ? 'sobre o zeppeliporto' : 'fora do zeppeliporto';
        if (this.state === 'landing') return 'pousando';
        if (this.state === 'landed') return 'pousado - aperte P para decolar';
        if (this.state === 'takingOff') return 'decolando';
        return `voando - ${overPad}`;
    }

    addDrawables(opaqueList, transparentList) {
        const base = makeTransform(this.position, [0, this.yaw, 0]);

        // Corpo principal do zeppelin.
        opaqueList.push({
            bufferInfo: this.g.sphere,
            material: this.m.fabric,
            world: applyTransform(base, [0, 0, 0], [0, 0, 0], [1.25, 1.25, 4.35])
        });

        // Cabine abaixo do corpo.
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.cabin,
            world: applyTransform(base, [0, -1.35, 0.85], [0, 0, 0], [1.25, 0.65, 1.5])
        });

        // Vidros semitransparentes da cabine. Eles entram na lista transparente para serem desenhados no fim.
        transparentList.push({
            bufferInfo: this.g.cube,
            material: this.m.glass,
            world: applyTransform(base, [0.64, -1.34, 0.85], [0, 0, 0], [0.04, 0.36, 0.72])
        });
        transparentList.push({
            bufferInfo: this.g.cube,
            material: this.m.glass,
            world: applyTransform(base, [-0.64, -1.34, 0.85], [0, 0, 0], [0.04, 0.36, 0.72])
        });
        transparentList.push({
            bufferInfo: this.g.cube,
            material: this.m.glass,
            world: applyTransform(base, [0, -1.34, 1.62], [0, 0, 0], [0.72, 0.36, 0.04])
        });

        this.addTailFins(base, opaqueList);
        this.addPropeller(base, opaqueList);
    }

    addTailFins(base, opaqueList) {
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.fabric,
            world: applyTransform(base, [0, 0.96, -3.25], [0, 0, 0], [0.12, 0.85, 1.0])
        });
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.fabric,
            world: applyTransform(base, [0, -0.96, -3.25], [0, 0, 0], [0.12, 0.65, 0.9])
        });
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.fabric,
            world: applyTransform(base, [1.10, 0, -3.25], [0, 0, 0], [0.88, 0.11, 1.0])
        });
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.fabric,
            world: applyTransform(base, [-1.10, 0, -3.25], [0, 0, 0], [0.88, 0.11, 1.0])
        });
    }

    addPropeller(base, opaqueList) {
        opaqueList.push({
            bufferInfo: this.g.cylinder,
            material: this.m.darkMetal,
            world: applyTransform(base, [0, 0, -4.45], [Math.PI / 2, 0, 0], [0.13, 0.62, 0.13])
        });
        opaqueList.push({
            bufferInfo: this.g.sphere,
            material: this.m.metal,
            world: applyTransform(base, [0, 0, -4.78], [0, 0, 0], [0.25, 0.25, 0.25])
        });

        const propellerBase = applyTransform(base, [0, 0, -4.95], [0, 0, this.propellerAngle], [1, 1, 1]);
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.metal,
            world: applyTransform(propellerBase, [0, 0, 0], [0, 0, 0], [0.16, 1.25, 0.07])
        });
        opaqueList.push({
            bufferInfo: this.g.cube,
            material: this.m.metal,
            world: applyTransform(propellerBase, [0, 0, 0], [0, 0, Math.PI / 2], [0.16, 1.25, 0.07])
        });
    }
}
