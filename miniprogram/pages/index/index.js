//index.js
const app = getApp()

const identity = require('../../service/identity')
const document = require('../../service/document')

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
    if(identity.registered) {
      wx.redirectTo({
        url: '../browsePage/browsePage',
      })
    }
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
    identity.register(this.data.invitationCode)
    .then((credential) => {
      console.log(credential)
      return document.userInit()
    })
    .then(() => {
      wx.showToast({title: "注册成功！"})
      wx.redirectTo({
        url: '../browsePage/browsePage',
      })
    })
    .catch((e) => {
      wx.showToast({title: "注册失败：" + e.message, icon: "none"})
    })
  },

  login: function() {
    identity.login(this.data.credential)
    console.log(identity.credential)
    document.userInit()
    .then(() => {
      wx.showToast({title: "导入成功！", time: 2000})
      wx.redirectTo({
        url: '../browsePage/browsePage',
      })
    })
    .catch((e) => {
      wx.showToast({title: "导入失败：" + e.message, icon: "none"})
    })
  }
})
