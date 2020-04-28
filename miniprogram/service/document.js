const identity = require('identity.js')
const sdk = require('miniprogram-taas-sdk')

class DocumentVersion {
    constructor(timestamp, content, hashId) {
        this.timestamp = timestamp
        this.content = content
        this.hashId = hashId
    }
}

class Document {
    constructor(id, name, path, hashId){
        this.id = id
        this.name = name
        this.path = path
        this.latestHashId = hashId
        this.ready = false
        this.versions = null
    }

    download() {
        return new Promise((resolve, reject) => { 
            if(!this.versions)
                this.versions = []
            if(this.versions.length && this.versions[0].hashId == this.latestHashId) { //已经获取了全部内容
                this.ready = true
                resolve()
                return
            }
            let newVersions = []
            
            const iter = (hashId) => {
                if(!hashId || (this.versions.length && this.versions[0].hashId == hashId)) {
                    this.versions.splice(0,0,...newVersions)
                    this.ready = true
                    resolve()
                } else {
                    sdk.queryEvidence(hashId, null, identity.credential, (err, {data, timestamp}) => {
                        if(err) {
                            reject(err)
                            return
                        }
                        const {content, lastHashId} = JSON.parse(data.text)
                        newVersions.push(new DocumentVersion(timestamp, content, hashId))
                        iter(lastHashId)
                    })
                }
            }
    
            iter(this.latestHashId)
        })
    }

    update(content) {
        const data = JSON.stringify({
            content,
            lastHashId: this.latestHashId
        })
        return new Promise((resolve, reject) => {
            let hashid
            sdk.promises.storeEvidence(data, null, identity.credential)
            .then(({hash}) => {
                hashid = hash
                console.log("New Document HashID: " + hash)
                return sdk.promises.queryEvidence(hash, null, identity.credential)
            })
            .then(({timestamp}) => {
                this.latestHashId = hashid
                this.ready = false
                document.save()
                resolve(timestamp)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
}

const document = {
    documentList: null,

    init: function() {
        this.documentList = []
        const data = wx.getStorageSync('documentList')
        if(!data)
            return
        this.documentList = data.map(x => new Document(x.id, x.name, x.path, x.hashId))
        console.log('Document Manager Init')
    },

    save: function() {
        const data = this.documentList.map((x) => {
            return {
                id: x.id,
                name: x.name,
                path: x.path,
                hashId: x.latestHashId
            }
        })
        wx.setStorageSync('documentList', data)
    },

    createDocument: function(name, path, content) {
        return new Promise((resolve, reject) => {
            const newDocument = new Document(this.documentList.length, name, path, null)
            this.documentList.push(newDocument)
            newDocument.update(content)
            .then((timestamp) => {
                resolve(newDocument, timestamp)
            })
            .catch((e) => {
                reject(e)
            })
        })
    },

    userInit: function() {
        const helpInfo =  `欢迎使用“我的创作家园”
        您的公钥为${identity.publicKey}`

        this.documentList = []
        this.latestHashId = null
        return this.createDocument('main', '/main', helpInfo)
    },

    findDocumentById: function(id) {
        throw('Not implement')
    }    
}

module.exports = document