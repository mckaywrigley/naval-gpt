"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.allocateArray = allocateArray;
exports.numberToHex = numberToHex;
exports.randomInt = randomInt;
exports.xorBuffer = xorBuffer;
exports.isEmptyBuffer = isEmptyBuffer;
exports.getDefaultSeed = getDefaultSeed;
exports.BufferError = void 0;
const BufferError = 'The buffer class must be available, if you are a browser user use the buffer package (https://www.npmjs.com/package/buffer)';
exports.BufferError = BufferError;
function allocateArray(size, defaultValue) {
    const array = new Array(size);
    const getDefault = typeof defaultValue === 'function' ? defaultValue : ()=>defaultValue;
    for(let ind = 0; ind < size; ind++){
        array[ind] = getDefault();
    }
    return array;
}
function numberToHex(elem) {
    let e = Number(elem).toString(16);
    if (e.length % 4 !== 0) {
        e = '0'.repeat(4 - e.length % 4) + e;
    }
    return e;
}
function randomInt(min, max, random) {
    if (random === undefined) {
        random = Math.random;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    const rn = random();
    return Math.floor(rn * (max - min + 1)) + min;
}
function xorBuffer(a, b) {
    const length = Math.max(a.length, b.length);
    const buffer = Buffer.allocUnsafe(length).fill(0);
    for(let i = 0; i < length; ++i){
        if (i < a.length && i < b.length) {
            buffer[length - i - 1] = a[a.length - i - 1] ^ b[b.length - i - 1];
        } else if (i < a.length && i >= b.length) {
            buffer[length - i - 1] ^= a[a.length - i - 1];
        } else if (i < b.length && i >= a.length) {
            buffer[length - i - 1] ^= b[b.length - i - 1];
        }
    }
    // now need to remove leading zeros in the buffer if any
    let start = 0;
    const it = buffer.values();
    let value = it.next();
    while(!value.done && value.value === 0){
        start++;
        value = it.next();
    }
    return buffer.slice(start);
}
function isEmptyBuffer(buffer) {
    if (buffer === null || !buffer) return true;
    for (const value of buffer){
        if (value !== 0) {
            return false;
        }
    }
    return true;
}
function getDefaultSeed() {
    return 0x1234567890;
}

//# sourceMappingURL=utils.js.map