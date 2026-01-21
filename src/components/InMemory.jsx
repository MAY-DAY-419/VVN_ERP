import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/InMemory.css'

function InMemory() {
  const navigate = useNavigate()

  return (
    <div className="in-memory-container">
      {/* Header Navigation */}
      <header className="in-memory-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span>←</span> Back to Home
        </button>
        <h1 className="page-title">In Loving Memory</h1>
        <div style={{ width: '120px' }}></div>
      </header>

      {/* Main Tribute Section */}
      <div className="in-memory-main">
        <div className="tribute-container">
          {/* Left Side - Image */}
          <div className="tribute-image-wrapper">
            <div className="tribute-image-frame">
              <img 
                src="/Assets/chacha.png" 
                alt="Vipin Dantare" 
                className="tribute-image"
              />
            </div>
            <div className="image-overlay">
              <p className="years">1950 - 2024</p>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="tribute-content">
            <h2 className="tribute-name">Vipin Dantare</h2>
            
            <div className="motto-box">
              <p className="motto">
                "Visionary Businessman, Architect of Excellence, Advocate for Education"
              </p>
            </div>

            <div className="tribute-text">
              <p>
                Vipin Dantare was more than a businessman—he was a visionary with a profound belief in the 
                power of education. With decades of entrepreneurial success and unwavering dedication to his 
                community, he dreamed of creating an institution where young minds could flourish.
              </p>
              <p>
                Driven by compassion and a deep commitment to uplift the underprivileged, Vipin established 
                Vipin Vidhya Niketan as a beacon of educational excellence. His legacy lives on in every 
                student who walks through these halls, in every opportunity created, and in the values of 
                integrity, hard work, and compassion that define our school.
              </p>
              <p>
                His vision was simple yet powerful: to provide quality education accessible to all, 
                transforming lives and shaping the leaders of tomorrow. This school stands as a living 
                monument to his generosity, wisdom, and unwavering belief in the transformative power of education.
              </p>
            </div>

            <div className="tribute-footer">
              <p className="quote">"Education is the most powerful tool for changing the world"</p>
              <p className="signature">- Vipin Dantare's Legacy</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="values-section">
          <h3>Core Values He Lived By</h3>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💼</div>
              <h4>Integrity in Business</h4>
              <p>Built success on honesty and ethical practices</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎓</div>
              <h4>Belief in Education</h4>
              <p>Championed quality learning for all communities</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h4>Community Service</h4>
              <p>Dedicated to uplifting underprivileged sections</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h4>Vision for Excellence</h4>
              <p>Strived for the highest standards in all endeavors</p>
            </div>
          </div>
        </div>

        {/* Remembrance Section */}
        <div className="remembrance-section">
          <h3>Remembering His Contributions</h3>
          <div className="achievements">
            <div className="achievement-item">
              <span className="achievement-number">01</span>
              <div className="achievement-text">
                <h4>Founded Vipin Vidhya Niketan</h4>
                <p>Established a premier institution dedicated to educational excellence</p>
              </div>
            </div>
            <div className="achievement-item">
              <span className="achievement-number">02</span>
              <div className="achievement-text">
                <h4>Empowered Countless Students</h4>
                <p>Provided quality education and opportunities to hundreds of children</p>
              </div>
            </div>
            <div className="achievement-item">
              <span className="achievement-number">03</span>
              <div className="achievement-text">
                <h4>Built a Community Legacy</h4>
                <p>Created lasting impact through education, mentorship, and support</p>
              </div>
            </div>
            <div className="achievement-item">
              <span className="achievement-number">04</span>
              <div className="achievement-text">
                <h4>Inspired Future Leaders</h4>
                <p>Instilled values of integrity, compassion, and excellence in generations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="in-memory-footer">
        <p>"His vision continues to inspire us every day"</p>
        <p className="footer-year">Vipin Dantare's Legacy | VVN School</p>
      </footer>
    </div>
  )
}

export default InMemory
