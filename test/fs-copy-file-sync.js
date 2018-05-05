'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const tryCatch = require('try-catch');
const COPY_FILE_SYNC = '../lib/fs-copy-file-sync';
const copyFileSync = require(COPY_FILE_SYNC);

const {
    COPYFILE_EXCL,
    COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE,
} = copyFileSync.constants;

const fixture = path.join(__dirname, 'fixture');

test('copyFileSync: no args: message', (t) => {
    const msg = 'The "src" argument must be one of type string, Buffer, or URL. Received type undefined';
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    const [e] = tryCatch(copyFileSync);
    
    fs.copyFileSync = original;
    t.equal(e.message, msg, 'should throw when no src');
    t.end();
});

test('copyFileSync: no args: code', (t) => {
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = rerequire('../lib/fs-copy-file-sync');
    
    const [e] = tryCatch(copyFileSync);
    const code = 'ERR_INVALID_ARGS_TYPE';
    
    fs.copyFileSync = original
    t.equal(e.code, code, 'should code be equal');
    t.end();
});

test('copyFileSync: no dest', (t) => {
    const src = '1';
    const dest = 0;
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    
    const [e] = tryCatch(copyFileSync, src, dest);
    const msg = 'The "dest" argument must be one of type string, Buffer, or URL. Received type number';
    
    fs.copyFileSync = original;
    
    t.equal(e.message, msg, 'should throw when dest not string');
    t.end();
});

test('copyFileSync: no src', (t) => {
    const src = 1;
    const dest = '0';
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    
    const [e] = tryCatch(copyFileSync, src, dest);
    const msg = 'The "src" argument must be one of type string, Buffer, or URL. Received type number';
    fs.copyFileSync = original;
    
    t.equal(e.message, msg, 'should throw when src not string');
    t.end();
});

test('copyFileSync: no src: code', (t) => {
    const src = path.join(fixture, String(Math.random()));
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    const [e] = tryCatch(copyFileSync, src, dest);
    
    fs.copyFileSync = original;
    
    t.equal(e.code, 'ENOENT', 'should not find file');
    t.end();
});

test('copyFileSync', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    tryCatch(copyFileSync, src, dest);
    
    const data = fs.readFileSync(dest, 'utf8');
    
    fs.unlinkSync(dest);
    fs.copyFileSync = original;
    
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFileSync: big', (t) => {
    const src = path.join(fixture, 'big');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    tryCatch(copyFileSync, src, dest);
    
    const srcData = fs.readFileSync(src, 'utf8');
    const destData = fs.readFileSync(dest, 'utf8');
    
    fs.unlinkSync(dest);
    fs.copyFileSync = original;
    
    t.equal(srcData, destData, 'should copy file');
    t.end();
});

test('copyFileSync: original', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    tryCatch(copyFileSync, src, dest);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFileSync: EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    const {COPYFILE_EXCL} = fs.constants;
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const [e] = tryCatch(copyFileSync, src, dest, COPYFILE_EXCL);
    
    fs.copyFileSync = original;
    fs.unlinkSync(dest);
    
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFileSync: pipe', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    tryCatch(copyFileSync, src, dest, COPYFILE_EXCL);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    fs.copyFileSync = original;
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFileSync: COPYFILE_EXCL: EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    const [e] = tryCatch(copyFileSync, src, dest, COPYFILE_EXCL);
    
    fs.unlinkSync(dest);
    fs.copyFileSync = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFileSync: COPYFILE_EXCL | COPYFILE_FICLONE : EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    const [e] = tryCatch(copyFileSync, src, dest, COPYFILE_EXCL | COPYFILE_FICLONE);
    
    fs.unlinkSync(dest);
    fs.copyFileSync = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFileSync: COPYFILE_EXCL | COPYFILE_FICLONE_FORCE : EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    const [e] = tryCatch(copyFileSync, src, dest, COPYFILE_EXCL | COPYFILE_FICLONE_FORCE);
    
    fs.unlinkSync(dest);
    fs.copyFileSync = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFileSync: pipe: COPYFILE_EXCL', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    tryCatch(copyFileSync, src, dest, COPYFILE_EXCL);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    fs.copyFileSync = original;
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFileSync: COPYFILE_EXCL: stat: error', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    const {statSync} = fs;
    
    fs.copyFileSync = null;
    fs.statSync = () => {
        throw Error('hello')
    };
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    const [e] = tryCatch(copyFileSync, src, dest, COPYFILE_EXCL);
    
    fs.copyFileSync = original;
    fs.statSync = statSync;
    
    t.equal(e.message, 'hello', 'should return stat error');
    t.end();
});

test('copyFileSync: bad flags: more', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    
    const [e] = tryCatch(copyFileSync, src, dest, 8);
    
    fs.copyFileSync = original;
    t.equal(e.message, 'EINVAL: invalid argument, copyfile -> \'2\'', 'should throw');
    t.end();
});

test('copyFileSync: bad flags: less', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFile;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire(COPY_FILE_SYNC);
    
    const [e] = tryCatch(copyFileSync, src, dest, -1);
    
    fs.copyFileSync = original;
    t.equal(e.message, 'EINVAL: invalid argument, copyfile -> \'2\'', 'should throw');
    t.end();
});

function rerequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
}

