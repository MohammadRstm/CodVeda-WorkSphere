import '../styles/AboutUs.css'
import { Header } from '../../Components/Header'
import { AboutUsSection } from './AboutUsSection'


export function AboutUs(){
const aboutUsSections = [
  {
    h3Content: "Who We Are",
    pContent: `Founded with a vision to bridge the gap between education and industry requirements,
    CodVeda Technologies has become a leading provider of IT solutions and technical education.
    We create opportunities for aspiring technologists while delivering exceptional solutions to
    businesses.`
  },
  {
    h3Content: "Our Mission",
    pContent: `We aim to empower individuals with cutting-edge technical skills and support businesses with
    innovative solutions that drive growth. Our core focus areas include fostering technological
    innovation, bridging education-industry gaps, and delivering exceptional value to our clients and
    students.`
  },
  {
    h3Content: "Innovation & Excellence",
    pContent: `At CodVeda, we embrace innovation, creative problem-solving, and technical excellence.
    Our solutions are designed to adapt, optimize, and scale, ensuring the highest standards of
    performance and reliability. Integrity, collaboration, and empowerment are at the heart of everything we do.`
  },
  {
    h3Content: "Our Vision",
    pContent: `We strive to be the most trusted partner in digital transformation and technical education,
    creating a meaningful impact on society through technology. By 2025, we aim to enable over 10,000
    aspiring technologists and establish a global presence with local expertise.`
  },
  {
    h3Content: "Our Impact",
    pContent: `CodVeda has already made a significant difference: 
    1,800+ Happy Interns
    200+ Stipend Scholars
    20+ Clients
    50+ Expert Mentors`
  },
  {
    h3Content: "Looking Ahead",
    pContent: `As we continue to grow, our focus remains on innovation, quality, and meaningful impact.
    CodVeda is committed to helping more individuals develop in-demand skills while supporting
    businesses in their digital transformation journey.`
  }
];

return (
<>
    <Header />
  <div className="page-wrapper">
    <div className="page-content">
        <h1>About CodVeda Systems</h1>
        <h2>Bridging Education and Industry, Empowering Tomorrow’s Technologists</h2>
        <div className="about-container">
           {aboutUsSections.map((aboutUsSection, index) => (
            <AboutUsSection
                key={index}
                h3Content={aboutUsSection.h3Content}
                pContent={aboutUsSection.pContent}
            />
            ))}
        </div>
       </div>
    </div>
        <div className="glowing-orbs orb-1"></div>
        <div className="glowing-orbs orb-2"></div>
</>
)
}
