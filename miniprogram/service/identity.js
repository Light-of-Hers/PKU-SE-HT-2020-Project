const sdk = require('miniprogram-taas-sdk')

module.exports = {
    credential: undefined,

    init: function() {
        const data = wx.getStorageSync("identity")
        if(!data)
            return
        console.log('Identity Init')
        console.log(data)
        this.credential = data

        if(this.credential)
            this.registered = true
    },

    save: function() {
        wx.setStorageSync("identity", this.credential)
    },

    register: function(invitationCode) {
        return new Promise((resolve, reject) => {
            sdk.getCredential(invitationCode, null, (err, data) => {
                if(err) {
                    reject(err)
                } else {
                    this.credential = data
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
    }
}