import '../styles/Home.css'
import { Header } from '../../Components/Header'
import { useNavigate } from 'react-router-dom'
import { FeatureCard } from './FeatureCard'
import { ImpactCard } from './ImpactCard'


export function Home(){
const navigate = useNavigate();


const features = [
  {
    icon: "fas fa-brain",
    title: "Cutting-Edge Learning",
    description:
      "We equip aspiring technologists with in-demand skills through hands-on projects, internships, and mentorship."
  },
  {
    icon: "fas fa-bolt",
    title: "High-Impact Solutions",
    description:
      "Our team delivers AI-driven, cloud-ready, and secure solutions that help businesses innovate and scale faster."
  },
  {
    icon: "fas fa-shield-alt",
    title: "Trusted & Secure",
    description:
      "Security and reliability are core to our systems. We ensure your data and operations are protected while driving growth."
  }
];
const impacts = [
  {
    number: "1,800+",
    label: "Happy Interns"
  },
  {
    number: "200+",
    label: "Stipend Scholars"
  },
  {
    number: "50+",
    label: "Expert Mentors"
  },
  {
    number: "20+",
    label: "Client Projects"
  }
];


return(
<>
    <Header />
    <main>
        <section className="hero-section">
            <div className="grid-background"></div>
            <div className="glowing-orbs orb-1"></div>
            <div className="glowing-orbs orb-2"></div>

            <div className="typing-container">
                <h1 id="typing-text">CodVeda-WorkSphere</h1>
            </div>

            <p className="subtitle">
                CodVeda Technologies bridges the gap between education and industry, delivering innovative solutions
                and real-world technical experience to aspiring technologists and businesses alike.
            </p>

            <button onClick={() => navigate('/manage')} className="cta-button">Explore Our Talent</button>
        </section>

        <section className="features-section">
            <h2 className="section-title">Why Choose CodVeda?</h2>
            <div className="features-grid">
                {features.map((feature , index) =>(
                    <FeatureCard
                    key = {index}
                    icon = {feature.icon}
                    title = {feature.title}
                    description = {feature.description}
                    />
                ))}
            </div>
        </section>
        <section className="impact-section">
            <h2 className="section-title">Our Impact So Far</h2>
            <div className="impact-grid">
                {impacts.map((impact , index) =>(
                    <ImpactCard
                    key = {index}
                    label={impact.label}
                    number={impact.number}
                    />
                ))}
            </div>
        </section>
    </main>

</>
)
}
