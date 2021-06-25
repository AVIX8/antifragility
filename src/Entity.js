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
        this.generation = generation ?? 0
        this.genom = genom ?? new Genom()
        this.isAlive = true
        this.sleep = 100

        this.setAttribute(this.genom)

        this.energyToSplit =  Math.pow(this.size, 2)
        this.energy = energy ? Math.min(energy, this.energyToSplit) : this.energyToSplit

        this.movingСost = Math.pow(this.speed, 3) * Math.pow(this.size, 2) / 15000000

        let color = rgbToHex(255, Math.floor(255 - this.omnivorous * 255), 0)

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
        this.material = new THREE.PointsMaterial({ size: this.genom.size, color })
        this.sceneObject = new THREE.Points(this.geometry, this.material)

        this.sceneObject.position.x = x
        this.sceneObject.position.y = y

        this.line

        world.scene.add(this.sceneObject)
    }

    setAttribute(obj) {
        for (const [key, value] of Object.entries(obj)) {
            this[key] = value
        }
    }

    clearLine() {
        if (this.line) {
            this.world.scene.remove(this.line)
            this.line.g.dispose()
            this.line.m.dispose()
            this.line = undefined
        }
    }

    drawLine(obj) {
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 50,
        })
        const points = []
        points.push(new THREE.Vector3(this.x, this.y, 0))
        points.push(new THREE.Vector3(obj.x, obj.y, 0))
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(geometry, material)
        line.g = geometry
        line.m = material
        this.line = line
        this.world.scene.add(line)
    }

    findNearestFood() {
        let resFood
        let nearestFoodDist = Number.POSITIVE_INFINITY

        this.world.food.forEach((food) => {
            if (food.isAlive) {
                let dist = this.dist(food)
                if (food.size < this.size && nearestFoodDist > dist) {
                    nearestFoodDist = dist
                    resFood = food
                }
            }
        })
        return resFood
    }

    findNearestEntity() {
        let resEntity
        let nearestEntityDist = Number.POSITIVE_INFINITY

        this.world.entities.forEach((entity) => {
            if (entity.isAlive) {

                let dist = this.dist(entity)
                if (
                    entity.size < this.size &&
                    Math.abs(entity.generation - this.generation) > 1.5 &&
                    nearestEntityDist > dist
                    ) {
                        nearestEntityDist = dist
                        resEntity = entity
                    }
            }
        })
        return resEntity
    }

    die() {
        this.isAlive = false
        this.world.scene.remove(this.sceneObject)
        this.geometry.dispose()
        this.material.dispose()
        this.clearLine()
    }

    split() {
        this.energy /= 2
        let newEntity = new Entity(
            this.world,
            this.x,
            this.y,
            this.generation + Math.random(),
            this.genom.getMutated(),
            this.energy
        )
        this.world.addEntity(newEntity)
    }

    eatFood(food) {
        if (this.size > food.size) {
            this.energy += food.energy * (1 - this.omnivorous) / 4
            food.die()
            this.sleep += 25
        }
    }

    eatEntity(entity) {
        if (entity.isAlive) {
            this.energy += entity.energy * this.omnivorous
            entity.die()
        }
        this.sleep += 300
    }

    getDecision(entity, food) {
        if (!food) return true
        let input = [this.omnivorous, this.dist(entity), entity.speed, entity.energy, entity.sleep, this.dist(food)].map(x => {return 1 / (1 + Math.exp(-x))})

        let res = 0
        for (let i = 0; i < input.length; i++) {
            let sum = 0;
            for (let j = 0; j < input.length; j++) {
                sum+=this.weights[i*input.length+j]*input[i]
            }
            res += sum
        }
        return res>0
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

    do() {
        if (this.energy < 0) {
            this.die()
            return
        }
        if (this.sleep) {
            this.sleep--
            return
        }
        if (this.energy > this.energyToSplit && this.world.entities.length < 2000) {
            this.split()
        } else {
            let entity = this.findNearestEntity()
            let food = this.findNearestFood()

            this.clearLine()
            if (entity && this.getDecision(entity, food)) {
                this.drawLine(entity)

                this.moveTo(entity)
                if (this.dist(entity) == 0) this.eatEntity(entity)
            } else if (food) {
                if (this.dist(food) == 0) this.eatFood(food)
                this.moveTo(food)
            }
        }
        this.energy -= 1
    }

    dist(obj) {
        return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2))
    }
}
