import Genom from './Genom.js'
import * as THREE from './three.js'

function componentToHex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export default class Entity {
    constructor(world, x, y, generation, genom, energy) {
        this.world = world
        this.x = x
        this.y = y
        this.generation = generation ?? Math.random() * 1000000
        this.genom = genom ?? new Genom()
        this.isAlive = true
        this.sleep = 100

        this.setAttribute(this.genom)

        this.energy = energy ? Math.min(energy, this.energyToSplit) : this.energyToSplit

        // this.energyToSplit = Math.pow(this.size, 2)
        this.movingСost = Math.pow(this.speed, 2) * Math.pow(this.size, 2) / 1000000

        let color = rgbToHex(255, Math.floor(255 - this.omnivorous * 255), 0)

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
        this.material = new THREE.PointsMaterial({ size: this.genom.size, color })
        this.sceneObject = new THREE.Points(this.geometry, this.material)

        this.sceneObject.position.x = x
        this.sceneObject.position.y = y

        world.scene.add(this.sceneObject)
    }

    setAttribute(obj) {
        for (const [key, value] of Object.entries(obj)) {
            this[key] = value
        }
    }

    findNearestFood() {
        let foodIndex = Math.floor(Math.random() * this.world.food.length)
        let nearestFoodDist = this.dist(this.world.food[foodIndex])

        this.world.food.forEach((food, index) => {
            let dist = this.dist(food)
            if (food.size < this.size && nearestFoodDist > dist) {
                nearestFoodDist = dist
                foodIndex = index
            }
        })
        return [this.world.food[foodIndex], foodIndex]
    }

    findNearestEntity() {
        let entityIndex = 0
        let nearestEntityDist = this.dist(this.world.entities[0])
        let f = false

        this.world.entities.forEach((entity, index) => {
            let dist = this.dist(entity)
            if (
                entity.size < this.size*1.5 &&
                Math.abs(entity.generation - this.generation) > 2 &&
                entity.speed < this.speed &&
                nearestEntityDist > dist
            ) {
                nearestEntityDist = dist
                entityIndex = index
                f = true
            }
        })
        if (!f) entityIndex = -1
        return this.world.entities[entityIndex]
    }

    die() {
        this.isAlive = false
        this.world.scene.remove(this.sceneObject)
        this.geometry.dispose()
        this.material.dispose()
    }

    split(index) {
        this.energy /= 2
        let newEntity = new Entity(
            this.world,
            this.x,
            this.y,
            this.generation + 1,
            this.genom.getMutated(index),
            this.energy
        )
        this.world.addEntity(newEntity)
    }

    eat(food, foodIndex) {
        if (this.size > food.size) {
            this.energy += food.energy * (1 - this.omnivorous) / 2
            food.remove(foodIndex)
        }
    }

    eatEntity(entity) {
        if (entity.isAlive) {
            this.energy += entity.energy * this.omnivorous
            entity.die()
        }
    }

    moveTo(obj) {
        let dist = this.dist(obj)

        if (dist !== 0) {
            let movement = Math.min(this.speed, dist)
            let energyCost = this.movingСost * movement

            let dx = obj.x - this.x
            let dy = obj.y - this.y

            let k = movement / dist

            this.x += dx * k
            this.y += dy * k

            this.sceneObject.position.x = this.x
            this.sceneObject.position.y = this.y

            this.energy -= energyCost
        }
    }

    do(index) {
        if (this.energy < 0) {
            this.die()
            return
        }
        if (this.sleep) {
            this.sleep--
            return
        }
        if (this.energy > this.energyToSplit) {
            this.split(index)
        } else {
            let entity = this.findNearestEntity()
            let [food, foodIndex] = this.findNearestFood()

            // if (entity && this.entityWeight / this.dist(entity) > this.foodWeight / this.dist(food)) {
            if (entity && this.omnivorous*this.entityWeight/this.dist(entity)/entity.speed > (1-this.omnivorous)*this.foodWeight/this.dist(food)) {
                this.world.drawLine(this, entity)

                this.moveTo(entity)
                if (this.dist(entity) == 0) this.eatEntity(entity)
            } else {
                if (this.dist(food) == 0) this.eat(food, foodIndex)
                this.moveTo(food)
            }
        }
        this.energy -= 1
    }

    dist(obj) {
        return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2))
    }
}
