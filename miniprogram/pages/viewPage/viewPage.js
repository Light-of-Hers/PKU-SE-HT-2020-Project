const fs = require('../../service/filesys');
const Document = require('../../service/document');
const app = getApp();
const time = require('util')

Page({
  data: {
    doc: null, 
    curIndex: 0,
    curtime: null,
    curtext: null,
    curpath: null,
    loading: true
  },
  onLoad: function() {
    this.setData({
      doc: app.globalData.tmp_arg
    });
    wx.setNavigationBarTitle({
      title: this.data.doc.name
    })
  },

  onShow: function() {
    const self = this;
    if (self.data.doc.versions.length != 0) {
      self.data.doc.versions[0].getContent().then(function(res) {
        self.setData({
          curtime: time.formatDate(self.data.doc.versions[0].timestamp),
          curtext: res.text,
          curpath: res.path,
          loading: false
        })
      }) .catch((e) => {
        console.error(e);const fs = require('../../service/filesys');
const Document = require('../../service/document');
const app = getApp();
const time = require('util')

Page({
  data: {
    doc: null, 
    curIndex: 0,
    curtime: null,
    curcontent: null,
    loading: true
  },
  onLoad: function() {
    this.setData({
      doc: app.globalData.tmp_arg
    });
    wx.setNavigationBarTitle({
      title: this.data.doc.name
    })
  },

  onShow: function() {
    this.render(0);
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
      self.setData({
        curIndex: tempIndex,
        curtime: time.formatDate(self.data.doc.versions[tempIndex].timestamp),
        curcontent: self.data.doc.type == 'text'? res.text: res.path,
        loading: false
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
  }
})
        wx.showModal({
          title: "提示",
          content: "数据加载失败",
          success (res) {
            wx.navigateBack({})
          }
        })
      })
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
        this.changeVersion(tempIndex);
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
     this.changeVersion(tempIndex);
    }
    else {
      wx.showModal({
        title: '提示',
        content: '当前版本已为最新版本'
      })
    }
  },

  updateFile: function() {
    wx.navigateTo({
      url: '../inputPage/inputPage',
    });
  },

  changeVersion: function(tempIndex) {
    const self = this;
    self.setData({
      loading: true
    });
    
    self.data.doc.versions[tempIndex].getContent().then(function(res) {
      self.setData({
        curIndex: tempIndex,
        curtime: time.formatDate(self.data.doc.versions[tempIndex].timestamp),
        curtext: res.text,
        curpath: res.path,
        loading: false
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
  }
})