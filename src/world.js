import { makeTransform, applyTransform } from './utils.js';

export class World {
    constructor(geometries, materials) {
        this.g = geometries;
        this.m = materials;
        this.opaque = [];
        this.transparent = [];
        this.landingPad = { x: 18, z: -18, radius: 7 };

        this.build();
    }

    build() {
        this.add(this.g.ground, this.m.grass, [0, 0, 0]);

        this.add(this.g.roadLong, this.m.road, [0, 0.025, 0]);
        this.add(this.g.roadCross, this.m.road, [0, 0.03, 4]);
        this.add(this.g.roadSmall, this.m.road, [-24, 0.035, 8]);
        this.add(this.g.roadSmall, this.m.road, [24, 0.035, 8]);
        this.add(this.g.roadSmall, this.m.road, [-16, 0.04, -24], [0, Math.PI / 2, 0]);

        this.addLandingPad();
        this.addHouses();
        this.addTrees();
        this.addPosts();
        this.addTowers();
        this.addBenchesAndBoxes();
        this.addFences();
    }

    add(bufferInfo, material, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
        this.push(bufferInfo, material, makeTransform(position, rotation, scale));
    }

    push(bufferInfo, material, worldMatrix) {
        const item = { bufferInfo, material, world: worldMatrix };
        if (material.transparent) {
            this.transparent.push(item);
        } else {
            this.opaque.push(item);
        }
    }

    addHouses() {
        const houses = [
            [-18, -31, 1.00, 0.00],
            [-30, -22, 0.95, 0.18],
            [-17, -9, 1.10, -0.08],
            [-33, 11, 1.00, 0.06],
            [-22, 24, 0.95, -0.15],
            [-9, 27, 1.05, 0.10],
            [11, 24, 0.90, -0.04],
            [28, 18, 1.10, 0.12],
            [35, 2, 0.95, -0.20],
            [31, -9, 1.00, 0.07],
            [-8, -37, 0.90, -0.06],
            [9, 35, 1.00, 0.14]
        ];

        houses.forEach((h, index) => this.addHouse(h[0], h[1], h[2], h[3], index));
    }

    addHouse(x, z, size, rotation, index) {
        const base = makeTransform([x, 0, z], [0, rotation, 0]);
        const width = 2.8 * size;
        const height = 2.0 * size;
        const depth = 2.5 * size;

        this.push(this.g.cube, this.m.wall, applyTransform(base, [0, height / 2, 0], [0, 0, 0], [width, height, depth]));
        this.push(this.g.roof, this.m.roof, applyTransform(base, [0, height, 0], [0, 0, 0], [width / 2 + 0.18, 0.75 * size, depth / 2 + 0.18]));

        this.push(this.g.cube, this.m.wood, applyTransform(base, [0, 0.58 * size, depth / 2 + 0.035], [0, 0, 0], [0.52 * size, 1.05 * size, 0.06]));
        this.push(this.g.cube, this.m.windowPaint, applyTransform(base, [-0.78 * size, 1.2 * size, depth / 2 + 0.04], [0, 0, 0], [0.46 * size, 0.46 * size, 0.055]));
        this.push(this.g.cube, this.m.windowPaint, applyTransform(base, [0.78 * size, 1.2 * size, depth / 2 + 0.04], [0, 0, 0], [0.46 * size, 0.46 * size, 0.055]));

        if (index % 2 === 0) {
            this.push(this.g.cube, this.m.windowPaint, applyTransform(base, [-width / 2 - 0.035, 1.1 * size, 0], [0, 0, 0], [0.055, 0.48 * size, 0.72 * size]));
        }
    }

    addTrees() {
        const trees = [
            [-43, -40, 1.0], [-39, -29, 0.9], [-44, -13, 1.1], [-41, 4, 1.0],
            [-45, 22, 1.2], [-38, 38, 0.9], [-27, 39, 1.0], [-5, 42, 1.1],
            [17, 42, 1.0], [42, 37, 1.1], [45, 18, 0.9], [44, -4, 1.0],
            [41, -31, 1.2], [30, -42, 0.9], [10, -43, 1.0], [-13, -43, 1.1],
            [-31, -42, 0.9], [13, -4, 0.85], [20, 6, 0.8], [-13, 12, 0.85],
            [-27, 3, 0.75], [32, 28, 0.8], [5, -30, 0.75]
        ];

        trees.forEach(t => this.addTree(t[0], t[1], t[2]));
    }

    addTree(x, z, size) {
        const trunkHeight = 1.6 * size;
        const trunkRadius = 0.16 * size;
        this.add(this.g.cylinder, this.m.bark, [x, trunkHeight / 2, z], [0, 0, 0], [trunkRadius, trunkHeight, trunkRadius]);
        this.add(this.g.sphere, this.m.leaves, [x, trunkHeight + 0.8 * size, z], [0, 0, 0], [0.9 * size, 0.9 * size, 0.9 * size]);
        this.add(this.g.sphere, this.m.leaves, [x + 0.35 * size, trunkHeight + 0.45 * size, z - 0.15 * size], [0, 0, 0], [0.62 * size, 0.62 * size, 0.62 * size]);
    }

    addPosts() {
        for (let z = -48; z <= 50; z += 12) {
            this.addPost(-5.4, z);
            this.addPost(5.4, z);
        }

        for (let x = -48; x <= 50; x += 12) {
            if (Math.abs(x) > 8) {
                this.addPost(x, 9.4);
                this.addPost(x, -1.4);
            }
        }
    }

