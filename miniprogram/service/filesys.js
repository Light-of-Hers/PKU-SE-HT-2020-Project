class BaseFile {
    name = ""
    parent = null
    id = -1

    constructor(name, id, parent = null) {
        this.name = name;
        this.parent = parent;
        this.id = id;
    }
    setParent(p) { this.parent = p; }
    getPath() { throw "Not implemented"; }
    toString() { throw "Not implemented"; }
    getId() { return this.id; }
}

class DocFile extends BaseFile {
    doc = null

    constructor(name, doc, parent = null) {
        super(name, doc.id, parent);
        this.doc = doc;
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

    constructor(name, id, parent = null) {
        super(name, id, parent);
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
        if (cur_dir.getChild(fname) === undefined)
            cur_dir.addChild(path.endsWith("/") ? new DirFile(fname) : new DocFile(fname, doc));
    }
    return fs;
}

module.exports = {
    DocFile,
    DirFile,
    buildFS,
}
