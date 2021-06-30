export default class Genom {
    constructor(genom = {}, weightsNumber) {
        this.mutationChance = genom.mutationChance ?? this.random(0.1, 0.9)
        
        this.species = genom.species ?? 0
        this.speed = genom.speed ?? this.random(5, 20)
        this.size = genom.size ?? this.random(75, 150)
        this.omnivorous = genom.omnivorous ?? this.random(0.05, 0.95) // 0 - травоядное; 1 - плотоядное
        
        this.weights = []
        if (genom.weights) this.weights = Array.from(genom.weights)
        else for (let i = 0; i < weightsNumber; i++) this.weights.push(this.random(-1, 0.7))
    }

    getMutated() {
        let newGenom = new Genom(this)

        let props = ['speed', 'size', 'mutationChance']
        props.forEach((prop) => {
            if (this.mutationChance > Math.random())
                newGenom[prop] = this.randomNormalDistribution(this[prop], this[prop] / 4)
        })

        newGenom.omnivorous = this.randomNormalDistribution(this.omnivorous, Math.min(this.omnivorous, 1-this.omnivorous)+0.4)
        if (newGenom.omnivorous < 0) newGenom.omnivorous = 0.05
        else if (newGenom.omnivorous > 1) newGenom.omnivorous = 0.95


        for (let i = 0; i < newGenom.weights.length; i++) {
            if (this.mutationChance > Math.random())
                newGenom.weights[i] = this.randomNormalDistribution(
                    newGenom.weights[i],
                    Math.abs(newGenom.weights[i]*2) + 0.2
                )
        }
        newGenom.species += this.mutationChance
        return newGenom
    }

    randomNormalDistribution(x, deviation) {
        let u = 0,
            v = 0
        while (u === 0) u = Math.random()
        while (v === 0) v = Math.random()
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

        num /= 5
        if (num > 1 || num < -1) return this.randomNormalDistribution(x, deviation)
        return x + num * deviation
    }

    random(min, max) {
        return Math.random() * (max - min) + min
    }
}
