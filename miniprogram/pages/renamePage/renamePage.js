const app = getApp();
const fs = require("../../service/filesys");
const document = require("../../service/document");

Page({
    data: {
        newName: "",
        target: null,
    },
    onLoad: function () {
        const self = this;
        self.data.target = app.globalData.tmp_arg;
    },
    bindNewName: function (event) {
        const self = this;
        self.data.newName = event.detail.value;
    },
    onRename: function () {
        const dfs = file => {
            if (file instanceof fs.BaseFile) {
                file.doc.rename(file.name, file.getPath());
                if (file instanceof fs.DirFile) {
                    file.children.forEach((_, child) => dfs(child));
                }
            }
        };
        const self = this;
        const name = self.data.newName;
        const target = self.data.target;
        if (target instanceof document.Document) {
            target.rename(name);
        } else if (target instanceof fs.BaseFile) {
            target.name = name;
            dfs(target);
        }
        wx.navigateBack({
            delta: 1,
        });
    }
})