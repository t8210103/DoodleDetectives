import '../styles.css';

function NoPage() {
    return (
        <div className="no-page">
            <h1 className="no-page-code">404</h1>
            <p className="no-page-message">Oops! The page you're looking for doesn't exist.</p>
            <a href="/" className="no-page-button">Go Home</a>
        </div>
    );
}

export default NoPage;
