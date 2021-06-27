import Square from './Square.js'

export default class Producer extends Square{
    constructor(world, x, y) {
        super(world.scene, x, y)
        
        this.isAlive = true
        this.size = Math.random()*50+50
        this.energy = Math.pow(this.size, 2)
        
        this.color = '#00DD00'
        this.startDrawing()
    }

    die() {
        this.isAlive = false
        this.stopDrawing()
    }
}
