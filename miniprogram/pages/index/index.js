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
    wx.showLoading({
      title: '正在登录',
      mask: true
    })
    client.loadLocal()
    .then(() => {
      wx.hideLoading({})
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      wx.hideLoading({})
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
    wx.showLoading({
      title: '正在注册',
      mask: true
    })
    client.register(this.data.invitationCode, this.data.name)
    .then(() => {
      wx.hideLoading({})
      wx.showToast({title: "注册成功！"})
      console.log(client.getUser())
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      wx.hideLoading({})
      wx.showToast({title: "注册失败：" + e.message, icon: "none"})
    })
  },

  login: function() {
    wx.showLoading({
      title: '正在登录',
      mask: true
    })
    client.login(this.data.credential)
    .then(() => {
      wx.hideLoading({})
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      wx.hideLoading({})
      console.log(e)
    })

  },

  cloudLogin: function() {
    wx.showLoading({
      title: '正在登录',
      mask: true
    })
    client.loadCloud()
    .then(() => {
      wx.hideLoading({})
      wx.switchTab({
        url: '../projectManagePage/projectManagePage',
      })
    })
    .catch((e) => {
      console.log(e)
      wx.hideLoading({})
      wx.showToast({title: "操作失败，请确认此微信号绑定过密钥", icon: "none"})
    })

  }
})
