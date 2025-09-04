import './styles/AboutUs.css'
import { Header } from '../Components/Header'


export function AboutUs(){

return (
<>
    <Header />
        <h1>About CodVeda Systems</h1>
        <h2>Bridging Education and Industry, Empowering Tomorrow’s Technologists</h2>

        <div className="about-container">

            <div className="about-section">
                <h3>Who We Are</h3>
                <p>
                    Founded with a vision to bridge the gap between education and industry requirements,
                    CodVeda Technologies has become a leading provider of IT solutions and technical education.
                    We create opportunities for aspiring technologists while delivering exceptional solutions to
                    businesses.
                </p>
            </div>

            <div className="about-section">
                <h3>Our Mission</h3>
                <p>
                    We aim to empower individuals with cutting-edge technical skills and support businesses with
                    innovative solutions that drive growth. Our core focus areas include fostering technological
                    innovation, bridging education-industry gaps, and delivering exceptional value to our clients and
                    students.
                </p>
            </div>

            <div className="about-section">
                <h3>Innovation & Excellence</h3>
                <p>
                    At CodVeda, we embrace innovation, creative problem-solving, and technical excellence.
                    Our solutions are designed to adapt, optimize, and scale, ensuring the highest standards of
                    performance
                    and reliability. Integrity, collaboration, and empowerment are at the heart of everything we do.
                </p>
            </div>

            <div className="about-section">
                <h3>Our Vision</h3>
                <p>
                    We strive to be the most trusted partner in digital transformation and technical education,
                    creating a meaningful impact on society through technology. By 2025, we aim to enable over 10,000
                    aspiring technologists and establish a global presence with local expertise.
                </p>
            </div>

            <div className="about-section">
                <h3>Our Impact</h3>
                <p>
                    CodVeda has already made a significant difference: <br />
                    <strong>1,800+</strong> Happy Interns<br />
                    <strong>200+</strong> Stipend Scholars<br />
                    <strong>20+</strong> Clients<br />
                    <strong>50+</strong> Expert Mentors
                </p>
            </div>

            <div className="about-section">
                <h3>Looking Ahead</h3>
                <p>
                    As we continue to grow, our focus remains on innovation, quality, and meaningful impact.
                    CodVeda is committed to helping more individuals develop in-demand skills while supporting
                    businesses
                    in their digital transformation journey.
                </p>
            </div>

        </div>

        <div className="glowing-orbs orb-1"></div>
        <div className="glowing-orbs orb-2"></div>
</>
)
}
