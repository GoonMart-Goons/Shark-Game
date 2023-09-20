console.clear()

const {
  devicePixelRatio,
  innerHeight: viewportHeight,
  innerWidth: viewportWidth
} = window

class Scene extends THREE.Scene {
  #controls
  #orbital
  #player
  #prevTimestamp
  #renderer
  #scene

  static timeDilation = 0.4
  constructor (props) {
    super(props)

    this.#renderer = new THREE.WebGLRenderer({ antialias: true })

    this.#addGround()
    this.#addLights()
    
    this.#controls = {
      position: new KeyboardInput({
        left: 'a',
        right: 'd',
        up: 's',
        down: 'w'
      }),
      rotation: new KeyboardInput({
        left: 'arrowleft',
        right: 'arrowright',
        up: 'arrowup',
        down: 'arrowdown'
      })
    }
   
    this.#player = new Player({
      animationNames: ['idle', 'walk', 'run'],
      modelName: 'root',
      onLoad: () => (document.querySelector('#loading').style.display = 'none'),
      path: 'https://assets.codepen.io/829639/'
    })
    this.add(this.#player)

    this.#orbital = new OrbitalCamera(60, viewportWidth / viewportHeight, 1, 1000)
    // Add the orbital to the player, not to the scene
    this.#player.add(this.#orbital)

    document.body.appendChild(this.#renderer.domElement)
    this.#renderer.setAnimationLoop(this.#render)
  }

  #addGround () {
    const grid = new THREE.InfiniteGridHelper(10, 100)
    grid.receiveShadow = true
    this.add(grid)

    const axesHelper = new THREE.AxesHelper(15)
    this.add(axesHelper)
  }

  #addLights () {
    const directional = new THREE.DirectionalLight(0xffffff, 2)
    directional.position.set(50, 50, 50)
    directional.target.position.set(0, 0, 0)
    directional.castShadow = true
    this.add(directional)

    const ambient = new THREE.AmbientLight(0xffffff, .5)
    this.add(ambient)
  }

  #update = elapsedTime => {
    this.#renderer.setSize(window.innerWidth, window.innerHeight)

    // Rotate the camera
    const easeIn = 91
    let { x: yRotation, y: xRotation } = this.#controls.rotation
    xRotation = Math.pow(xRotation, easeIn)
    const cameraRotation = new THREE.Euler(xRotation, yRotation, 0)
    this.#orbital.update(elapsedTime, cameraRotation)

    // Reposition the player
    const { x: xPos, y: zPos } = this.#controls.position
    const playerPosition = new THREE.Vector3(xPos, 0, zPos)
    playerPosition.multiplyScalar(Scene.timeDilation)
    // This applies any orbital rotation to the new player position so that the "forward" direction (the A key) will always move the player "up" on the screen (and the same for left, down, and right).
    playerPosition.applyEuler(this.#orbital.rotation)
    this.#player.update(elapsedTime, playerPosition)
  }

  #render = timestamp => {
    if (this.#prevTimestamp === undefined) this.#prevTimestamp = timestamp

    const elapsedTime = (timestamp - this.#prevTimestamp) / 1000
    this.#renderer.render(this, this.#orbital.camera)
    this.#update(elapsedTime)
    this.#prevTimestamp = timestamp

    this.#renderer.render(this, this.#orbital.camera)
  }
}

/**
 * Creates a THREE.PerspectiveCamera wrapped in a THREE.Object3D. As a child of the Object3D, the camera is positioned in the Object3D's local space. The Object3D can thus be rotated, allowing the camera to rotate as an orbital, around the Object3D's origin.
 * @class
 */
class OrbitalCamera extends THREE.Object3D {
  #originalCameraAngle
  #originalCameraHeight
  
  /**
   * Accepts standard parameters for a THREE.PerspectiveCamera
   */
  constructor (fov, aspect, near, far) {
    super()

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.set(2, 25, 30)
    this.camera.lookAt(0, 20, 0)
    this.add(this.camera)
    this.#originalCameraAngle = this.camera.rotation.x
    this.#originalCameraHeight = this.camera.position.y

  }

  update (elapsedTime, rotation) {
    if (rotation instanceof THREE.Euler) {
      const pitch = rotation.x * -.5
      const yaw = this.rotation.y + rotation.y * -elapsedTime

      this.rotation.set(this.rotation.x, yaw, this.rotation.z)

      const camAltitude = this.camera.position.clone()
      camAltitude.setY(this.#originalCameraHeight + (rotation.x * 10))
      this.camera.position.lerp(camAltitude, .1)
      
      const camPitch = this.camera.quaternion.clone()
      camPitch.setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        this.#originalCameraAngle - rotation.x * .5
      )
      this.camera.quaternion.slerp(camPitch, .1)
    }

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}

class Player extends THREE.Group {
  #action
  #actionList = {}
  #areModelsLoaded = false
  #mixer
  #model

