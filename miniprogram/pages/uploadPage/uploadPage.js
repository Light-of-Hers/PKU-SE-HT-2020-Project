const fs = require("../../service/filesys");
const app = getApp();

Page({
    data: {
        cwd: null,
        files: [],
        needRerender: false,
        chan: null,
    },
    onLoad: function () {
        const self = this;
        const chan = self.getOpenerEventChannel();
        self.data.chan = chan;
        chan.on("passCwd", dir => self.changeDir(dir));
    },
    onShow: function () {
        const self = this;
        if (self.data.needRerender) {
            self.data.needRerender = false;
            self.render();
        }
    },
    render: function () {
        const self = this;
        console.log("rendering page...");
        self.data.files = Array.from(self.data.cwd.children.entries()).filter(item => item[1]).
            map(item => ({ name: item[1] instanceof fs.DirFile ? `${item[0]}/` : item[0], file: item[1] }));
        self.setData({
            files: self.data.files,
        });
    },
    changeDir: function (dir) {
        const self = this;
        if (dir instanceof fs.DirFile) {
            console.log(`change to directory: ${dir.name}`);
            self.data.cwd = dir;
            self.render();
        } else {
            console.error(`not a DirFile: ${dir}`);
        }
    },
    newDoc: function () {
        const self = this;
        self.data.needRerender = true;
        self.data.chan.emit("newFileCreated");
        app.globalData.tmp_arg = self.data.cwd;
        wx.navigateTo({
            url: '../newDocPage/newDocPage',
        });
    },
    newFolder: function () {
        const self = this;
        self.data.needRerender = true;
        self.data.chan.emit("newFileCreated");
        app.globalData.tmp_arg = self.data.cwd;
        wx.navigateTo({
            url: '../newFolderPage/newFolderPage',
        });
    },
    modifyFile: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const file = self.data.files[idx].file;
        if (file instanceof fs.DirFile) {
            console.log(`click DirFile: ${file.name}`);
            self.changeDir(file);
        } else if (file instanceof fs.DocFile) {
            console.log(`click DocFile: ${file.name}`);
            app.globalData.tmp_arg = file;
            wx.navigateTo({
                url: '../inputPage/inputPage',
            });
        }
    },
})