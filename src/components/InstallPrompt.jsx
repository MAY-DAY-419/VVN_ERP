import React, { useState, useEffect } from 'react'

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('vvn_install_dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('App installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('vvn_install_dismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src="/Assets/logo.jpeg" alt="VVN" style={styles.logo} />
        <div style={styles.text}>
          <h3 style={styles.title}>Install VVN ERP App</h3>
          <p style={styles.description}>
            Install our app for quick access and offline use!
          </p>
        </div>
        <div style={styles.buttons}>
          <button onClick={handleInstall} style={styles.installBtn}>
            📲 Install
          </button>
          <button onClick={handleDismiss} style={styles.dismissBtn}>
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
    padding: '15px 20px',
    zIndex: 9999,
    animation: 'slideUp 0.3s ease',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  text: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e3a8a',
  },
  description: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#666',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  installBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  dismissBtn: {
    padding: '10px 16px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

export default InstallPrompt
