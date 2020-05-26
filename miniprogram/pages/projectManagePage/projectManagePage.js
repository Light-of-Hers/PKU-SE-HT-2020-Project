const fs = require("../../service/filesys");
const document = require("../../service/document")
const client = require("../../service/client")
const Project = require("../../service/project")
const time = require("./util")
const app = getApp();

Page({
    data: {
        projects: null,
        user: null,
        formatTime: []
    },
    onLoad: function () {
      this.setData({
        user: client.getUser()
      })
    },
    onShow: function () {
        this.render();
    },
    render: function() {
      const self = this;
      var format = []
      if (self.data.user) {
        self.setData({
          projects: self.data.user.projects
        })
  
        self.data.projects.forEach(function(item) {
          format.push(time.formatDate(item._time));
          console.log(time.formatDate(item._time));
        })
  
        self.setData({
          formatTime: format
        })
      }
    },
    onViewProject: function (event) {
        const idx = event.currentTarget.dataset.fileIndex;
        const project = this.data.projects[idx];
        app.globalData.tmp_arg = project;
        wx.navigateTo({
          url: '../projectPage/projectPage',
        })
        console.log(project.name);
    },
    deleteProject: function(event) {
      const self = this;
      const idx = event.currentTarget.dataset.fileIndex;
      const project = self.data.projects[idx];
      wx.showModal({
        title: '提示',
        content: `确认删除作品"${project.name}"？`,
        success (res) {
          if (res.confirm) {
            self.data.user.deleteProject(project.id);
            self.render();
          }
        }
      })
    },
    onNewProject: function () {
        app.globalData.tmp_arg = this.data.user;
        wx.navigateTo({
            url: '../newProjectPage/newProjectPage',
        });
    },
})