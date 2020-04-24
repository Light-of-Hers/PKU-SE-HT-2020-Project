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
                        const {content, lastHashId} = JSON.parse(data.data)
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
            sdk.promises.storeEvidence(data, null, identity.credential)
            .then(({hashId, sig}) => {
                sdk.promises.queryEvidence(hashId, null, identity.credential)
            })
            .then(({timestamp}) => {
                this.latestHashId = hashId
                this.ready = false
                this.save()
                resolve(timestamp)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
}

module.exports = {
    documentList: null,

    init: function() {
        //TODO: 从本地缓存中恢复文档列表
        console.log('Document Manager Init')
    },

    save: function() {
        //TODO: 将文档列表保存至缓存
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
        this.createDocument('main', '/main', helpInfo)
    },

    findDocumentById: function(id) {
        
    }    
}