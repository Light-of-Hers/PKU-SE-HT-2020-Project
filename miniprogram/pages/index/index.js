//index.js
const app = getApp()

const client = require('../../service/client.js')

Page({
  data: {
    invitationCode: '',
    credential: {
      credential: '',
      publicKey: '',
      privateKey: ''
    }
  },

  onLoad: function() {
    client.loadLocal()
    .then(() => {
      wx.redirectTo({
        url: '../browsePage/browsePage',
      })
    })
    .catch((e) => {
      console.log(e)
    })
  },

  bindInvitationCodeInput: function(e) {
    this.data.invitationCode = e.detail.value
  },

  bindCredentialInput: function(e) {
    this.data.credential.credential = e.detail.value
  },

  bindPublicKeyInput: function(e) {
    this.data.credential.publicKey = e.detail.value
  },

  bindPrivateKeyInput: function(e) {
    this.data.credential.privateKey = e.detail.value
  },

  register: function() {
    client.register(invitationCode, 'test')
    .then(() => {
      wx.showToast({title: "注册成功！"})
      console.log(client.getUser())
      // wx.redirectTo({
      //   url: '../browsePage/browsePage',
      // })
    })
    .catch((e) => {
      wx.showToast({title: "注册失败：" + e.message, icon: "none"})
    })
  },

  login: function() {
    client.login(credential)
    .then(() => {
      console.log(client.getUser())
    })
    .catch((e) => {
      console.log(e)
    })
  }
})
