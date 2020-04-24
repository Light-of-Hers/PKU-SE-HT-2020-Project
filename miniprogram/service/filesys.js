'use strict';

class BaseFile {
    name = ""
    parent = null

    constructor(name, parent = null) {
        this.name = name;
        this.parent = parent;
    }
    setParent(p) { this.parent = p; }
    getPath() { throw "Not implemented"; }
    toString() { throw "Not implemented"; }
}

class DocFile extends BaseFile {
    id = 0
    versions = []

    constructor(name, id, versions = [], parent = null) {
        super(name, parent);
        this.id = id;
        this.versions = versions;
    }
    getPath() {
        let res = this.name;
        for (let cur = this.parent; cur != null; cur = cur.parent) {
            res = cur.name + "/" + res;
        }
        return res;
    }
    toString() {
        return this.id.toString();
    }
}

class DirFile extends BaseFile {
    children = new Map();

    constructor(name, parent = null) {
        super(name, parent);
        this.children.set("..", this.parent);
    }
    setParent(p) {
        super.setParent(p);
        this.children.set("..", this.parent);
    }
    getPath() {
        let res = this.name + "/";
        for (let cur = this.parent; cur != null; cur = cur.parent) {
            res = cur.name + "/" + res;
        }
        return res;
    }
    getChild(name) {
        return this.children.get(name);
    }
    addChild(child) {
        this.children.set(child.name, child);
        child.setParent(this);
    }
    removeChild(child) {
        if (child instanceof File) {
            this.children.delete(child.name);
        } else if (child instanceof String) {
            this.children.delete(child);
        }
    }
    toString() {
        let res = "";
        this.children.forEach((f, n) => {
            if (n === "..")
                res += n + ", ";
            else
                res += f.name + ": " + f.toString() + ", ";
        })
        return "{" + res + "}";
    }
}

function buildFS(infos) {
    const fs = new DirFile("/");
    for (const info of infos) {
        const path = info.name + "";
        const names = path.split("/").filter(s => s != "");
        const fname = names[names.length - 1];
        names.pop();
        let cur_dir = fs;
        for (const name of names) {
            let dir = cur_dir.getChild(name);
            if (dir === undefined) {
                dir = new DirFile(name, cur_dir);
                cur_dir.addChild(dir);
            }
            cur_dir = dir;
        }
        if (cur_dir.getChild(fname) === undefined)
            cur_dir.addChild(path.endsWith("/") ? new DirFile(fname, cur_dir) : new DocFile(fname, info.id, info.versions));
    }
    return fs;
}

function simpleTest() {
    const infos = [
        { id: 0, name: "/path/to/file" },
        { id: 1, name: "/path/to/dir/" },
        { id: 2, name: "/path/" },
        { id: 3, name: "/path/to/" },
    ];
    console.log(buildFS(infos).toString());
}

// simpleTest();

module.exports = {
    DocFile,
    DirFile,
    buildFS,
}
