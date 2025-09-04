import { Link } from 'react-router-dom';
import './Header.css'

export function Header(){

    return (
        <>
            <header className="page-header">
                <div className="header-logo"><Link to="/">CodVeda</Link></div>
                    <nav className="header-nav">
                        <Link to="/aboutUs" className="header-link">About Us</Link>
                        <Link to="/profile" className="header-link">Profile</Link>
                        <Link to="/manage" className="header-link">List</Link>
                    </nav>
            </header>
        </>
    );
}
