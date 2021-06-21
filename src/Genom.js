export default class Genom {
    constructor(genom = {}) {
        this.speed = genom.speed ?? this.random(5, 50)
        this.size = genom.size ?? this.random(50, 100)
        this.energyToSplit = genom.energyToSplit ?? Math.pow(this.size, 2)
        this.mutationChance = genom.mutationChance ?? this.random(0.1, 0.2)
        this.omnivorous = this.random(0, 1) // 0 - травоядное; 1 - плотоядное
        this.entityWeight = this.randomNormalDistribution(0.25,0.25)
        this.foodWeight = this.randomNormalDistribution(5,1)
    }

    getMutated(index) {
        let newGenom = new Genom(this)

        // >= 0
        let props = ['speed', 'size', 'mutationChance', 'entityWeight', 'foodWeight', 'energyToSplit']
        props.forEach((prop) => {
            if (this.mutationChance > Math.random())
                newGenom[prop] = this.randomNormalDistribution(this[prop], this[prop] / 10)
            if (index == 0) console.log(prop, this[prop], '->', newGenom[prop]);
        })
        props.omnivorous = this.randomNormalDistribution(
            this.omnivorous,
            Math.min(this.omnivorous, 1 - this.omnivorous) / 10
        )
        if (newGenom.size < 50) newGenom.size *= 1.5
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
