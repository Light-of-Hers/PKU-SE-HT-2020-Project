const app = getApp();
const fs = require("../../service/filesys");
const document = require("../../service/document");

Page({
    data: {
        newName: "",
        target: null,
        project: null,
    },
    onLoad: function () {
        const self = this;
        self.data.target = app.globalData.tmp_arg.target;
        self.data.project = app.globalData.tmp_arg.project;
    },
    bindNewName: function (event) {
        const self = this;
        self.data.newName = event.detail.value;
    },
    onRename: function () {
        const self = this;
        const { project, newName, target } = self.data;
        const dfs = file => {
            if (file instanceof fs.BaseFile) {
                project.renameDocument(file.doc.id, file.name, file.getPath());
                if (file instanceof fs.DirFile) {
                    file.children.forEach((_, child) => dfs(child));
                }
            }
        };
        if (target instanceof fs.BaseFile) {
            target.name = newName;
            dfs(target);
        } else if (target) {
            project.renameDocument(target.id, newName);
        }
        wx.navigateBack({
            delta: 1,
        });
    }
})