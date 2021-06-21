import { PerspectiveCamera } from './three.js'
export default class TopViewCamera extends PerspectiveCamera {
    constructor(width, height, spaceHeight, canvas) {
        super()

        this.fov = 50
        this.fovRatio = Math.tan((this.fov * Math.PI) / 360) * 2 // отношение высоты пространства к расстоянию до камеры

        this.position.set(0, 0, spaceHeight / this.fovRatio)
        this.far = (spaceHeight / this.fovRatio) * 2
        this.near = spaceHeight / this.fovRatio / 512

        this.setSize(width, height)

        this.isMouseDown = false

        canvas.addEventListener('mousewheel', (e) => this.onMouseZoom(e), false)
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
        canvas.addEventListener('mousedown', () => (this.isMouseDown = true), false)
        canvas.addEventListener('mouseup', () => (this.isMouseDown = false), false)
    }

    updateMoveScale() {
        this.moveScale = (this.fovRatio * this.position.z) / this.height
    }

    setSize(width, height) {
        this.width = width
        this.height = height
        this.aspect = width / height
        this.updateMoveScale()
        this.updateProjectionMatrix()
    }

    onMouseMove(event) {
        if (this.isMouseDown) {
            this.position.x -= event.movementX * this.moveScale
            this.position.y += event.movementY * this.moveScale
        }
    }

    onMouseZoom(event) {
        let newZ = this.position.z * (1 - event.wheelDeltaY / 1024)
        if (newZ > this.far || newZ < this.near) return

        let k = ((this.position.z - newZ) * this.fovRatio) / this.height

        this.position.x += (event.x - this.width / 2) * k
        this.position.y -= (event.y - this.height / 2) * k
        this.position.z = newZ

        this.updateMoveScale()
    }
}
