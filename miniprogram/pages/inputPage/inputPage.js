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
  },
  inputChangeHandle: function(e) {
    this.setData({
      input: e.detail.value
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
