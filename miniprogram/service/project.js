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
        return Promise.resolve()
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
        
    }

    createMainDocument(name) {

    }

    createSubDocument(name, path) {

    }

    deleteDocument(id) {

    }
} 

module.exports = Project