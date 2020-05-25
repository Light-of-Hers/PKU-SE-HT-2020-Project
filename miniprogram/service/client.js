const taas = require('./taas.js')
const User = require('./user.js')

module.exports = {
    user: null,
    getUser() {
        return this.user
    },

    loadLocal() {
        let credential = wx.getStorageSync('credential')
        if(!credential)
            return Promise.reject('no credential in local storage')
        return this.login(credential)
    },

    loadCloud() {
        return wx.cloud.callFunction({
            name: 'getOpenid'
          })
          .then((res) => {
            const openid = res.result
            const db = wx.cloud.database({
                env: 'homeforcreator-8sqew'
            })
            return db.collection('credential').doc(openid).get()
          })
          .then((res) => {
              const credential = res.data.credential
              return this.login(credential)
          })
          .catch((e) => {
              if(e.errCode == -1)
                return Promise.reject('Credential not found in cloud')
              throw e
          })
    },

    storeCloud(credential) {
        return wx.cloud.callFunction({
            name: 'getOpenid'
          })
          .then((res) => {
            const openid = res.result
            const db = wx.cloud.database({
                env: 'homeforcreator-8sqew'
            })
            return db.collection('credential').doc(openid)
            .set({
                data: {
                    credential: credential
                }
            })
          })
    },

    login(credential) {
        taas.credential = credential
        wx.setStorageSync('credential', credential)
        return taas.initContract()
        .then(() => {
            this.user = new User('', credential)
            return this.user.syncAll()
        })
        .then(() => {
            this.storeCloud(credential)
        })
    },

    register(invitationCode, name) {
        let user
        return taas.getCredential(invitationCode)
        .then((credential) => {
            taas.credential = credential
            return taas.initContract()
        })
        .then(() => {
            user = new User(name, credential)
            user._time = new Date().getTime()
            return user.sync()
        })
        .then(() => {
            this.user = user
            wx.setStorageSync('credential', credential)
            this.storeCloud(taas.credential)
        })
    },
    
    logout() {
        this.user = null
        wx.removeStorageSync('credential')
    }
}