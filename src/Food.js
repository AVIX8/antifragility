import * as THREE from './three.js'

export default class Food {
    constructor(world, x, y) {
        this.isAlive = true
        this.world = world
        this.x = x
        this.y = y
        this.size = this.random(50,100)
        this.energy = Math.pow(this.size, 2)

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0], 3))
        this.material = new THREE.PointsMaterial({ size: this.size, color: '#00DD00' })
        this.sceneObject = new THREE.Points(this.geometry, this.material)

        this.sceneObject.position.x = x
        this.sceneObject.position.y = y

        world.scene.add(this.sceneObject)
    }

    die() {
        this.isAlive = false
        this.world.scene.remove( this.sceneObject );
        this.geometry.dispose()
        this.material.dispose()
    }

    random(min, max) {
        return Math.random() * (max - min) + min
    }
}
