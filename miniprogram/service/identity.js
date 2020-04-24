const sdk = require('miniprogram-taas-sdk')

module.exports = {
    credential: null,
    publicKey: null,
    privateKey: null,

    init: function() {
        //TODO: 从缓存中恢复credential, publickey, privatekey
        console.log('Identity Manager Init')
    },

    save: function() {
        //TODO: 保存到缓存
    },

    generate: function(invitationCode) {
        //TODO: 生成credential并保存
    },

    isRegistered: function() {
        return this.credential != null
    }
}