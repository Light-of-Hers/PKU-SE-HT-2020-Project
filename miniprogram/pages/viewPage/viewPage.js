const Document = require('../../service/document');
const app = getApp();
const time = require("../../utils/util")

Page({
  data: {
    doc: null, 
    curIndex: 0,
    curtime: null,
    curcontent: null,
    curHash: null,
    loading: true,
    needRender: true,
    history: null,
    downloadtime: null
  },
  onLoad: function(options) {
    this.setData({
      doc: app.globalData.tmp_arg,
      history: (options.version_id != undefined)? options.version_id: null
    });
    wx.setNavigationBarTitle({
      title: this.data.doc.name
    })
  },

  onShow: function() {
    if (this.data.needRender) {
      this.setData({
        needRender: false
      });
      if (!this.data.history) {
        this.render(0);
      }
      else {
        this.render(this.data.history);
      }
    }
  },

  render: function(idx) {
    const self = this;
    self.setData({
      doc: app.globalData.tmp_arg
    })

    const len = self.data.doc.versions.length;
    if (len != 0) {
      if (idx < len) {
        self.getVersion(idx);
      }
      else {
        self.getVersion(len - 1);
      }
    }
    else {
      self.setData({
        loading: false
      })
    }
  },

  oldVersion: function() {
    var tempIndex = this.data.curIndex + 1;
    if (tempIndex < this.data.doc.versions.length) {
        this.getVersion(tempIndex);
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
     this.getVersion(tempIndex);
    }
    else {
      wx.showModal({
        title: '提示',
        content: '当前版本已为最新版本'
      })
    }
  },

  updateFile: function() {
    this.setData({
      needRender: true
    })
    wx.navigateTo({
      url: '../inputPage/inputPage',
    });
  },

  getVersion: function(tempIndex) {
    const self = this;
    self.setData({
      loading: true
    });
    
    self.data.doc.versions[tempIndex].getContent().then(function(res) {
      console.log(res);
      self.setData({
        curIndex: tempIndex,
        curtime: time.formatDate(self.data.doc.versions[tempIndex].timestamp),
        curcontent: self.data.doc.type == 'text'? res.text: res.path,
        curHash: self.data.doc.versions[tempIndex].hashId.toString().substr(0, 20),
        loading: false,
        downloadtime: time.formatDate(new Date().toString())
      })
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
  },

  deleteVersion: function() {
    const self = this;
    wx.showModal({
      title: '提示',
      content: '确认删除当前版本？',
      success (res) {
        if (res.confirm) {
          const idx = self.data.curIndex;
          self.data.doc.deleteVersion(idx);
          self.render(idx);
        }
      }
    })
  },

  clickImg: function(e) {
    const self = this;
    wx.previewImage({
      urls: [self.data.curcontent]
    })
  },

  viewHistory: function() {
    wx.navigateTo({
      url: '../versionPage/versionPage',
    });
  },

  returnHistory: function() {
    wx.navigateBack({});
  }
})