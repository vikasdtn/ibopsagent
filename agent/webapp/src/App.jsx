import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [token, setToken] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your 5G RAN optimization expert. I can help you:\n\n🔧 **Analyze simulation results** and recommend parameter optimizations\n📊 **Answer 5G questions** using 3GPP specifications\n⚙️ **Configure network parameters** for better performance\n\nHow can I help you improve your network today?",
      renderedContent: "👋 Hello! I'm your 5G RAN optimization expert. I can help you:<br><br>🔧 <strong>Analyze simulation results</strong> and recommend parameter optimizations<br>📊 <strong>Answer 5G questions</strong> using 3GPP specifications<br>⚙️ <strong>Configure network parameters</strong> for better performance<br><br>How can I help you improve your network today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [deploymentType, setDeploymentType] = useState('local') // 'local' or 'deployed'
  const [agentArn, setAgentArn] = useState('')
  const [sessionId] = useState(() => crypto.randomUUID())
  const chatRef = useRef(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('agentToken')
    const savedDeploymentType = localStorage.getItem('deploymentType')
    const savedAgentArn = localStorage.getItem('agentArn')
    
    if (savedToken) setToken(savedToken)
    if (savedDeploymentType) setDeploymentType(savedDeploymentType)
    if (savedAgentArn) setAgentArn(savedAgentArn)
    
    if (savedDeploymentType === 'deployed' && (!savedToken || !savedAgentArn)) {
      setShowSettings(true)
    }
  }, [])

  useEffect(() => {
    if (token) localStorage.setItem('agentToken', token)
    localStorage.setItem('deploymentType', deploymentType)
    if (agentArn) localStorage.setItem('agentArn', agentArn)
  }, [token, deploymentType, agentArn])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const renderMarkdown = (text) => {
    return text
      .replace(/\\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/^### (.*?)(<br>|$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)(<br>|$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)(<br>|$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```yaml\n([\s\S]*?)\n```/g, '<pre class="yaml-code"><code>$1</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
  }

  const [capturedImage, setCapturedImage] = useState(null)

  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({video: true})
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      video.onloadedmetadata = function() {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        
        stream.getTracks().forEach(track => track.stop())
        
        const imageData = canvas.toDataURL('image/png')
        setCapturedImage(imageData)
        setInput('Analyze this screenshot of my simulation dashboard')
      }
    } catch(err) {
      alert('Screen capture failed: ' + err.message)
    }
  }

  const sendMessage = async (imageData = null) => {
    if (!input.trim() || isLoading) return
    if (deploymentType === 'deployed' && (!token.trim() || !agentArn.trim())) return

    const userMessage = input.trim()
    const imageToSend = imageData || capturedImage
    setInput('')
    setCapturedImage(null)
    setIsLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, typing: true }])

    try {
      let url, headers
      
      if (deploymentType === 'local') {
        url = 'http://localhost:8080/invocations'
        headers = {
          'Content-Type': 'application/json'
        }
      } else {
        // Extract region from ARN: arn:aws:bedrock-agentcore:region:account:runtime/agent-id
        const region = agentArn.split(':')[3]
        const encodedArn = encodeURIComponent(agentArn)
        url = `https://bedrock-agentcore.${region}.amazonaws.com/runtimes/${encodedArn}/invocations?qualifier=DEFAULT`
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': sessionId
        }
      }

      const payload = { prompt: userMessage }
      if (imageToSend) {
        payload.image = imageToSend
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      // Remove typing indicator once we start receiving content
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.typing = false
        }
        return newMessages
      })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            let text = line.substring(6)
            if (text.startsWith('"') && text.endsWith('"')) {
              text = text.slice(1, -1)
            }
            if (text) {
              fullContent += text
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = fullContent
                  lastMessage.renderedContent = renderMarkdown(fullContent)
                }
                return newMessages
              })
            }
          }
        }
      }
    } catch (error) {
      alert(`Request failed: ${error.message}. Please try again.`)
      setMessages(prev => prev.slice(0, -1)) // Remove the failed assistant message
    } finally {
      setIsLoading(false)
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.streaming = false
          lastMessage.typing = false
        }
        return newMessages
      })
    }
  }

  return (
    <div className="app">
      <div className="chat-header">
        <div className="header-content">
          <div className="agent-info">
            <div className="agent-avatar">🤖</div>
            <div className="agent-details">
              <h1>IBOps 5G RAN Agent</h1>
              <span className="agent-status">🟢 Online - Ready to optimize your network</span>
            </div>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
            ⚙️
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Deployment Type:</label>
            <select value={deploymentType} onChange={(e) => setDeploymentType(e.target.value)}>
              <option value="local">Local (localhost:8080)</option>
              <option value="deployed">AgentCore Deployed</option>
            </select>
          </div>
          
          {deploymentType === 'deployed' && (
            <>
              <div className="setting-group">
                <label>Agent ARN:</label>
                <input
                  type="text"
                  value={agentArn}
                  onChange={(e) => setAgentArn(e.target.value)}
                  placeholder="arn:aws:bedrock-agentcore:region:account:runtime/agent-id"
                />
              </div>
              <div className="setting-group">
                <label>Bearer Token (ID Token):</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your ID token"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="chat-container" ref={chatRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.role === 'assistant' && message.typing ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="message-text">
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.role === 'user' ? message.content : (message.renderedContent || renderMarkdown(message.content))
                  }} />
                  {message.streaming && !message.typing && <span className="cursor">▋</span>}
                </div>
              )}
              <div className="message-time">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <button 
            onClick={captureScreen}
            className="capture-button"
            disabled={isLoading}
            title="Capture Screen"
          >
            📸
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Ask about 5G optimization, simulation results, or network parameters..."
            className="message-input"
            rows="1"
            disabled={isLoading || (deploymentType === 'deployed' && (!token.trim() || !agentArn.trim()))}
          />
          <button 
            onClick={() => sendMessage()} 
            className="send-button"
            disabled={!input.trim() || isLoading || (deploymentType === 'deployed' && (!token.trim() || !agentArn.trim()))}
          >
            📡
          </button>
        </div>
        {capturedImage && (
          <div className="captured-preview">
            <img src={capturedImage} alt="Captured screenshot" style={{maxWidth: '200px', maxHeight: '100px', objectFit: 'contain'}} />
            <button onClick={() => setCapturedImage(null)}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
