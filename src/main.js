import * as THREE from './three.js'
import TopViewCamera from './TopViewCamera.js'
import World from './World.js'

let width = window.innerWidth
let height = window.innerHeight

let renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

let spaceHeight = 10000
let spaceWidth = 10000

let scene = new THREE.Scene()
let camera = new TopViewCamera(width, height, spaceHeight, renderer.domElement)
let world = new World(scene, camera, spaceHeight, spaceWidth)


world.start()

window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight

    renderer.setSize(width, height)
    camera.setSize(width, height)
})

scene.background = new THREE.Color(0x35363a)

let follow

function animate() {
    if(follow) {
        let cam
        if (follow == 'Y')
            for (let i = 0; i < world.entities.length; i++) {
                const entity = world.entities[i];
                if (entity.omnivorous < 0.5) {
                    cam = entity
                    break  
                }
            } 
        else 
            for (let i = 0; i < world.entities.length; i++) {
                const entity = world.entities[i];
                if (entity.omnivorous > 0.5) {
                    cam = entity
                    break  
                }
            } 
        
        camera.position.x = cam.x
        camera.position.y = cam.y
    }


    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

document.getElementById('freeCam').addEventListener('click', ()=>{
    follow = false
})

document.getElementById('followY').addEventListener('click', ()=>{
    follow = 'Y'
})

document.getElementById('followR').addEventListener('click', ()=>{
    follow = 'R'
})