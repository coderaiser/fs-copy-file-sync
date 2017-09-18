'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const {promisify} = require('util');
const copyFileSync = require('../lib/fs-copy-file-sync');

const {COPYFILE_EXCL} = fs.constants;

const fixture = path.join(__dirname, 'fixture');

test('fs.copyFileSync: no args: message', (t) => {
    promisify(fs.copyFileSync)().catch((e) => {
        promisify(copyFileSync)().catch((error) => {
            t.equal(e.message, error.message, 'should throw when no callback');
            t.end();
        });
    });
});

test('copyFileSync: no args: code', (t) => {
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFile = rerequire('../lib/fs-copy-file-sync');
    const fn = promisify(copyFile);
    
    promisify(original)().catch((e) => {
        fn().catch((error) => {
            fs.copyFileSync = original
            t.equal(e.code, error.code, 'should code be equal');
            t.end();
        });
    });
});

test('copyFileSync: no dest', (t) => {
    const src = '1';
    const dest = 0;
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFile = rerequire('../lib/fs-copy-file-sync');
    const fn = promisify(copyFile);
    
    promisify(original)(src, dest).catch((e) => {
        fn(src, dest).catch((error) => {
            fs.copyFileSync = original;
            t.equal(e.message, error.message, 'should throw when no dest');
            t.end();
        });
    });
});

test('copyFileSync: no src', (t) => {
    const src = 1;
    const dest = '0';
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = rerequire('../lib/fs-copy-file-sync');
    const fn = promisify(copyFileSync);
    
    promisify(original)(src, dest).catch((e) => {
        fn(src, dest).catch((error) => {
            fs.copyFileSync = original;
            t.equal(e.message, error.message, 'should throw when no dest');
            t.end();
        });
    });
});

test('copyFileSync: src not found', (t) => {
    const src = path.join(fixture, String(Math.random()));
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFile = rerequire('../lib/fs-copy-file-sync');
    
    promisify(copyFile)(src, dest).catch((error) => {
        fs.copyFileSync = original;
        t.equal(error.code, 'ENOENT', 'should not find file');
        t.end();
    });
});

test('copyFileSync', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    copyFileSync(src, dest).then(() => {
        const data = fs.readFileSync(dest, 'utf8');
        
        fs.unlinkSync(dest);
        fs.copyFileSync = original;
        
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFileSync: big', (t) => {
    const src = path.join(fixture, 'big');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    copyFileSync(src, dest).then(() => {
        fs.unlinkSync(dest);
        fs.copyFileSync = original;
        
        t.pass('should copy big file');
        t.end();
    });
});

test('copyFileSync: EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    const {COPYFILE_EXCL} = fs.constants;
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    fs.writeFileSync(dest, 'hello');
    
    copyFileSync(src, dest, COPYFILE_EXCL).catch((error) => {
        fs.copyFileSync = original;
        fs.unlinkSync(dest);
        t.equal(error.code, 'EEXIST', 'should return error');
        t.end();
    });
});

test('copyFileSync: pipe', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    copyFileSync(src, dest).then(() => {
        const data = fs.readFileSync(dest, 'utf8');
        fs.unlinkSync(dest);
        
        fs.copyFileSync = original;
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFileSync: EEXIST: pipe', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    fs.writeFileSync(dest, 'hello');
    
    copyFileSync(src, dest, COPYFILE_EXCL).catch((error) => {
        fs.unlinkSync(dest);
        fs.copyFileSync = original;
        t.equal(error.code, 'EEXIST', 'should return error');
        t.end();
    });
});

test('copyFileSync: pipe: COPYFILE_EXCL', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    copyFileSync(src, dest, COPYFILE_EXCL).then(() => {
        const data = fs.readFileSync(dest, 'utf8');
        fs.unlinkSync(dest);
        
        fs.copyFileSync = original;
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFileSync: COPYFILE_EXCL: stat: error', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFileSync;
    const {stat} = fs;
    
    fs.copyFileSync = null;
    fs.statSync = () => {
        throw Error('hello');
    }
    
    const copyFileSync = asyncify(rerequire('../lib/fs-copy-file-sync'));
    
    copyFileSync(src, dest, COPYFILE_EXCL).catch((error) => {
        fs.copyFileSync = original;
        fs.stat = stat;
        
        t.equal(error.message, 'hello', 'should return stat error');
        t.end();
    });
});

test('copyFileSync: bad flags', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFileSync;
    fs.copyFileSync = null;
    
    const copyFileSync = rerequire('../lib/fs-copy-file-sync');
    
    const fn = () => copyFileSync(src, dest, 4);
    
    fs.copyFile = original;
    t.throws(fn, /EINVAL: invalid argument, copyfile -> '2'/, 'should throw');
    t.end();
});

function rerequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
}

function asyncify(fn) {
    return function async(...args) {
        return fn(...args);
    };
}