  constructor (props) {
    super()

    const { animationNames, modelName, onLoad, path } = props
    const loader = new THREE.FBXLoader()
    loader.setPath(path)
    loader.load(
      `${modelName}.fbx`,
      model => {
        model.scale.setScalar(0.1)

        model.traverse(mesh => {
          mesh.castShadow = true
          if (mesh.material?.name === 'asdf1:Beta_HighLimbsGeoSG2') {
            mesh.material.color.setHex(0x333333)
            mesh.metalicness = 1
            mesh.roughness = 0
          } else if (mesh.material?.name === 'Beta_Joints_MAT') {
            mesh.material.color.setRGB(
              (Math.floor(Math.random() * 80) + 20) / 100,
              (Math.floor(Math.random() * 80) + 20) / 100,
              (Math.floor(Math.random() * 80) + 20) / 100
            )
          }
        })

        model.position.set(0, 0, 0)
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
        this.#model = model
        this.add(model)

        this.#mixer = new THREE.AnimationMixer(this.#model)

        const loadingManager = new THREE.LoadingManager()
        const loader = new THREE.FBXLoader(loadingManager)
        loader.setPath(path)
        loadingManager.onLoad = () => {
          this.#areModelsLoaded = true
          this.#setAction('idle')
          if (typeof onLoad === 'function') onLoad()
        }

        animationNames.forEach(name => {
          loader.load(`${name}.fbx`, model => {
            const clip = model.animations[0]
            const action = this.#mixer.clipAction(clip)
            action.name = name

            this.#actionList[name] = action
          })
        })
      },
      null,
      e => console.log(e)
    )
  }

  update = (elapsedTime, movement) => {
    if (!this.#action) return
    this.#animate(elapsedTime, movement)
    this.#move(elapsedTime, movement)
  }

  #animate = (elapsedTime, movement) => {
    const { x, z } = movement

    const speed = Math.min(Math.abs(x) + Math.abs(z), 1)

    let action = 'idle'

    if (speed === 0) action = 'idle'
    else if (speed < 0.3) action = 'walk'
    else action = 'run'

    this.#setAction(action)
    this.#mixer.update(elapsedTime)
  }

  #move = (elapsedTime, movement) => {
    if (!movement instanceof THREE.Vector3) return
    if (movement.x === 0 && movement.z === 0) return

    const nextPosition = this.position.clone()
    nextPosition.add(movement)

    const angle =
      Math.PI +
      Math.atan2(
        this.position.x - nextPosition.x,
        this.position.z - nextPosition.z
      )

    this.position.copy(nextPosition)

    if (this.#model)
      this.#model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
  }

  #setAction (name) {
    const prevAction = this.#action
    if (prevAction?.name === name) return

    this.#action = this.#actionList[name]

    if (prevAction) {
      this.#action.time = 0.1
      this.#action.enabled = true
      this.#action.setEffectiveTimeScale(Scene.timeDilation)
      this.#action.setEffectiveWeight(1.0)
      this.#action.crossFadeFrom(prevAction, 0.5, true)
    }

    this.#action.play()
  }
}

class KeyboardInput extends THREE.Vector3 {
  #activeKeys = new Set()
  #keyMapping = {}

  constructor (keyMapping) {
    super()

    if (keyMapping) this.#keyMapping = keyMapping
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  onKeyDown = e => {
    const key = e.key.toLowerCase()
    const activeKeys = this.#activeKeys
    const { left, right, up, down } = this.#keyMapping

    activeKeys.add(key)

    switch (key) {
      case left:
        this.setX(-1)
        break
      case right:
        this.setX(1)
        break
      case up:
        this.setY(1)
        break
      case down:
        this.setY(-1)
        break
      default:
        break
    }
  }

  onKeyUp = e => {
    const key = e.key.toLowerCase()
    const activeKeys = this.#activeKeys
    const { left, right, up, down } = this.#keyMapping

    activeKeys.delete(key)

    switch (key) {
      case left:
        if (!activeKeys.has(right)) this.setX(0)
        break
      case right:
        if (!activeKeys.has(left)) this.setX(0)
        break
      case up:
        if (!activeKeys.has(down)) this.setY(0)
        break
      case down:
        if (!activeKeys.has(up)) this.setY(0)
        break
      default:
        break
    }
  }
}

new Scene()
