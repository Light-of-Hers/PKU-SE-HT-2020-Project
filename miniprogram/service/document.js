const identity = require('identity.js')
const sdk = require('miniprogram-taas-sdk')

class DocumentVersion {
    constructor(timestamp, content) {
        this.timestamp = timestamp
        this.content = content
    }
}

class Document {
    constructor(id, name, path, hashId){
        this.id = id
        this.name = name,
        this.path = path
        this.latestHashId = hashId
        this.versions = null
    }

    download() {
        //TODO: 从区块链上下载内容，恢复versions
    }

    update(content) {
        //TODO: 为该文档新增一个版本并上传至区块链
    }

    isReady() {
        return this.versions != null
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

    createDocument: function(name, path) {
        //TODO: 新建一个文档，把信息保存在本地
    },

    getDocumentById: function(id) {

    }    
}