export function makeTransform(position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const m4 = window.twgl.m4;
    const matrix = m4.identity();

    m4.translate(matrix, position, matrix);
    m4.rotateX(matrix, rotation[0], matrix);
    m4.rotateY(matrix, rotation[1], matrix);
    m4.rotateZ(matrix, rotation[2], matrix);
    m4.scale(matrix, scale, matrix);

    return matrix;
}

export function applyTransform(parentMatrix, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const m4 = window.twgl.m4;
    const matrix = parentMatrix.slice();

    m4.translate(matrix, position, matrix);
    m4.rotateX(matrix, rotation[0], matrix);
    m4.rotateY(matrix, rotation[1], matrix);
    m4.rotateZ(matrix, rotation[2], matrix);
    m4.scale(matrix, scale, matrix);

    return matrix;
}

export function getWorldPosition(matrix) {
    return [matrix[12], matrix[13], matrix[14]];
}

export function forwardFromYaw(yaw) {
    return [Math.sin(yaw), 0, Math.cos(yaw)];
}

export function rightFromYaw(yaw) {
    return [Math.cos(yaw), 0, -Math.sin(yaw)];
}

export function distanceXZ(a, b) {
    const dx = a[0] - b[0];
    const dz = a[1] - b[1];
    return Math.sqrt(dx * dx + dz * dz);
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function approach(current, target, step) {
    if (current < target) {
        return Math.min(current + step, target);
    }
    return Math.max(current - step, target);
}

export function normalize3(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    if (len < 0.00001) {
        return [0, 1, 0];
    }
    return [v[0] / len, v[1] / len, v[2] / len];
}
