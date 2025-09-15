import { Link } from 'react-router-dom';
import './Header.css'

export function Header(){
const user = JSON.parse(localStorage.getItem('user'));
    return (
        <>
           <header className="page-header">
                <div className="header-container">
                    <div className="header-logo"><Link to="/Home">CodVeda</Link></div>
                    <nav className="header-nav">
                    <Link to="/manage" className="header-link">Manage</Link>
                    {user.role === 'admin' ? (
                        <a href = '/project' className='header-link'>Projects</a>
                    ) : (
                        <a href = {`/project?userId=${user.id}`} className='header-link'>Project</a>
                    )}
                    <Link to="/aboutUs" className="header-link">About Us</Link>
                    <Link to={`/profile?id=${user.id}`} className="header-link">Profile</Link>
                    <Link to="/?logout=true" className='header-link'>Log out</Link>
                    </nav>
                </div>
           </header>
        </>
    );
}