    addPost(x, z) {
        const height = 3.0;
        this.add(this.g.cylinder, this.m.darkMetal, [x, height / 2, z], [0, 0, 0], [0.08, height, 0.08]);
        this.add(this.g.sphere, this.m.yellow, [x, height + 0.18, z], [0, 0, 0], [0.26, 0.26, 0.26]);
    }

    addTowers() {
        this.addTower(-46, -31, 0.95);
        this.addTower(43, 31, 1.05);
    }

    addTower(x, z, size) {
        const height = 6.2 * size;
        this.add(this.g.cylinder, this.m.stone, [x, height / 2, z], [0, 0, 0], [1.0 * size, height, 1.0 * size]);
        this.add(this.g.roof, this.m.roof, [x, height, z], [0, Math.PI / 4, 0], [1.25 * size, 0.9 * size, 1.25 * size]);
        this.add(this.g.cube, this.m.windowPaint, [x, height * 0.55, z + 1.02 * size], [0, 0, 0], [0.42 * size, 0.85 * size, 0.06]);
        this.add(this.g.cube, this.m.windowPaint, [x, height * 0.78, z + 1.02 * size], [0, 0, 0], [0.36 * size, 0.65 * size, 0.06]);
    }

    addBenchesAndBoxes() {
        this.addBench(12, -6, 0);
        this.addBench(18, -6, Math.PI);
        this.addBench(26, -28, Math.PI / 2);
        this.addBench(-12, 15, -Math.PI / 2);

        this.addBox(-35, -5, 1.0, 0.2);
        this.addBox(-37, -2, 0.8, -0.2);
        this.addBox(35, -24, 1.0, 0.1);
        this.addBox(32, -26, 0.75, 0.4);
    }

    addBench(x, z, rotation) {
        const base = makeTransform([x, 0, z], [0, rotation, 0]);
        this.push(this.g.cube, this.m.wood, applyTransform(base, [0, 0.55, 0], [0, 0, 0], [2.1, 0.18, 0.62]));
        this.push(this.g.cube, this.m.wood, applyTransform(base, [0, 1.0, -0.28], [0.2, 0, 0], [2.1, 0.18, 0.18]));
        this.push(this.g.cube, this.m.darkMetal, applyTransform(base, [-0.8, 0.27, -0.18], [0, 0, 0], [0.12, 0.55, 0.12]));
        this.push(this.g.cube, this.m.darkMetal, applyTransform(base, [0.8, 0.27, -0.18], [0, 0, 0], [0.12, 0.55, 0.12]));
        this.push(this.g.cube, this.m.darkMetal, applyTransform(base, [-0.8, 0.27, 0.2], [0, 0, 0], [0.12, 0.55, 0.12]));
        this.push(this.g.cube, this.m.darkMetal, applyTransform(base, [0.8, 0.27, 0.2], [0, 0, 0], [0.12, 0.55, 0.12]));
    }

    addBox(x, z, size, rotation) {
        this.add(this.g.cube, this.m.wood, [x, 0.45 * size, z], [0, rotation, 0], [1.15 * size, 0.9 * size, 1.0 * size]);
    }

    addFences() {
        const x = this.landingPad.x;
        const z = this.landingPad.z;
        this.addFenceLine(x, z - 8.4, 17, 0);
        this.addFenceLine(x, z + 8.4, 17, 0);
        this.addFenceLine(x - 8.4, z, 17, Math.PI / 2);
        this.addFenceLine(x + 8.4, z, 17, Math.PI / 2);

        this.addFenceLine(-28, 29, 13, 0.08);
        this.addFenceLine(-34, -28, 12, Math.PI / 2);
        this.addFenceLine(32, 23, 11, -0.2);
    }

    addFenceLine(x, z, length, rotation) {
        const base = makeTransform([x, 0, z], [0, rotation, 0]);
        const postCount = Math.floor(length / 2) + 1;
        const start = -length / 2;

        for (let i = 0; i < postCount; i++) {
            const localX = start + i * 2;
            this.push(this.g.cube, this.m.wood, applyTransform(base, [localX, 0.55, 0], [0, 0, 0], [0.16, 1.1, 0.16]));
        }

        this.push(this.g.cube, this.m.wood, applyTransform(base, [0, 0.78, 0], [0, 0, 0], [length, 0.12, 0.12]));
        this.push(this.g.cube, this.m.wood, applyTransform(base, [0, 0.42, 0], [0, 0, 0], [length, 0.10, 0.10]));
    }

    addLandingPad() {
        const x = this.landingPad.x;
        const z = this.landingPad.z;
        const r = this.landingPad.radius;

        this.add(this.g.landingPad, this.m.landing, [x, 0.065, z], [0, 0, 0], [r, 1, r]);
        this.add(this.g.cube, this.m.yellow, [x - 1.25, 0.14, z], [0, 0, 0], [0.35, 0.08, 3.8]);
        this.add(this.g.cube, this.m.yellow, [x + 1.25, 0.14, z], [0, 0, 0], [0.35, 0.08, 3.8]);
        this.add(this.g.cube, this.m.yellow, [x, 0.145, z], [0, 0, 0], [2.5, 0.08, 0.35]);
    }

    getSkyDrawable(cameraPosition) {
        return {
            bufferInfo: this.g.cube,
            material: this.m.sky,
            world: makeTransform(cameraPosition, [0, 0, 0], [420, 420, 420])
        };
    }

    addDrawables(opaqueList, transparentList) {
        opaqueList.push(...this.opaque);
        transparentList.push(...this.transparent);
    }
}
