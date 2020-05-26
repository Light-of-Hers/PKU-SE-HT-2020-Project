const taas = require('./taas.js')
const Project = require('./project.js')

class User {
    constructor(name, credential) {
        this.name = name
        this.credential = credential
        this.projects = []
        this._time = 0
        this._nextid = 0
    }

    sync() {
        const data = {
            time: this._time,
            name: this.name,
            nextid: this._nextid,
            projects: this.projects.map((v) => {
                return {
                    id: v.id,
                    name: v.name   
                }
            })
        }
        return taas.executeContract({
            method: 'syncUser',
            arg: JSON.stringify(data)
        })
        .then((res) => {
            if(res.status != "Success") {
                console.log(res)
                throw new Error('executeContract status: ' + res.status)
            }
            const result = JSON.parse(res.result)
            if(result.needUpdateLocal) {
                const data = result.data
                this._time = data.time
                this.name = data.name
                this._nextid = data.nextid
                this.projects = data.projects.map((v) => {
                    return new Project(v.id, v.name)
                })
            }
        })
    }

    syncAll() {
        return this.sync()
        .then(() => {
            return Promise.all(this.projects.map((p) => {
                return p.syncAll()
            }))
        }) 
    }

    rename(name) {
        this.name = name
        this._time = new Date().getTime()
        return this.sync()
    }

    findProjectByID(id) {
        for(let p of this.projects) {
            if(p.id == id)
                return p
        }
        return undefined
    }

    createProject(name) {
        let p = new Project(this._nextid, name)
        this.projects.push(p)
        this._nextid++
        let time = new Date().getTime()
        this._time = time
        p._time = time
        return Promise.all([this.sync(), p.sync()])
        .then(() => {
            return p 
        })
    }

    deleteProject(id) {
        for(let i in this.projects) {
            if(this.projects[i].id == id) {
                this.projects.splice(i, 1)
                this._time = new Date().getTime()
                return this.sync()
            }
        }
        return Promise.reject(`Project with id=${id} not found`)
    }
}

module.exports = User