export default class Genom {
    constructor(genom = {}) {
        this.speed = genom.speed ?? this.random(5, 50)
        this.size = genom.size ?? this.random(50, 200)
        this.mutationChance = genom.mutationChance ?? this.random(0.1, 0.5)
        this.omnivorous = genom.omnivorous ?? this.random(0.1, 0.9) // 0 - травоядное; 1 - плотоядное
        this.entityWeight = genom.entityWeight ?? this.randomNormalDistribution(1, 0.5)
        this.foodWeight = genom.foodWeight ?? this.randomNormalDistribution(5, 1)
        this.weights = []

        this.weightsNumber = 6 * 6
        if (genom.weights) this.weights = Array.from(genom.weights)
        else for (let i = 0; i < this.weightsNumber; i++) this.weights.push(this.random(-1, 0.7))
    }

    getMutated() {
        let newGenom = new Genom(this)

        // >= 0
        let props = ['speed', 'size', 'mutationChance', 'entityWeight', 'foodWeight']
        props.forEach((prop) => {
            if (this.mutationChance > Math.random())
                newGenom[prop] = this.randomNormalDistribution(this[prop], this[prop] / 8)
        })
        newGenom.omnivorous = this.randomNormalDistribution(this.omnivorous, Math.min(this.omnivorous, 1-this.omnivorous)/2+0.2)
        if (newGenom.omnivorous < 0) newGenom.omnivorous = 0.04
        if (newGenom.omnivorous > 1) newGenom.omnivorous = 0.96

        if (newGenom.size < 50) newGenom.size *= 1.5

        for (let i = 0; i < newGenom.weights.length; i++) {
            if (this.mutationChance > Math.random())
                newGenom.weights[i] = this.randomNormalDistribution(
                    newGenom.weights[i],
                    Math.abs(newGenom.weights[i]) + 0.1
                )
        }

        return newGenom
    }

    randomNormalDistribution(x, deviation) {
        if (deviation == undefined) deviation = Math.abs(x * 1.5)
        let u = 0,
            v = 0
        while (u === 0) u = Math.random()
        while (v === 0) v = Math.random()
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

        num /= 5
        if (num > 1 || num < -1) return this.randomNormalDistribution(x, deviation)
        return x + num * deviation * 2
    }

    random(min, max) {
        return Math.random() * (max - min) + min
    }
}
