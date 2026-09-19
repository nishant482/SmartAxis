import { useEffect, useRef, useState } from 'react'
import fallback from '../assets/axis-sculpture.webp'

const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const unit = a => { const length = Math.hypot(...a); return a.map(v => v / length) }
const center = t => [(2 + Math.cos(3*t)) * Math.cos(2*t), (2 + Math.cos(3*t)) * Math.sin(2*t), Math.sin(3*t) * 1.25]

const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform vec2 uRotation;
uniform vec2 uScale;
varying vec3 vNormal;
varying vec3 vPosition;
vec3 rotate(vec3 p) {
  float cy=cos(uRotation.x), sy=sin(uRotation.x), cx=cos(uRotation.y), sx=sin(uRotation.y);
  vec3 q=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
  return vec3(q.x,q.y*cx-q.z*sx,q.y*sx+q.z*cx);
}
void main() {
  vec3 p=rotate(aPosition);
  vPosition=p;
  vNormal=rotate(aNormal);
  float perspective=10.0/(10.0-p.z);
  gl_Position=vec4(p.x*uScale.x*perspective,-p.y*uScale.y*perspective,-p.z*.12,1.0);
}`
const fragmentShader = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 n=normalize(vNormal);
  vec3 view=normalize(vec3(0.,0.,10.)-vPosition);
  vec3 reflection=reflect(-view,n);
  float light=max(dot(n,normalize(vec3(-.6,-.8,1.))),0.);
  float fresnel=pow(1.-max(dot(n,view),0.),2.5);
  float band=pow(max(0.,1.-abs(reflection.y+.35)*1.8),10.);
  float rim=pow(max(dot(n,normalize(vec3(.8,.1,.3))),0.),5.);
  float spec=pow(max(dot(reflect(-normalize(vec3(-.6,-.8,1.)),n),view),0.),64.);
  vec3 color=vec3(.035,.065,.14)+vec3(.18,.24,.36)*light;
  color+=vec3(.48,.6,.82)*band+vec3(.13,.28,.65)*fresnel+vec3(.11,.27,.63)*rim+vec3(.7,.8,1.)*spec;
  gl_FragColor=vec4(pow(color,vec3(.83)),1.);
}`

// Native WebGL provides smooth lighting; a static image covers unsupported devices.
export default function HeroSculpture({ paused = false }) {
  const canvas = useRef(null)
  const orientation = useRef(.4)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    if (unavailable) return
    const element = canvas.current
    const gl = element.getContext('webgl', { alpha:true, antialias:true, premultipliedAlpha:false })
    if (!gl) { setUnavailable(true); return }
    const shaders = []
    function compile(type, source) {
      const shader = gl.createShader(type)
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed')
      return shader
    }
    const program = gl.createProgram()
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed')
    } catch {
      shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); setUnavailable(true); return
    }
    gl.useProgram(program)
    const vertices = [], indices = [], segments = 180, sides = 36
    for (let i = 0; i < segments; i++) {
      const t = i / segments * Math.PI * 2, c = center(t), next = center(t+.001)
      const tangent = unit(next.map((n, axis) => n-c[axis]))
      const normal = unit(cross(tangent,[0,0,1])), binormal = cross(tangent,normal)
      for (let j = 0; j < sides; j++) {
        const angle = j / sides * Math.PI * 2
        const n = normal.map((v, axis) => v*Math.cos(angle)+binormal[axis]*Math.sin(angle))
        vertices.push(...c.map((v,axis) => v+n[axis]*.57),...n)
        const a=i*sides+j, b=((i+1)%segments)*sides+j, d=i*sides+(j+1)%sides, e=((i+1)%segments)*sides+(j+1)%sides
        indices.push(a,b,d,b,e,d)
      }
    }
    const vertexBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW)
    for (const [name,offset] of [['aPosition',0],['aNormal',12]]) {
      const location = gl.getAttribLocation(program,name)
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,offset)
    }
    const rotationLocation=gl.getUniformLocation(program,'uRotation'), scaleLocation=gl.getUniformLocation(program,'uScale')
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0,0,0,0)
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)'), pointer={x:0,y:0}
    let frame=0,last=0,angle=orientation.current,visible=true,width=1,height=1
    function draw() {
      gl.viewport(0,0,element.width,element.height)
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
      const scale=Math.min(width,height)*.27
      gl.uniform2f(scaleLocation,scale/width,scale/height)
      gl.uniform2f(rotationLocation,angle+pointer.x*.2,.7+pointer.y*.15)
      gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0)
    }
    function loop(time) {
      frame=0
      if (!visible || document.hidden || motion.matches || paused) return
      if (time-last>33) { angle+=.003; orientation.current=angle; draw(); last=time }
      frame=requestAnimationFrame(loop)
    }
    function resume() { cancelAnimationFrame(frame); draw(); if (visible && !document.hidden && !motion.matches && !paused) frame=requestAnimationFrame(loop) }
    function resize() {
      const rect=element.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.75)
      width=rect.width; height=rect.height; element.width=Math.round(width*dpr); element.height=Math.round(height*dpr); draw()
    }
    function move(e) { const rect=element.getBoundingClientRect(); pointer.x=(e.clientX-rect.left)/rect.width-.5; pointer.y=(e.clientY-rect.top)/rect.height-.5 }
    function contextLost(e) { e.preventDefault(); setUnavailable(true) }
    const resizeObserver=new ResizeObserver(resize),observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume()})
    resizeObserver.observe(element); observer.observe(element)
    element.addEventListener('pointermove',move); element.addEventListener('webglcontextlost',contextLost)
    document.addEventListener('visibilitychange',resume); motion.addEventListener('change',resume)
    resize(); resume()
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); observer.disconnect()
      element.removeEventListener('pointermove',move); element.removeEventListener('webglcontextlost',contextLost)
      document.removeEventListener('visibilitychange',resume); motion.removeEventListener('change',resume)
      gl.deleteBuffer(vertexBuffer); gl.deleteBuffer(indexBuffer); gl.deleteProgram(program); shaders.forEach(shader=>gl.deleteShader(shader))
    }
  }, [unavailable, paused])
  return unavailable ? <img className="hero-sculpture sculpture-fallback" src={fallback} alt=""/> : <canvas ref={canvas} className="hero-sculpture" aria-hidden="true"/>
}
