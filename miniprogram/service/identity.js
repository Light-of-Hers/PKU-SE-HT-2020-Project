const sdk = require('miniprogram-taas-sdk')
const document = require('document')

module.exports = {
    credential: null,
    publicKey: null,
    privateKey: null,
    registered: false,

    init: function() {
        const data = wx.getStorageSync("identity")
        if(!data)
            return
        try {
            let dataObj = JSON.parse(data)
            this.credential = dataObj.credential
            this.publicKey = dataObj.publicKey
            this.privateKey = dataObj.privateKey
            this.registered = true
        } catch (e) {
            console.error(e)
        }            
    },

    save: function() {
        const data = {
            credential: this.credential,
            publicKey: this.publicKey,
            privateKey: this.privateKey
        }
        wx.setStorageSync("identity", data)
    },

    register: function(invitationCode) {
        return new Promise((resolve, reject) => {
            sdk.getCredential(invitationCode, null, (err, data) => {
                if(err)
                    reject(err)
                else {
                    this.credential = data.credential
                    this.publicKey = data.publicKey
                    this.privateKey = data.privateKey
                    this.save()
                    this.registered = true
                    document.userInit()
                    .then(() => {resolve(this.credential)})
                    .catch((e) => {reject(e)})
                }
            })
        })
    },
    
    login: function(credential) {
        this.credential = credential
        this.save()
        this.registered = true
        document.userInit()
        .then(() => {resolve()})
        .catch((e) => {reject(e)})
    }
}