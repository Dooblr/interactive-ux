import { useState, useEffect } from 'react'
import './App.scss'

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [bokehElements, setBokehElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    velocity: { x: number; y: number };
  }>>([])

  // Create initial bokeh elements
  useEffect(() => {
    const colors = ['#ff7e5f', '#feb47b', '#7bc6cc', '#be93c5', '#7ed6df']
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 100 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5
      }
    }))
    setBokehElements(elements)
  }, [])

  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      })
    }

    const handleMouseDown = () => {
      // Apply an immediate impulse to each element
      setBokehElements(prev => prev.map(element => ({
        ...element,
        velocity: {
          x: (Math.random() - 0.5) * 8,  // Stronger initial impulse
          y: (Math.random() - 0.5) * 8
        }
      })))

      // Reset velocities after a short delay
      setTimeout(() => {
        setBokehElements(prev => prev.map(element => ({
          ...element,
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          }
        })))
      }, 100)  // Adjust this delay to control how long the shift lasts
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Animate bokeh elements
  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setBokehElements(prevElements => {
        return prevElements.map(element => {
          let newX = element.x + element.velocity.x
          let newY = element.y + element.velocity.y

          // Bounce off walls
          if (newX < 0 || newX > window.innerWidth) element.velocity.x *= -1
          if (newY < 0 || newY > window.innerHeight) element.velocity.y *= -1

          // Keep within bounds
          newX = Math.max(0, Math.min(window.innerWidth, newX))
          newY = Math.max(0, Math.min(window.innerHeight, newY))

          return {
            ...element,
            x: newX,
            y: newY
          }
        })
      })
      requestAnimationFrame(animate)
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  // Calculate perspective transform based on mouse position
  const perspective = `
    perspective(1000px)
    rotateX(${mousePosition.y * -10}deg)
    rotateY(${mousePosition.x * 10}deg)
  `

  return (
    <div className="app-container">
      <div 
        className="bokeh-container"
        style={{
          transform: perspective,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
      >
        {bokehElements.map(element => (
          <div
            key={element.id}
            className="bokeh"
            style={{
              width: element.size,
              height: element.size,
              background: element.color,
              transform: `translate(${element.x}px, ${element.y}px) translateZ(${element.size / 2}px)`
            }}
          />
        ))}
      </div>
      <div className="content">
        <h1>Hello World</h1>
      </div>
    </div>
  )
}

export default App
