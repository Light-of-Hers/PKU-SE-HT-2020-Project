//index.js
const app = getApp()

const identity = require('../../service/identity')
const document = require('../../service/document')

Page({
  data: {
    invitationCode: '',
    credential: ''
  },

  onLoad: function() {
    if(identity.registered) {
      console.log(identity.credential)
      //TODO: 跳转至文档页
    }
  },

  bindInvitationCodeInput: function(e) {
    this.data.invitationCode = e.detail.value
  },

  bindCredentialInput: function(e) {
    this.data.credential = e.detail.value
  },

  register: function() {
    identity.register(this.data.invitationCode)
    .then((credential) => {
      console.log(credential)
      return document.userInit()
    })
    .then(() => {
      wx.showToast({title: "注册成功！"})
      //TODO: 跳转至文档页
    })
    .catch((e) => {
      wx.showToast({title: "注册失败：" + e.message, icon: "none"})
    })
  },

  login: function() {
    identity.login(this.data.credential)
    .then(() => {
      return document.userInit()
    })
    .then(() => {
      wx.showToast({title: "导入成功！"})
    })
    .catch((e) => {
      wx.showToast({title: "导入失败：" + e.message, icon: "none"})
    })
  }
})
