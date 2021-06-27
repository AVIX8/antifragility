import * as THREE from './three.js'

export default class Square {
    #x
    #y
    #scene
    #geometry
    #material
    #sceneObject
    
    constructor(scene, x, y) {
        this.#scene = scene
        this.#x = x
        this.#y = y
        this.#sceneObject = {position: {}} //
        
        this.color
        this.size
    }

    get x() {
        return this.#x
    }

    set x(val) {
        this.#x = val
        this.#sceneObject.position.x = val
    }

    get y() {
        return this.#y
    }

    set y(val) {
        this.#y = val
        this.#sceneObject.position.y = val
    }

    startDrawing() {
        
        this.#geometry = new THREE.BufferGeometry()
        this.#geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))

        this.#material = new THREE.PointsMaterial({ color: this.color, size: this.size })
        this.#sceneObject = new THREE.Points(this.#geometry, this.#material)

        this.#sceneObject.position.x = this.#x
        this.#sceneObject.position.y = this.#y

        this.#scene.add(this.#sceneObject)
    }

    stopDrawing() {
        this.#scene.remove( this.#sceneObject );
        this.#geometry.dispose()
        this.#material.dispose()
    }
}