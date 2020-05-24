const Document = require('./document.js')
const taas = require('./taas.js')
const {buildFS} = require('./filesys.js')

class Project {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.mainDocuments = []
        this.subDocuments = []
        this.FSRoot = buildFS(this.subDocuments)
        this._time = 0
        this._nextid = 0
    }

    sync() {
        const data = {
            id: this.id,
            time: this._time,
            name: this.name,
            nextid: this._nextid,
            mainDocuments: this.mainDocuments.map((v) => {
                return {
                    id: v.id,
                    name: v.name,
                    type: v.type   
                }
            }),
            subDocuments: this.subDocuments.map((v) => {
                return {
                    id: v.id,
                    name: v.name,
                    type: v.type,
                    path: v.path
                }
            })
        }
        return taas.executeContract({
            method: 'syncProject',
            arg: JSON.stringify(data)
        })
        .then((res) => {
            console.log(res)
            if(res.status != "Success") {
                throw new Error('executeContract status: ' + res.status)
            }
            const result = JSON.parse(res.result)
            if(result.needUpdateLocal) {
                const data = result.data
                this._time = data.time
                this.name = data.name
                this._nextid = data.nextid
                this.mainDocuments = data.mainDocuments.map((v) => {
                    return new Document({...v, isMain: true})
                })
                this.subDocuments = data.subDocuments.map((v) => {
                    return new Document({...v, isMain: false})
                })
                this.FSRoot = buildFS(this.subDocuments)
            }
        })        
    }

    syncDocuments() {
        return Promise.all([
            Promise.all(this.mainDocuments.map((d) => {
                return d.sync()
            })),
            Promise.all(this.subDocuments.map((d) => {
                return d.sync()
            }))
        ])
    }

    findDocumentByID(id) {
        for(let d of this.mainDocuments.concat(this.subDocuments)) {
            if(d.id == id)
                return d
        }
        return undefined
    }

    createMainDocument(name, type) {
        const d = new Document({
            id: this._nextid,
            name: name,
            type: type,
            isMain: true
        })
        this.mainDocuments.push(d)
        const time = new Date().getTime()
        this._time = time
        d._time = time
        return Promise.all(this.sync(), d.sync())
    }

    createSubDocument(name, type, path) {
        const d = new Document({
            id: this._nextid,
            name: name,
            type: type,
            path: path,
            isMain: false
        })
        this.subDocuments.push(d)
        const time = new Date().getTime()
        this._time = time
        d._time = time
        this.FSRoot = buildFS(this.subDocuments)
        return Promise.all(this.sync(), d.sync())
    }

    deleteDocument(id) {
        for(let i in this.mainDocuments) {
            if(this.mainDocuments[i].id == id) {
                this.mainDocuments.splice(i, 1)
                this._time = new Date().getTime()
                return this.sync()
            }
        }
        for(let i in thie.subDocuments) {
            if(this.subDocuments[i].id == id) {
                this.subDocuments.splice(i, 1)
                this._time = new Date().getTime()
                this.FSRoot = buildFS(this.subDocuments)
                return this.sync()
            }
        }
        return Promise.reject(`Document with id=${id} not found`)
    }
} 

module.exports = Project