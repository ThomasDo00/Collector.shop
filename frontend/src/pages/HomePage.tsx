function HomePage() {
  return (
    <main className="home-page">
      <header className="hero">
        <h1>Collector.shop</h1>
        <p>Marketplace d'objets de collection entre particuliers</p>
      </header>
      <section className="features">
        <div className="feature">
          <h2>Achetez en confiance</h2>
          <p>Transactions sécurisées via notre plateforme</p>
        </div>
        <div className="feature">
          <h2>Vendez facilement</h2>
          <p>Publiez vos objets de collection en quelques clics</p>
        </div>
        <div className="feature">
          <h2>Communauté passionnée</h2>
          <p>Rejoignez des milliers de collectionneurs</p>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
