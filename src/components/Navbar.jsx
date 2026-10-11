import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/invoices" className="navbar-brand">VKF Invoice</Link>
          <Link to="/invoices" className="nav-link">Invoices</Link>
        </div>
        <div className="navbar-right">
          <span className="nav-user">{user?.fullName}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
