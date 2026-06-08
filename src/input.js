export function createInput() {
    const keys = {};
    let pressedThisFrame = {};

    function normalizeKey(key) {
        return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
    }

    window.addEventListener('keydown', (event) => {
        const key = normalizeKey(event.key);
        const usedKeys = ['w', 'a', 's', 'd', '1', '2', 'c', 'l', 'n', 'p'];

        if (usedKeys.includes(key)) {
            event.preventDefault();
        }

        if (!keys[key]) {
            pressedThisFrame[key] = true;
        }
        keys[key] = true;
    });

    window.addEventListener('keyup', (event) => {
        const key = normalizeKey(event.key);
        keys[key] = false;
    });

    return {
        isDown(key) {
            return !!keys[normalizeKey(key)];
        },
        wasPressed(key) {
            return !!pressedThisFrame[normalizeKey(key)];
        },
        endFrame() {
            pressedThisFrame = {};
        }
    };
}
