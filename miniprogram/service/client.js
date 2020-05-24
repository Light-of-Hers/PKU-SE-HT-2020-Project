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
        return Promise.reject('not implement')
    },

    login(credential) {
        taas.credential = credential
        wx.setStorageSync('credential', credential)
        return taas.initContract()
        .then(() => {
            this.user = new User('', credential)
            return this.user.syncAll()
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
        })
    },
    
    logout() {
        this.user = null
        wx.removeStorageSync('credential')
    }
}