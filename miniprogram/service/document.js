const taas = require('./taas.js')

class Version {
    constructor(timestamp, hashId) {
        this.timestamp = timestamp
        this.hashId = hashId
        this._cached = false
        this._content = undefined
    }

    getContent() {

    }
}

class Document {
    constructor({id, name, type, isMain, path}) {
        this.id = id
        this.name = name
        this.type = type
        this.isMain = isMain
        this.path = path
        this.lastSyncTime = 0
        this.versions = []
    }

    sync() {

    }

    rename() {

    }

    createVersion(content) {

    }

    deleteVersion(index) {

    }
}

module.exports = Document