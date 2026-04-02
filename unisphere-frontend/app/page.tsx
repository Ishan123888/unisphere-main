import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main className="page">
        <div className="hero-card">
          <h1>UniSphere Portfolio Module</h1>
          <p>
            This module allows students to upload academic achievements,
            manage their portfolio, and receive admin verification with badges.
          </p>

          <div className="hero-links">
            <a className="primary-btn" href="/portfolio">Go to Student Portfolio</a>
            <a className="secondary-btn" href="/admin-login">Admin Login</a>
          </div>
        </div>
      </main>
    </div>
  );
}