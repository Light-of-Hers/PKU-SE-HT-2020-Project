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
                return sdk.promises.queryEvidence(hashId, null, identity.credential)
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
        this.documentList = []
        try{
            var list = wx.getStorageSync({key: 'DocumentList'});
            this.documentList = list;
        }
        catch(e){
            wx.showModal({
                title: '提示',
                content: '无法获取文件列表!',
             });
        }
        console.log('Document Manager Init')
    },

    save: function() {
        try{
            var list = this.documentList;
            wx.setStorage({
            data: list,
            key: 'DocumentList',
            });
        } catch(e){
            wx.showModal({
                title: '提示',
                content: '无法保存文件列表!',
             });
        }
        console.log('Document Manager Saved')
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
        return this.createDocument('main', '/main', helpInfo)
    },

    findDocumentById: function(id) {
        var length = this.documentList.length;
        var i = 0;
        for(i = 0; i < length;i ++){
            if(this.documentList[i].id == id){
                break;
            }
        }
        if(i == length){
            wx.showModal({
                title: '提示',
                content: '没有这个文件哦!',
             });
             return null;
        }
        else{
            if(!this.documentList[i].ready){
                this.documentList[i].download().then(()=> 
                    console.log('Download successfully!')
                )
            }
            return this.documentList[i];
            

        }
        throw('Not implement')
    }    
}