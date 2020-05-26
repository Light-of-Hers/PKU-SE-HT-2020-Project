const fsys = require('../../service/filesys');
const app = getApp();

Page({
  data : {
    doc: null,
    input: '',
    imgpath: ''
  },

  onLoad: function() {
    const self = this;
    self.setData({
      doc: app.globalData.tmp_arg
    })
    wx.setNavigationBarTitle({
      title: self.data.doc.name
    })

    if (self.data.doc.versions.length) {
      self.data.doc.versions[0].getContent().then(function (res) {
        self.setData({
          input: res.text,
          imgpath: res.path
        })
      })
    }
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
    this.data.doc.createVersion({"text": this.data.input})
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
  },
  getImg: function() {
    const self = this;
    wx.chooseImage({
      success: function(res) {
        self.setData({
          imgpath: res.tempFilePaths[0]
        })
      }
    })
  },

  updateImg: function() {
    this.data.doc.createVersion({"path": this.data.imgpath})
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
  },

  clickImg: function(e) {
    const self = this;
    wx.previewImage({
      urls: [self.data.imgpath]
    })
  }
})
