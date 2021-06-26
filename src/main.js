import * as THREE from './three.js'
import TopViewCamera from './TopViewCamera.js'
import World from './World.js'

let width = window.innerWidth
let height = window.innerHeight

let renderer = new THREE.WebGLRenderer({ precision: 'lowp', powerPreference: 'high-performance' })
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

let spaceHeight = 10000
let spaceWidth = 10000

let scene = new THREE.Scene()
scene.background = new THREE.Color(0x35363a)

let camera = new TopViewCamera(width, height, spaceHeight, renderer.domElement)
let world = new World(scene, camera, spaceHeight, spaceWidth)

world.start()


let consumersEnergy = document.getElementById('consumersEnergy')
let producersEnergy = document.getElementById('producersEnergy')
let show = document.getElementById('show')
let tps = document.getElementById('tps')
let distribution = document.getElementById('distribution')

let distributionElements = []
for (let i = 0; i < 10; i++) {
    let distributionBar = document.createElement('div')
    
    distributionBar.style.backgroundColor = `rgb(255, ${Math.floor(255 - i * 25.5)}, 0)`
    distributionBar.style.color = i < 5 ? '#000000' : '#ffffff'
    distributionBar.classList.add('distribution-bar')
    distributionBar.innerHTML = 0
    
    distribution.appendChild(distributionBar)
    distributionElements.push(distributionBar)
}

let follow
function animate() {
    let selected

    if (follow)
        for (let i = 0; i < world.consumers.length; i++) {
            const consumer = world.consumers[i]
            if (
                ((follow == 1 && consumer.omnivorous < 0.2) || (follow == 2 && consumer.omnivorous > 0.8))
            ) {
                selected = consumer
                break
            }
        }

    if (selected) {
        camera.position.x = selected.x ?? 0
        camera.position.y = selected.y ?? 0
    }

    if (show.checked) renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

setInterval(() => {
    let consEnergy = 0
    let prodEnergy = 0
    let dist = new Array(10).fill(0)

    for (let i = 0; i < world.consumers.length; i++) {
        const consumer = world.consumers[i]
        consEnergy += consumer.energy
        dist[Math.floor(consumer.omnivorous * 10)] += 1
    }

    for (let i = 0; i < world.producers.length; i++) {
        const producer = world.producers[i]
        prodEnergy += producer.energy
    }

    consumersEnergy.innerText = Math.floor(consEnergy)
    producersEnergy.innerText = Math.floor(prodEnergy)

    let maxDist = Math.max.apply(Math, dist);
    for (let i = 0; i < 10; i++) {
        distributionElements[i].innerHTML = dist[i]
        distributionElements[i].style.setProperty('width', `${dist[i]*90/maxDist+10}%`);
    }

    tps.innerText = world.ticks
    world.ticks = 0
}, 1000)

window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight

    renderer.setSize(width, height)
    camera.setSize(width, height)
})

document.getElementById('freeCam').addEventListener('click', () => {
    follow = undefined
})

document.getElementById('follow1').addEventListener('click', () => {
    follow = 1
})

document.getElementById('follow2').addEventListener('click', () => {
    follow = 2
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
    world.reset()
    document.getElementById('toggle').innerText = 'Возобновить'
})

let producersPerTick = document.getElementById('producersPerTick')
producersPerTick.addEventListener('change', () => {
    world.producersPerTick = producersPerTick.value
})

let tickDelay = document.getElementById('tickDelay')
tickDelay.addEventListener('change', () => {
    world.tickDelay = tickDelay.value
})
