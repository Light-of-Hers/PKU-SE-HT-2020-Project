const taas = require('./taas.js')

class Version {
    constructor(timestamp, hashId) {
        this.timestamp = timestamp
        this.hashId = hashId
        this._cached = false
        this._content = undefined
    }

    getContent() {
        if(this._cached) {
            return Promise.resolve(this._content)
        } else {
            return taas.queryEvidence(this.hashId)
            .then((data) => {
                if(data.data.text) {
                    this._content = data.data.text
                    this._cached = true
                    return this._content
                }
                if(data.data.data) {
                    let path = `${wx.env.USER_DATA_PATH}/temp/${this.hashId}`
                    const fsm = wx.getFileSystemManager()
                    try {
                        fsm.mkdirSync(`${wx.env.USER_DATA_PATH}/temp/`, true)
                    }
                    catch (e) {console.log(e)}
                    fsm.writeFileSync(path, data.data.data, 'base64')
                    this._content = {
                        path: path
                    }
                    this._cached = true
                    return this._content
                }
                throw new error('No data')
            })
        }
    }
}

class Document {
    constructor({id, name, type, isMain, path, projectId}) {
        this.id = id
        this.name = name
        this.type = type
        this.isMain = isMain
        this.path = path
        this.projectId = projectId
        this._time = 0
        this.versions = []
    }

    sync() {
        console.log('syncing...')
        const data = {
            id: this.id,
            projectId: this.projectId,
            time: this._time,
            name: this.name,
            type: this.type,
            versions: this.versions.map((v) => {
                return {
                    timestamp: v.timestamp,
                    hashId: v.hashId
                }
            })
        }
        console.log('syncing' + JSON.stringify(data))
        return taas.executeContract({
            method: 'syncDocument',
            arg: JSON.stringify(data)
        })
        .then((res) => {
            console.log(res)
            if(res.status != "Success") {
                throw new Error('executeContract status: ' + res.status)
            }
            const result = JSON.parse(res.result)
            if(result.needUpdateLocal) {
                const data = result.data
                this._time = data.time
                this.name = data.name
                this.type = data.type
                this.versions = data.versions.map((v) => {
                    return new Version(v.timestamp, v.hashId)
                })
            }
        })       
    }

    createVersion(content) {
        return new Promise((resolve, reject) => {
            let hashId
            taas.storeEvidence(content)
            .then(({hash, sig}) => {
                hashId = hash
                console.log(hash)
                return taas.queryEvidence(hashId)
            })
            .then(({timestamp}) => {
                var ver = new Version(timestamp, hashId)
                this.versions.splice(0, 0, ver)
                ver._cached = true
                ver._content = content
                console.log(this.versions)
                this._time = new Date().getTime()
                this.sync().then(() => {
                    resolve(ver)
                })
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

    deleteVersion(index) {
        this.versions.splice(index, 1)
        this._time = new Date().getTime()
        this.sync()
    }
}

module.exports = Document