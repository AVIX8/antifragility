import * as THREE from './three.js'
import TopViewCamera from './TopViewCamera.js'
import World from './World.js'

function componentToHex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

let width = window.innerWidth
let height = window.innerHeight

let renderer = new THREE.WebGLRenderer({precision: "lowp", powerPreference: "high-performance"})
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

let energy = document.getElementById('energy')
let producersPerTick = document.getElementById('producersPerTick')
let tickDelay = document.getElementById('tickDelay')
let food = document.getElementById('food')
let show = document.getElementById('show')
let tps = document.getElementById('tps')
let distribution = document.getElementById('distribution')

let distributionElements = []
for (let i = 0; i < 10; i++) {
    let newElement = document.createElement('div');
    newElement.style.backgroundColor = rgbToHex(255, Math.floor(255 - i * 25.5), 0)
    newElement.style.color = i < 5 ? '#000000' : '#ffffff'
    newElement.style.textAlign = 'right'
    newElement.style.paddingRight = '5px'
    newElement.innerHTML = 0
    distribution.appendChild(newElement);
    distributionElements.push(newElement)
}


let follow
function animate() {
    let systemEnergy = 0
    let foodEnergy = 0
    let selected
    let dist = new Array(10).fill(0)

    for (let i = 0; i < world.entities.length; i++) {
        const entity = world.entities[i]
        if (
            selected == undefined &&
            ((follow == 'Y' && entity.omnivorous < 0.2) || (follow == 'R' && entity.omnivorous > 0.8))
        ) {
            selected = entity
        }
        systemEnergy += entity.energy
        dist[Math.floor(entity.omnivorous*10)] += 1
    }

    for (let i = 0; i < world.food.length; i++) {
        const food = world.food[i]
        foodEnergy += food.energy
    }

    if (selected) {
        camera.position.x = selected.x ?? 0
        camera.position.y = selected.y ?? 0
    }

    energy.innerText = Math.floor(systemEnergy)
    food.innerText = Math.floor(foodEnergy)

    for (let i = 0; i < 10; i++) {
        distributionElements[i].innerHTML = dist[i]
    }
    // console.log(show.checked);
    if (show.checked) renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

setInterval(() => {
    tps.innerText = world.ticks*5
    world.ticks = 0
}, 200)

document.getElementById('freeCam').addEventListener('click', () => {
    follow = false
})

document.getElementById('followY').addEventListener('click', () => {
    follow = 'Y'
})

document.getElementById('followR').addEventListener('click', () => {
    follow = 'R'
})

document.getElementById('toggle').addEventListener('click', () => {
    if (world.isRunning) {
        world.stop()
        document.getElementById('toggle').innerText = 'Возобновить'
    } else {
        world.start()
        document.getElementById('toggle').innerText = 'Приостановить'
    }
})

document.getElementById('reset').addEventListener('click', () => {
    world.clear()
    world = new World(scene, camera, spaceHeight, spaceWidth)
    document.getElementById('toggle').innerText = 'Возобновить'
})
producersPerTick.addEventListener('change', () => {
    world.foodPerTick = producersPerTick.value
})
tickDelay.addEventListener('change', () => {
    world.stop()
    world.tickDelay = tickDelay.value
    world.start()
})
