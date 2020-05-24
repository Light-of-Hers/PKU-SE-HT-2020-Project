const fs = require("../../service/filesys");
const document = require("../../service/document")
const app = getApp();

Page({
    data: {
        project: null,
        cwd: null,
        files: [],
        needRerender: false,
    },
    onLoad: function () {
        const self = this; // 静态绑定this，仅个人习惯
        self.project = app.globalData.tmp_arg;
        if (!self.project.FSRoot)
            self.project.FSRoot = fs.buildFS(self.project.subDocuments);
        const dir = self.project.FSRoot;
        self.changeDir(dir);
    },
    onShow: function () {
        const self = this;
        if (self.data.needRerender) {
            self.data.needRerender = false;
            self.render();
        }
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
    render: function () {
        const self = this;
        console.log("rendering page...");
        self.data.files = Array.from(self.data.cwd.children.entries())
            .filter(item => item[1])
            .map(item => {
                const isDir = item[1] instanceof fs.DirFile;
                const isImage = !isDir && item[1].doc.type == "image";
                return {
                    name: isDir ? `${item[0]}/` : item[0],
                    type: isDir ? "dir" : isImage ? "img" : "txt",
                    file: item[1],
                };
            });
        self.setData({
            files: self.data.files,
        });
    },
    viewFile: function (file) {
        const self = this;
        if (file instanceof fs.DocFile) {
            console.log(`click DocFile: ${file.name}`);
            app.globalData.tmp_arg = file;
            wx.navigateTo({
                url: '../viewPage/viewPage',
            });
        } else if (file instanceof fs.DirFile) {
            console.log(`click DirFile: ${file.name}`);
            self.changeDir(file);
        }
    },
    onViewFile: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const file = self.data.files[idx].file;
        self.viewFile(file);
    },
    onNewDoc: function () {
        const self = this;
        self.data.needRerender = true;
        app.globalData.tmp_arg = self.data.cwd;
        wx.navigateTo({
            url: '../newDocPage/newDocPage',
        });
    },
    onNewFolder: function () {
        const self = this;
        self.data.needRerender = true;
        app.globalData.tmp_arg = self.data.cwd;
        wx.navigateTo({
            url: '../newFolderPage/newFolderPage',
        });
    },
    deleteFile: function (file) {
        const self = this;
        if (file instanceof fs.DocFile) {
            self.data.project.deleteDocument(file.getId());
        } else if (file instanceof fs.DirFile) {
            file.children.forEach((_, chld) => self.deleteFile(chlid));
            self.data.project.deleteDocument(file.getId());
        }
    },
    onDeleteFile: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const file = self.data.files[idx].file;
        if (file) {
            wx.showModal({
                title: "提示",
                content: `确定要删除${file instanceof fs.DirFile ? "文件夹" : "文件"}"${doc.name}"吗？`,
                success: res => {
                    if (res.confirm) {
                        self.deleteFile(file);
                        self.render();
                    } else if (res.cancel) {
                        return false;
                    }
                }
            });
        }
    }
})