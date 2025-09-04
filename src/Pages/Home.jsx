import './styles/Home.css'
import { Link } from 'react-router-dom';


export function Home(){


return(
<>
    <header className="page-header">
        <div className="header-logo"><a href="/">CodVeda</a></div>
        <nav className="header-nav">
            <Link to="/aboutUs" className="header-link">About Us</Link>
            <Link to="/profile" className="header-link">Profile</Link>
            <Link to="/manage" className="header-link">List</Link>
        </nav>
    </header>
    <main>
        <section className="hero-section">
            <div className="grid-background"></div>
            <div className="glowing-orbs orb-1"></div>
            <div className="glowing-orbs orb-2"></div>

            <div className="typing-container">
                <h1 id="typing-text"></h1>
            </div>

            <p className="subtitle">
                CodVeda Technologies bridges the gap between education and industry, delivering innovative solutions
                and real-world technical experience to aspiring technologists and businesses alike.
            </p>

            <button onClick="window.location.href='list.html'" className="cta-button">Explore Our Talent</button>
        </section>

        <section className="features-section">
            <h2 className="section-title">Why Choose CodVeda?</h2>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <i className="fas fa-brain"></i>
                    </div>
                    <h3 className="feature-title">Cutting-Edge Learning</h3>
                    <p className="feature-description">
                        We equip aspiring technologists with in-demand skills through hands-on projects,
                        internships, and mentorship.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <h3 className="feature-title">High-Impact Solutions</h3>
                    <p className="feature-description">
                        Our team delivers AI-driven, cloud-ready, and secure solutions that help businesses innovate
                        and scale faster.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h3 className="feature-title">Trusted & Secure</h3>
                    <p className="feature-description">
                        Security and reliability are core to our systems. We ensure your data and operations are
                        protected while driving growth.
                    </p>
                </div>
            </div>
        </section>

        <section className="impact-section">
            <h2 className="section-title">Our Impact So Far</h2>
            <div className="impact-grid">
                <div className="impact-card">
                    <h3>1,800+</h3>
                    <p>Happy Interns</p>
                </div>
                <div className="impact-card">
                    <h3>200+</h3>
                    <p>Stipend Scholars</p>
                </div>
                <div className="impact-card">
                    <h3>50+</h3>
                    <p>Expert Mentors</p>
                </div>
                <div className="impact-card">
                    <h3>20+</h3>
                    <p>Client Projects</p>
                </div>
            </div>
        </section>
    </main>

</>
)
}
