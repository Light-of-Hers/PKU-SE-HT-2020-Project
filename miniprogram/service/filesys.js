class BaseFile {
    name = ""
    parent = null
    doc = null

    constructor(name, doc, parent = null) {
        this.name = name;
        this.parent = parent;
        this.doc = doc;
    }
    setParent(p) { this.parent = p; }
    getPath() { throw "Not implemented"; }
    toString() { throw "Not implemented"; }
    getId() { return this.doc.id; }
}

class DocFile extends BaseFile {

    constructor(name, doc = null, parent = null) {
        super(name, doc, parent);
    }
    getPath() {
        let res = this.name;
        for (let cur = this.parent; cur != null; cur = cur.parent) {
            res = cur.name + "/" + res;
        }
        return res;
    }
    async getVersions() {
        await this.doc.sync();
        return this.doc.versions;
    }
    async update(content) {
        return await this.doc.createVersion(content);
    }
    toString() {
        return this.getId().toString();
    }
}

class DirFile extends BaseFile {
    children = new Map();

    constructor(name, doc, parent = null) {
        super(name, doc, parent);
        this.children.set("..", this.parent);
    }
    getPath() {
        let res = this.name + "/";
        for (let cur = this.parent; cur != null; cur = cur.parent) {
            res = cur.name + "/" + res;
        }
        return res;
    }
    setParent(p) {
        super.setParent(p);
        this.children.set("..", this.parent);
    }
    getChild(name) {
        return this.children.get(name);
    }
    addChild(child) {
        this.children.set(child.name, child);
        child.setParent(this);
    }
    removeChild(child) {
        if (child instanceof BaseFile) {
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

function buildFS(docs) {
    const fs = new DirFile("/");
    for (const doc of docs) {
        const path = doc.path + "";
        const names = path.split("/").filter(s => s != "");
        const fname = names[names.length - 1];
        names.pop();
        let cur_dir = fs;
        for (const name of names) {
            let dir = cur_dir.getChild(name);
            if (dir === undefined) {
                dir = new DirFile(name);
                cur_dir.addChild(dir);
            }
            cur_dir = dir;
        }
        const chld = cur_dir.getChild(fname);
        if (chld === undefined) {
            cur_dir.addChild(path.endsWith("/") ? new DirFile(fname, doc) : new DocFile(fname, doc));
        } else if (chld instanceof DirFile) {
            chld.doc = doc;
        }
    }
    return fs;
}

module.exports = {
    BaseFile,
    DocFile,
    DirFile,
    buildFS,
}
