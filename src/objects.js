export function createGeometries(gl) {
    const primitives = window.twgl.primitives;

    return {
        cube: primitives.createCubeBufferInfo(gl, 1),
        sphere: primitives.createSphereBufferInfo(gl, 1, 32, 16),
        cylinder: primitives.createCylinderBufferInfo(gl, 1, 1, 32, 1, true, true),
        ground: createPlaneBufferInfo(gl, 120, 120, 30, 30),
        roadLong: createPlaneBufferInfo(gl, 8, 112, 2, 24),
        roadCross: createPlaneBufferInfo(gl, 112, 8, 24, 2),
        roadSmall: createPlaneBufferInfo(gl, 4, 50, 1, 12),
        landingPad: primitives.createCylinderBufferInfo(gl, 1, 0.08, 64, 1, true, true),
        roof: createRoofBufferInfo(gl)
    };
}

export function createMaterials(gl) {
    const whiteTexture = window.twgl.createTexture(gl, { src: [255, 255, 255, 255] });

    function texture(path, repeat = true) {
        return window.twgl.createTexture(gl, {
            src: path,
            wrapS: repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE,
            wrapT: repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE,
            min: gl.LINEAR_MIPMAP_LINEAR,
            mag: gl.LINEAR
        });
    }

    function material(options) {
        return {
            texture: options.texture || whiteTexture,
            color: options.color || [1, 1, 1, 1],
            useTexture: options.useTexture ? 1 : 0,
            alpha: options.alpha === undefined ? 1 : options.alpha,
            shininess: options.shininess === undefined ? 24 : options.shininess,
            specularStrength: options.specularStrength === undefined ? 0.25 : options.specularStrength,
            transparent: options.transparent || false,
            noLighting: options.noLighting || false,
            noFog: options.noFog || false
        };
    }

    return {
        grass: material({ texture: texture('assets/textures/grass.png'), useTexture: true, shininess: 8, specularStrength: 0.04 }),
        road: material({ texture: texture('assets/textures/road.png'), useTexture: true, shininess: 10, specularStrength: 0.06 }),
        wall: material({ texture: texture('assets/textures/wall.png'), useTexture: true, shininess: 12, specularStrength: 0.08 }),
        roof: material({ texture: texture('assets/textures/roof.png'), useTexture: true, shininess: 18, specularStrength: 0.1 }),
        wood: material({ texture: texture('assets/textures/wood.png'), useTexture: true, shininess: 12, specularStrength: 0.08 }),
        bark: material({ texture: texture('assets/textures/bark.png'), useTexture: true, shininess: 10, specularStrength: 0.04 }),
        leaves: material({ texture: texture('assets/textures/leaves.png'), useTexture: true, shininess: 8, specularStrength: 0.03 }),
        fabric: material({ texture: texture('assets/textures/fabric.png'), useTexture: true, shininess: 20, specularStrength: 0.12 }),
        metal: material({ texture: texture('assets/textures/metal.png'), useTexture: true, shininess: 52, specularStrength: 0.45 }),
        stone: material({ texture: texture('assets/textures/stone.png'), useTexture: true, shininess: 16, specularStrength: 0.08 }),
        darkMetal: material({ texture: texture('assets/textures/metal.png'), useTexture: true, color: [0.65, 0.65, 0.68, 1], shininess: 62, specularStrength: 0.5 }),
        cabin: material({ color: [0.45, 0.33, 0.22, 1], shininess: 18, specularStrength: 0.12 }),
        glass: material({ color: [0.55, 0.86, 1.0, 0.42], alpha: 0.42, shininess: 96, specularStrength: 0.65, transparent: true }),
        windowPaint: material({ color: [0.22, 0.45, 0.75, 1], shininess: 40, specularStrength: 0.35 }),
        yellow: material({ color: [1.0, 0.82, 0.22, 1], shininess: 24, specularStrength: 0.18 }),
        landing: material({ color: [0.18, 0.18, 0.2, 1], shininess: 22, specularStrength: 0.15 }),
        sky: material({ texture: texture('assets/textures/sky.png', false), useTexture: true, noLighting: true, noFog: true })
    };
}

export function drawDrawable(gl, programInfo, drawable, commonUniforms) {
    const m4 = window.twgl.m4;
    const worldInverseTranspose = m4.transpose(m4.inverse(drawable.world));
    const mat = drawable.material;

    // O programa precisa estar ativo antes de configurar atributos e uniforms.
    gl.useProgram(programInfo.program);

    const uniforms = {
        ...commonUniforms,
        u_world: drawable.world,
        u_worldInverseTranspose: worldInverseTranspose,
        u_texture: mat.texture,
        u_color: mat.color,
        u_useTexture: mat.useTexture,
        u_alpha: mat.alpha,
        u_shininess: mat.shininess,
        u_specularStrength: mat.specularStrength,
        u_enableLighting: mat.noLighting ? 0 : commonUniforms.u_enableLighting,
        u_enableFog: mat.noFog ? 0 : commonUniforms.u_enableFog
    };

    window.twgl.setBuffersAndAttributes(gl, programInfo, drawable.bufferInfo);
    window.twgl.setUniforms(programInfo, uniforms);
    window.twgl.drawBufferInfo(gl, drawable.bufferInfo);
}

function createPlaneBufferInfo(gl, width, depth, repeatX, repeatZ) {
    const x = width / 2;
    const z = depth / 2;

    const arrays = {
        position: {
            numComponents: 3,
            data: [
                -x, 0, -z,
                 x, 0, -z,
                -x, 0,  z,
                 x, 0,  z
            ]
        },
        normal: {
            numComponents: 3,
            data: [
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0
            ]
        },
        texcoord: {
            numComponents: 2,
            data: [
                0, 0,
                repeatX, 0,
                0, repeatZ,
                repeatX, repeatZ
            ]
        },
        indices: [0, 1, 2, 2, 1, 3]
    };

    return window.twgl.createBufferInfoFromArrays(gl, arrays);
}

function createRoofBufferInfo(gl) {
    const positions = [];
    const normals = [];
    const texcoords = [];

    function addTriangle(a, b, c, uvA, uvB, uvC) {
        const normal = faceNormal(a, b, c);
        positions.push(...a, ...b, ...c);
        normals.push(...normal, ...normal, ...normal);
        texcoords.push(...uvA, ...uvB, ...uvC);
    }

    function addQuad(a, b, c, d) {
        addTriangle(a, b, c, [0, 0], [1, 0], [0, 1]);
        addTriangle(c, b, d, [0, 1], [1, 0], [1, 1]);
    }

    const lf = [-1, 0, -1];
    const rf = [ 1, 0, -1];
    const pf = [ 0, 0.8, -1];
    const lb = [-1, 0,  1];
    const rb = [ 1, 0,  1];
    const pb = [ 0, 0.8,  1];

    addTriangle(lf, pf, rf, [0, 0], [0.5, 1], [1, 0]);
    addTriangle(lb, rb, pb, [0, 0], [1, 0], [0.5, 1]);
    addQuad(lf, lb, pf, pb);
    addQuad(rf, pf, rb, pb);

    return window.twgl.createBufferInfoFromArrays(gl, {
        position: { numComponents: 3, data: positions },
        normal: { numComponents: 3, data: normals },
        texcoord: { numComponents: 2, data: texcoords }
    });
}

function faceNormal(a, b, c) {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;

    return [nx / len, ny / len, nz / len];
}
