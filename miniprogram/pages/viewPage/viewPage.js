const fs = require('../../service/filesys');
const app = getApp();
const time = require('util')

Page({
  data: {
    allVersions: null, 
    curIndex: 0,
    curtime: null,
    loading: true
  },

  onLoad: function() {
    const self = this;
    app.globalData.tmp_arg.getVersions().then(function(res) {
      self.setData({
        allVersions: res,
        loading: false
      })

      if (self.data.allVersions.length) {
        self.setData({
          curtime: time.formatDate(self.data.allVersions[self.data.curIndex].timestamp)
        })
      }
    }) .catch((e) => {
      console.error(e);
      wx.showModal({
        title: "提示",
        content: "数据加载失败",
        success (res) {
          wx.navigateBack({})
        }
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
        curIndex: tempIndex,
        curtime: time.formatDate(this.data.allVersions[tempIndex].timestamp)
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
        curIndex: tempIndex,
        curtime: time.formatDate(this.data.allVersions[tempIndex].timestamp)
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