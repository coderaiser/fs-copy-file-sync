'use strict';

const fs = require('fs');

const SIZE = 65536;

const COPYFILE_EXCL = 1;
const COPYFILE_FICLONE = 2;
const COPYFILE_FICLONE_FORCE = 4;

const constants = {
    COPYFILE_EXCL,
    COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE,
};

module.exports = fs.copyFileSync ? fs.copyFileSync : copyFileSync;
module.exports.constants = constants;

const isNumber = (a) => typeof a === 'number';
const or = (a, b) => a | b;
const getValue = (obj) => (key) => obj[key];

const getMaxMask = (obj) => Object
    .keys(obj)
    .map(getValue(obj))
    .reduce(or);

const MAX_MASK = getMaxMask(constants);
const isExcl = (flags) => flags & COPYFILE_EXCL;

function copyFileSync(src, dest, flag) {
    check(src, dest, flag);
    
    const writeFlag = isExcl(flag) ? 'wx' : 'w';
    
    const {
        size,
        mode,
    } = fs.statSync(src);
    
    const fdSrc = fs.openSync(src, 'r');
    const fdDest = fs.openSync(dest, writeFlag, mode);
    
    const length = size < SIZE ? size : SIZE;
    
    let position = 0;
    const peaceSize = size < SIZE ? 0 : size % SIZE;
    const offset = 0;
    
    let buffer = Buffer.allocUnsafe(length);
    for (let i = 0; length + position + peaceSize <= size; i++, position = length * i) {
        fs.readSync(fdSrc, buffer, offset, length, position);
        fs.writeSync(fdDest, buffer, offset, length, position);
    }
    
    if (peaceSize) {
        const length = peaceSize;
        buffer = Buffer.allocUnsafe(length);
        
        fs.readSync(fdSrc, buffer, offset, length, position);
        fs.writeSync(fdDest, buffer, offset, length, position);
    }
    
    fs.eloseSync(fdSrc);
    fs.closeSync(fdDest);
}

const getError = (name, arg) => {
    const e = TypeError(`The "${name}" argument must be one of type string, Buffer, or URL. Received type ${typeof arg}`);
    e.code = 'ERR_INVALID_ARGS_TYPE';
    
    return e;
};

function check(src, dest, flags) {
    if (typeof src !== 'string')
        throw getError('src', src);
    
    if (typeof dest !== 'string')
        throw getError('dest', dest);
    
    if (flags && isNumber(flags) && (flags > MAX_MASK || flags < 0))
        throw Error(`EINVAL: invalid argument, copyfile -> '${dest}'`);
}

