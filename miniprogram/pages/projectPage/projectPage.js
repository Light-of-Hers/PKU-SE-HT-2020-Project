const fs = require("../../service/filesys");
const document = require("../../service/document");
const app = getApp();
const time = require("../../utils/util");

Page({
    data: {
        user: null,
        project: null,
        docs: null,
        needRerender: false,
    },
    onLoad: function () {
        const self = this;
        self.data.project = app.globalData.tmp_arg.project;
        self.data.user = app.globalData.tmp_arg.user;
        self.render();
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
        self.setData({
            docs: self.data.project.mainDocuments
        });
    },
    onOpenSupport: function () {
        const self = this;
        app.globalData.tmp_arg = self.data.project;
        wx.navigateTo({
            url: '../browsePage/browsePage',
        });
    },
    onNewMainDoc: function () {
        const self = this;
        self.data.needRerender = true;
        app.globalData.tmp_arg = self.data.project;
        wx.navigateTo({
            url: '../newMainDocPage/newMainDocPage',
        });
    },
    onViewMainDoc: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const doc = self.data.docs[idx];
        app.globalData.tmp_arg = doc;
        wx.navigateTo({
            url: '../viewPage/viewPage',
        })
    },
    onManipulateMainDoc: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const doc = self.data.docs[idx];
        const itemList = ['删除', '重命名'];
        wx.showActionSheet({
            itemList: itemList,
            success: res => {
                const action = itemList[res.tapIndex];
                if (action === "删除") {
                    wx.showModal({
                        title: '提示',
                        content: `确认删除主文档“${doc.name}”？`,
                        success: res => {
                            if (res.confirm) {
                                self.data.project.deleteDocument(doc.id);
                                self.render();
                            }
                        },
                    });
                } else if (action === "重命名") {
                    self.data.needRerender = true;
                    app.globalData.tmp_arg = { target: doc, project: self.data.project };
                    wx.navigateTo({
                        url: '../renamePage/renamePage',
                    });
                }
            }
        });
    },
    onCreateCertificate: function () {
        const self = this;
        const { project, user } = self.data;
        let max_ver = null, min_ver = null;
        const iter = docs => {
            for (const doc of docs) {
                for (const ver of doc.versions) {
                    if (!max_ver || ver.timestamp > max_ver.timestamp)
                        max_ver = ver;
                    if (!min_ver || ver.timestamp < min_ver.timestamp)
                        min_ver = ver;
                }
            }
        };
        iter(project.mainDocuments);
        iter(project.subDocuments);
        if (!min_ver) {
            wx.showToast({
                title: '您的作品好像还没有开始动诶……',
            });
            return;
        }
        user.createCertificate(project.id).then(({ time: cur_time, content }) => {
            app.globalData.tmp_arg = {
                time0: time.formatDate(min_ver.timestamp),
                time1: time.formatDate(max_ver.timestamp),
                hash0: min_ver.hashId,
                hash1: max_ver.hashId,
                author: user.name,
                name: project.name,
                time: time.formatDate(cur_time),
                content: content,
                publicKey: user.credential.publicKey,
            };
            console.log(cur_time);
            wx.navigateTo({
                url: '../certificatePage/certificatePage',
            });
        });
    },
})