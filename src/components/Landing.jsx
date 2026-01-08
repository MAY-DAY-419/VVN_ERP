import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Landing.css'

function Landing() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scroll = () => {
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollContainer.scrollTop = 0
      } else {
        scrollContainer.scrollTop += 1
      }
    }

    const interval = setInterval(scroll, 50)
    return () => clearInterval(interval)
  }, [])

  const newsItems = [
    { date: '06 Jan 2026', title: 'Annual Day Celebration', description: 'Join us for our grand annual day celebration on 15th January 2026.' },
    { date: '05 Jan 2026', title: 'Winter Break Schedule', description: 'School will remain closed from 20th to 31st January for winter break.' },
    { date: '03 Jan 2026', title: 'Parent-Teacher Meeting', description: 'PTM scheduled for all classes on 12th January 2026 from 9 AM to 3 PM.' },
    { date: '02 Jan 2026', title: 'Sports Day Announcement', description: 'Sports day events will be held on 18th January. All students must participate.' },
    { date: '01 Jan 2026', title: 'New Semester Begins', description: 'Welcome back! New semester starts with fresh enthusiasm and new opportunities.' },
    { date: '30 Dec 2025', title: 'Fee Submission Reminder', description: 'Please submit pending fees by 10th January to avoid late charges.' },
  ]

  return (
    <div className="landing-container">
      {/* Header with Logo and Navigation */}
      <header className="landing-header">
        <div className="header-left">
          <img src="/logo.jpeg" alt="VVN Logo" className="landing-logo" />
          <div className="school-name">
            <h2>VIPIN VIDHYA NIKETAN</h2>
            <p>Excellence in Education</p>
          </div>
        </div>
        
        <nav className="landing-nav">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#about" className="nav-link">About Us</a>
          <a href="#media" className="nav-link">Media</a>
          <a href="#contact" className="nav-link">Contact Us</a>
          <a href="#admin" className="nav-link">Administration</a>
          <a 
            href="https://www.instagram.com/vvnschool_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-link"
            title="Follow us on Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </nav>

        <button className="admin-btn" onClick={() => navigate('/login')}>
          Admin Login
        </button>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="hero-section">
          <h1>Welcome to Vipin Vidhya Niketan</h1>
          <p className="hero-subtitle">Shaping Future Leaders</p>
        </div>

        <div className="content-wrapper">
          {/* About Section */}
          <div className="about-section">
            <div className="about-image">
              <img src="/Assets/school01.jpeg" alt="School Building" />
            </div>
            <div className="about-text">
              <h2>About Our School</h2>
              <p>
                Vipin Vidhya Niketan stands as a beacon of educational excellence, dedicated to nurturing young minds 
                and shaping future leaders. Established with a vision to provide quality education, we have been 
                serving the community for years with commitment and passion.
              </p>
              <p>
                With experienced faculty, modern facilities, and a student-centric approach, we ensure that each child 
                receives personalized attention and guidance. Join us in our journey to create responsible citizens 
                and tomorrow's leaders.
              </p>
            </div>
          </div>

          {/* News & Announcements Box */}
          <div className="news-section">
            <h3 className="news-header">📢 News</h3>
            <div className="news-scroll" ref={scrollRef}>
              {newsItems.map((item, index) => (
                <div key={index} className="news-item">
                  <span className="news-date">{item.date}</span>
                  <h4 className="news-title">{item.title}</h4>
                  <p className="news-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Contact Information */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📍 Address</h3>
            <div className="address-box">
              <p className="address-line"><strong>Dantare Tiraha Konhar</strong></p>
              <p className="address-line">Near Indian Petrol Pump</p>
              <p className="address-line">Konhar Mehgoan, Bhind</p>
              <p className="address-line postal-code">📮 Madhya Pradesh - 477557</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>📞 Contact Us</h3>
            <div className="contact-box">
              <a href="tel:9770895862" className="contact-phone">
                <span className="phone-icon">☎️</span>
                <span>97708 95862</span>
              </a>
              <a href="tel:+919669885998" className="contact-phone">
                <span className="phone-icon">📱</span>
                <span>+91 96698 85998</span>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>🌐 Connect With Us</h3>
            <a 
              href="https://www.instagram.com/vvnschool_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
            <a 
              href="https://chat.whatsapp.com/HbELH25wHNF1JQJu5APjAg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-whatsapp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.284c-1.467.696-2.813 1.73-3.897 3.06C1.637 10.905 1 13.801 1 16.799c0 1.819.382 3.591 1.196 5.220L1 24l5.541-1.685h1.324c1.906 0 3.75-.723 5.322-2.044 2.11-1.883 3.483-4.567 3.679-7.505.121-1.956-.181-3.98-1.055-5.694-.547-1.122-1.372-2.126-2.42-2.952-1.555-1.303-3.676-2.41-6.042-2.539z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Vipin Vidhya Niketan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
