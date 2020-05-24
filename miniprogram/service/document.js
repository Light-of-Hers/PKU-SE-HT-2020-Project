const taas = require('./taas.js')

class Version {
    constructor(timestamp, hashId) {
        this.timestamp = timestamp
        this.hashId = hashId
        this._cached = false
        this._content = undefined
    }

    getContent() {
        return new Promise((resolve, reject) =>{
            taas.queryEvidence(this.hashId, (err, obj) =>{
                if(err){
                    reject(err)
                } else{
                    resolve(obj.data)
                }
            })
        })
    }
}

class Document {
    constructor({id, name, type, isMain, path}) {
        this.id = id
        this.name = name
        this.type = type
        this.isMain = isMain
        this.path = path
        this._time = 0
        this.versions = []
    }

    sync() {

    }

    createVersion(content) {
        return new Promise((resolve, reject) => {
            taas.storeEvidence(content)
            .then(({hashId, sig}) => {
                return taas.queryEvidence(hashId)
            })
            .then(({timestamp}) => {
                var ver = new Version(timestamp, hashId)
                this.versions.splice(0, 0, ver)
                this._time = new Data().getTime()
                this.sync()
                resolve(ver)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

    deleteVersion(index) {
        this.versions.splice(index, 1)
        this._time = new Data().getTime()
        this.sync()
    }
}

module.exports = Document