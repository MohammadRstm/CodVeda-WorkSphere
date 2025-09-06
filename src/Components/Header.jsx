import { Link } from 'react-router-dom';
import './Header.css'

export function Header(){
const user = JSON.parse(localStorage.getItem('user'));
    return (
        <>
            <header className="page-header">
                <div className="header-logo"><Link to="/Home">CodVeda</Link></div>
                    <nav className="header-nav">
                        <Link to="/aboutUs" className="header-link">About Us</Link>
                        <Link to={`/profile?id=${user.id}`} className="header-link">Profile</Link>
                        <Link to="/manage" className="header-link">List</Link>
                    </nav>
            </header>
        </>
    );
}
