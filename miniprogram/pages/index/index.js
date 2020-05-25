//index.js
const app = getApp()

const client = require('../../service/client.js')

Page({
  data: {
    invitationCode: '',
    name: '',
    credential: {
      credential: '',
      publicKey: '',
      privateKey: ''
    }
  },

  onLoad: function() {
    client.loadLocal()
    .then(() => {
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      console.log(e)
    })
  },

  bindNameInput: function(e) {
    this.data.name = e.detail.value
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
    client.register(this.data.invitationCode, this.data.name)
    .then(() => {
      wx.showToast({title: "注册成功！"})
      console.log(client.getUser())
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      wx.showToast({title: "注册失败：" + e.message, icon: "none"})
    })
  },

  login: function() {
    client.login(this.data.credential)
    .then(() => {
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      console.log(e)
    })
  },

  cloudLogin: function() {
    client.loadCloud()
    .then(() => {
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      console.log(e)
      wx.showToast({title: "操作失败，请确认此微信号绑定过密钥", icon: "none"})
    })
  }
})
