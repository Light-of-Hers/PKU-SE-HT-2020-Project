const taas = require('./taas.js')
const Project = require('./project.js')

class User {
    constructor(name, credential) {
        this.name = name
        this.credential = credential
        this.projects = []
        this.lastSyncTime = 0
        this._nextid = 0
    }

    sync() {

    }

    syncProjects() {
        return Promise.all(this.projects.map((p) => {
            return p.sync()
        }))
    }

    rename() {

    }

    findProjectByID(id) {

    }

    createProject(name) {

    }

    deleteProject(id) {

    }
}

module.exports = User