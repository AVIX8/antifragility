import Producer from './Producer.js'
import Consumer from './Consumer.js'

export default class World {
    #tickDelay

    constructor(scene, camera, spaceHeight, spaceWidth) {
        
        this.scene = scene
        this.camera = camera
        this.width = spaceWidth
        this.height = spaceHeight
        this.ticks = 0

        this.isRunning = false
        this.#tickDelay = 4
        this.intervalId = null

        this.producersPerTick = 1

        this.producers = []
        this.consumers = []
        this.createEntities()
    }

    set tickDelay(val) {
        this.stop()
        this.#tickDelay = val
        this.start()
    }

    createEntities(num = 100) {
        for (let i = 0; i < num; i++) {
            let r = (Math.random() * this.height) / 2
            let a = Math.random() * Math.PI * 2
            let x = Math.cos(a) * r
            let y = Math.sin(a) * r
            let consumer = new Consumer(this, x, y)
            this.consumers.push(consumer)
            this.addRandomProducer()
        }
    }

    start() {
        this.isRunning = true
        this.intervalId = setInterval(() => {
            this.tick()
        }, this.#tickDelay)
    }

    stop() {
        this.isRunning = false
        clearInterval(this.intervalId)
    }

    reset() {
        this.stop()
        while (this.consumers.length) this.consumers.pop().die()
        while (this.producers.length) this.producers.pop().die()
        this.createEntities()
    }

    addRandomProducer() {
        let r = (((Math.random() + 0.05) / 1.05) * this.height) / 2
        let a = Math.random() * Math.PI * 2
        let x = Math.cos(a) * r
        let y = Math.sin(a) * r
        let newProducer = new Producer(this, x, y)
        this.producers.push(newProducer)
    }

    removeProducer(index) {
        this.producers.splice(index, 1)
    }

    addConsumer(consumer) {
        this.consumers.push(consumer)
    }

    removeConsumer(index) {
        this.consumers.splice(index, 1)
    }

    tick() {
        this.ticks += 1

        let consumersDel = []
        this.consumers.forEach((consumer, index) => {
            if (consumer.isAlive) consumer.do()
            if (!consumer.isAlive) consumersDel.push(index)
        })
        for (let i = 0; i < consumersDel.length; i++) this.removeConsumer(consumersDel[i] - i)

        let producersDel = []
        this.producers.forEach((producer, index) => {
            if (!producer.isAlive) producersDel.push(index)
        })
        for (let i = 0; i < producersDel.length; i++) this.removeProducer(producersDel[i] - i)

        for (let i = 0; i < this.producersPerTick && this.producers.length < 2000; i++) this.addRandomProducer()
    }
}
