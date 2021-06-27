import Genom from './Genom.js'
import Square from './Square.js'
import * as THREE from './three.js'

export default class Consumer extends Square {
    constructor(world, x, y, genom, energy) {
        super(world.scene, x, y)
        this.world = world

        this.genom = genom ?? new Genom({}, 36)

        this.sleep = 100
        this.isAlive = true

        this.setProperties(this.genom)

        this.energyToSplit = Math.pow(this.size, 2)
        this.energy = energy ? Math.min(energy, this.energyToSplit) : this.energyToSplit

        this.movingСost = (Math.pow(this.speed, 3) * Math.pow(this.size, 2)) / 15000000

        this.color = `rgb(255, ${Math.floor(255 - this.omnivorous * 255)}, 0)`
        this.startDrawing()

        this.line
    }

    setProperties(obj) {
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
        })
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(this.x, this.y, 0),
            new THREE.Vector3(obj.x, obj.y, 0),
        ])
        const line = new THREE.Line(geometry, material)
        line.g = geometry
        line.m = material
        this.line = line
        this.world.scene.add(line)
    }

    findNearestProducer() {
        let resProducer
        let nearestProducerDist = Number.POSITIVE_INFINITY

        this.world.producers.forEach((producer) => {
            if (producer.isAlive) {
                let dist = this.dist(producer)
                if (nearestProducerDist > dist && producer.size < this.size) {
                    nearestProducerDist = dist
                    resProducer = producer
                }
            }
        })
        return resProducer
    }

    findNearestConsumer() {
        let resConsumer
        let nearestConsumerDist = Number.POSITIVE_INFINITY

        this.world.consumers.forEach((consumer) => {
            if (consumer.isAlive) {
                let dist = this.dist(consumer)
                if (
                    nearestConsumerDist > dist &&
                    consumer.size < this.size &&
                    Math.abs(consumer.species - this.species) > 1.5
                ) {
                    nearestConsumerDist = dist
                    resConsumer = consumer
                }
            }
        })
        return resConsumer
    }

    die() {
        this.isAlive = false
        this.stopDrawing()
        this.clearLine()
    }

    split() {
        this.energy /= 2
        let newConsumer = new Consumer(this.world, this.x, this.y, this.genom.getMutated(), this.energy)
        this.world.addConsumer(newConsumer)
    }

    eatProducer(producer) {
        if (this.size > producer.size) {
            this.energy += (producer.energy * (1 - this.omnivorous)) / 4
            producer.die()
            this.sleep += 25
        }
    }

    eatConsumer(consumer) {
        if (consumer.isAlive) {
            this.energy += consumer.energy * this.omnivorous
            consumer.die()
        }
        this.sleep += 300
    }

    getDecision(consumer, producer) {
        if (!producer) return true
        let input = [
            this.omnivorous,
            this.dist(producer),
            this.dist(consumer),
            consumer.speed,
            consumer.energy,
            consumer.sleep,
        ].map((x) => {
            return 1 / (1 + Math.exp(-x))
        })

        let res = 0
        for (let i = 0; i < input.length * input.length; i++) {
            res += input[i % input.length] * this.weights[i]
        }
        return res > 0
    }

    moveTo(obj) {
        let dist = this.dist(obj)
        if (dist != 0) {
            let movement = Math.min(this.speed, dist)
            let energyCost = this.movingСost * movement
    
            let k = movement / dist
            this.x += (obj.x - this.x) * k
            this.y += (obj.y - this.y) * k
    
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
        if (this.energy > this.energyToSplit && this.world.consumers.length < 2000) {
            this.split()
        } else {
            let consumer = this.findNearestConsumer()
            let producer = this.findNearestProducer()

            this.clearLine()
            if (consumer && this.getDecision(consumer, producer)) {
                this.drawLine(consumer)

                this.moveTo(consumer)
                if (this.dist(consumer) == 0) this.eatConsumer(consumer)
            } else if (producer) {
                if (this.dist(producer) == 0) this.eatProducer(producer)
                this.moveTo(producer)
            }
        }
        this.energy -= 1
    }

    dist(obj) {
        return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2))
    }
}
