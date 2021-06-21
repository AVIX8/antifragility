import * as THREE from './three.js'
import Food from './Food.js'
import Entity from './Entity.js'

export default class World {
    constructor(scene, camera, spaceHeight, spaceWidth) {
        this.scene = scene
        this.camera = camera
        this.width = spaceWidth
        this.height = spaceHeight

        this.isRunning = false
        this.updateDelay = 0
        this.intervalId = null

        this.foodPerUpdate = 5

        this.food = []
        this.entities = []

        this.lines = []

        for (let i = 0; i < 200; i++) {
            let x = (Math.random() - 0.5) * this.width
            let y = (Math.random() - 0.5) * this.height
            let entity = new Entity(this, x, y)
            this.entities.push(entity)
        }
    }

    start() {
        this.isRunning = true
        this.intervalId = setInterval(() => {
            this.update()
        }, this.updateDelay)
    }

    stop() {
        this.isRunning = false
        clearInterval(this.intervalId)
    }

    drawLine(obj1, obj2) {
        if (this.lines.length > this.entities.length) {
            this.scene.remove(this.lines[0])
            this.lines[0].g.dispose()
            this.lines[0].m.dispose()
            this.lines[0] = undefined
            this.lines.shift()
        }

        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 50,
        })
        const points = []
        points.push(new THREE.Vector3(obj1.x, obj1.y, 0))
        points.push(new THREE.Vector3(obj2.x, obj2.y, 0))
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(geometry, material)
        line.g = geometry
        line.m = material
        this.lines.push(line)
        this.scene.add(line)
    }

    generateFood() {
        for (let i = 0; i < this.foodPerUpdate && this.food.length < 2000; i++) {
            let x = (Math.random() - 0.5) * this.width
            let y = (Math.random() - 0.5) * this.height
            let newFood = new Food(this, x, y)
            this.food.push(newFood)
        }
    }

    removeFood(index) {
        this.food[index] = null
        this.food.splice(index, 1)
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    removeEntity(index) {
        this.entities[index] = null
        this.entities.splice(index, 1)
    }

    static dist(obj1, obj2) {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2))
    }

    update() {
        this.generateFood()
        let toDel = []
        let cam
        let systemEnergy = 0
        this.entities.forEach((entity, index) => {
            if (entity.isAlive) {
                systemEnergy+=entity.energy
                entity.do(index)
                if (entity.omnivorous > 0.5 && cam == undefined) {
                    cam = entity
                } 
            }
            else toDel.push(index)
        })
        for (let i = 0; i < toDel.length; i++) this.removeEntity(toDel[i] - i)
        // console.log(this.food.length)
        
        // this.camera.position.x = cam.x
        // this.camera.position.y = cam.y
        // console.log('generation:\t', this.entities[0].generation)
        // console.log(systemEnergy);
        // console.log();
    }
}
