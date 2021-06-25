import * as THREE from './three.js'
import Food from './Food.js'
import Entity from './Entity.js'

export default class World {
    constructor(scene, camera, spaceHeight, spaceWidth) {
        this.scene = scene
        this.camera = camera
        this.width = spaceWidth
        this.height = spaceHeight
        this.ticks = 0

        this.isRunning = false
        this.tickDelay = 0
        this.intervalId = null

        this.foodPerTick = 1

        this.food = []
        this.entities = []

        for (let i = 0; i < 1000; i++) {
            let r = (Math.random() * this.height) / 2
            let a = Math.random() * Math.PI * 2
            let x = Math.cos(a) * r
            let y = Math.sin(a) * r
            let entity = new Entity(this, x, y)
            this.entities.push(entity)
            this.addRandomFood()
        }
    }

    start() {
        this.isRunning = true
        this.intervalId = setInterval(() => {
            this.tick()
        }, this.tickDelay)
    }

    stop() {
        this.isRunning = false
        clearInterval(this.intervalId)
    }

    clear() {
        this.stop()

        while (this.entities.length) {
            this.entities.pop().die()
        }

        while (this.food.length) {
            this.food.pop().die()
        }
    }

    generateFood() {
        for (let i = 0; i < this.foodPerTick && this.food.length < 1000; i++) {
            this.addRandomFood()
        }
    }

    addRandomFood() {
        let r = (Math.random() * this.height) / 2
        let a = Math.random() * Math.PI * 2
        let x = Math.cos(a) * r
        let y = Math.sin(a) * r
        let newFood = new Food(this, x, y)
        this.food.push(newFood)
    }

    removeFood(index) {
        this.food.splice(index, 1)
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    removeEntity(index) {
        this.entities.splice(index, 1)
    }

    static dist(obj1, obj2) {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2))
    }

    tick() {
        this.ticks += 1
        
        this.generateFood()

        let entityDel = []
        this.entities.forEach((entity, index) => {
            if (entity.isAlive) entity.do()
            if (!entity.isAlive) entityDel.push(index)
        })
        for (let i = 0; i < entityDel.length; i++) this.removeEntity(entityDel[i] - i)

        let foodDel = []
        this.food.forEach((food, index) => {
            if (!food.isAlive) foodDel.push(index)
        })
        for (let i = 0; i < foodDel.length; i++) this.removeFood(foodDel[i] - i)
    }
}
