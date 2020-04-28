const fs = require('../../service/filesys');
const app = getApp();

Page({
  data: {
    allVersions: null, 
    curIndex: 0
  },

  onLoad: function() {
    const self = this;
    app.globalData.tmp_arg.getVersions().then(function(res) {
      self.setData({
        allVersions: res
      })
    })
    
    wx.setNavigationBarTitle({
      title: app.globalData.tmp_arg.name
    })
  },

  oldVersion: function() {
    var tempIndex = this.data.curIndex + 1;
    if (tempIndex < this.data.allVersions.length) {
      this.setData({
        curIndex: tempIndex
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '当前版本已为最早版本'
      })
    }
  },

  newVersion: function() {
    var tempIndex = this.data.curIndex - 1;
    if (tempIndex >= 0) {
      this.setData({
        curIndex: tempIndex
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '当前版本已为最新版本'
      })
    }
  }
})