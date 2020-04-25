const sdk = require('miniprogram-taas-sdk')

module.exports = {
    credential: null,
    publicKey: null,
    privateKey: null,
    registered: false,

    init: function() {
        const data = wx.getStorageSync("identity")
        if(!data)
            return
        this.credential = data.credential
        this.publicKey = data.publicKey
        this.privateKey = data.privateKey       

        if(this.credential)
            this.registered = true
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
                if(err) {
                    reject(err)
                } else {
                    this.credential = data.credential
                    this.publicKey = data.publicKey
                    this.privateKey = data.privateKey
                    this.save()
                    this.registered = true
                    resolve(this.credential)
                }
            })
        })
    },
    
    login: function(credential) {
        this.credential = credential
        this.save()
        this.registered = true
        resolve()
    }
}