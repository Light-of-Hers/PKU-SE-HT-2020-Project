const fsys = require('../../service/filesys');
const app = getApp();

Page({
  data : {
    doc: null,
    input: ''
  },

  onLoad: function() {
    this.setData({
      doc: app.globalData.tmp_arg
    })
    wx.setNavigationBarTitle({
      title: this.data.doc.name
    })
    this.data.doc.doc.download()
    .then(() => {
      if(this.data.doc.doc.versions.length)
        this.setData({
          input: this.data.doc.doc.versions[0].content
        })
    })
  },
  inputChangeHandle: function(e) {
    this.setData({
      input: e.detail.value
    })
  },

  clearInput: function() {
    this.setData({
      input: ''
    })
  },

  updateFile: function() {
    this.data.doc.update(this.data.input)
    .then(function(res) {
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(function() {
        wx.navigateBack({})
      }, 2000)
    })
    .catch((e) => {
      console.error(e)
      wx.showModal({
        title: "提示",
        content: "上传失败",
        success (res) {
          if (res.confirm) {
            wx.navigateBack({})
          }
        }
      })
    })
  }
})
