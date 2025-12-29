import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/facilitator-login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    if (!user) {
        return (
            <div className="dashboard-empty-state" style={{ margin: '48px auto', maxWidth: '600px' }}>
                <div className="dashboard-empty-icon">🔒</div>
                <h2 className="dashboard-empty-title">Access Denied</h2>
                <p className="dashboard-empty-message">You must be logged in to view this page.</p>
                <Link to="/facilitator-login" className="dashboard-button dashboard-button-primary">
                    Go to Facilitator Login
                </Link>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Topbar */}
            <header className="dashboard-topbar">
                <div className="dashboard-topbar-left">
                    <Link to="/dashboard" className="dashboard-brand">
                        <span className="dashboard-brand-icon">☕</span>
                        <span className="dashboard-brand-text">Conscious Sanctuary</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="dashboard-topbar-nav">
                    <Link
                        to="/dashboard"
                        className={`dashboard-topbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/dashboard/rsvps"
                        className={`dashboard-topbar-link ${isActive('/dashboard/rsvps') ? 'active' : ''}`}
                    >
                        RSVPs
                    </Link>
                    <Link
                        to="/dashboard/workshops"
                        className={`dashboard-topbar-link ${isActive('/dashboard/workshops') ? 'active' : ''}`}
                    >
                        Workshops
                    </Link>
                    <Link
                        to="/dashboard/events"
                        className={`dashboard-topbar-link ${isActive('/dashboard/events') ? 'active' : ''}`}
                    >
                        Events
                    </Link>
                    <Link
                        to="/dashboard/retreats"
                        className={`dashboard-topbar-link ${isActive('/dashboard/retreats') ? 'active' : ''}`}
                    >
                        Retreats
                    </Link>
                    <Link
                        to="/dashboard/facilitator-requests"
                        className={`dashboard-topbar-link ${isActive('/dashboard/facilitator-requests') ? 'active' : ''}`}
                    >
                        Requests
                    </Link>
                </nav>

                <div className="dashboard-topbar-right">
                    <span className="dashboard-user-email">{user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="dashboard-topbar-signout"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="dashboard-hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="dashboard-mobile-menu">
                    <Link
                        to="/dashboard"
                        className={`dashboard-mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">📊</span>
                        Dashboard
                    </Link>
                    <Link
                        to="/dashboard/rsvps"
                        className={`dashboard-mobile-link ${isActive('/dashboard/rsvps') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">✉️</span>
                        RSVPs
                    </Link>

                    <div className="dashboard-mobile-section">Manage</div>
                    <Link
                        to="/dashboard/workshops"
                        className={`dashboard-mobile-link ${isActive('/dashboard/workshops') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">🧘</span>
                        Workshops
                    </Link>
                    <Link
                        to="/dashboard/events"
                        className={`dashboard-mobile-link ${isActive('/dashboard/events') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">🎉</span>
                        Events
                    </Link>
                    <Link
                        to="/dashboard/retreats"
                        className={`dashboard-mobile-link ${isActive('/dashboard/retreats') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">🌄</span>
                        Retreats
                    </Link>

                    <div className="dashboard-mobile-section">Create</div>
                    <Link
                        to="/dashboard/create-workshop"
                        className={`dashboard-mobile-link ${isActive('/dashboard/create-workshop') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">➕</span>
                        New Workshop
                    </Link>
                    <Link
                        to="/dashboard/create-event"
                        className={`dashboard-mobile-link ${isActive('/dashboard/create-event') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">➕</span>
                        New Event
                    </Link>
                    <Link
                        to="/dashboard/create-retreat"
                        className={`dashboard-mobile-link ${isActive('/dashboard/create-retreat') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">➕</span>
                        New Retreat
                    </Link>

                    <div className="dashboard-mobile-section">Admin</div>
                    <Link
                        to="/dashboard/facilitator-requests"
                        className={`dashboard-mobile-link ${isActive('/dashboard/facilitator-requests') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <span className="dashboard-nav-icon">📋</span>
                        Facilitator Requests
                    </Link>

                    <div className="dashboard-mobile-divider"></div>

                    <div className="dashboard-mobile-user">{user.email}</div>
                    <button
                        onClick={() => { handleSignOut(); closeMobileMenu(); }}
                        className="dashboard-mobile-signout"
                    >
                        Sign Out
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
