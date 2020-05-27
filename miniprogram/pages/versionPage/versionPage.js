const fs = require("../../service/filesys");
const document = require("../../service/document")
const time = require("../../utils/util")
const app = getApp();

Page({
    data: {
        versions: [],
        formatTime: []
    },
    onLoad: function() {
      wx.setNavigationBarTitle({
        title: app.globalData.tmp_arg.name
      })
    },
    onShow: function () {
        this.render();
    },
    render: function() {
      this.setData({
          versions: app.globalData.tmp_arg.versions
      })

      var format = [];
      this.data.versions.forEach(function(item) {
        format.push(time.formatDate(item.timestamp));
      })
      this.setData({
        formatTime: format
      })
    },
    onViewVersion: function (event) {
        const idx = event.currentTarget.dataset.fileIndex;
        app.globalData.tmp_index = idx;
        wx.navigateTo({
          url: `../viewPage/viewPage?version_id=${idx}`,
        })
      }
})