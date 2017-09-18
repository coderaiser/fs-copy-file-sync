'use strict';

const fs = require('fs');

const COPYFILE_EXCL = 1;
const SIZE = 65536;

module.exports.constants = {
    COPYFILE_EXCL
};

module.exports = fs.copyFileSync || copyFileSync;

function copyFileSync(src, dest, flag) {
    check(src, dest, flag);
    
    const writeFlag = flag === COPYFILE_EXCL ? 'wx' : 'w';
    
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
    
    fs.closeSync(fdSrc);
    fs.closeSync(fdDest);
}

function check(src, dest, flags) {
    if (typeof dest !== 'string')
        throw TypeError('dest must be a string');
    
    if (typeof src !== 'string')
        throw TypeError('src must be a string');
    
    if (typeof flags === 'number' && flags && flags !== COPYFILE_EXCL)
        throw Error(`EINVAL: invalid argument, copyfile -> '${dest}'`);
}

