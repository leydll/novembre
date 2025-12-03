export default function Legal() {
  return (
    <main className="app-shell">
      <h1 className="page-title">Mentions légales & confidentialité</h1>
      <p className="page-subtitle">
        Informations sur l&apos;édition du site, la collecte et
        l&apos;utilisation de vos données.
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Éditeur du site</h2>
        <p>
          Ce site est un projet pédagogique. Les données collectées (nom, email,
          mot de passe) sont utilisées uniquement pour la gestion des comptes
          utilisateurs et l&apos;accès aux recettes.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Données collectées</h2>
        <ul>
          <li>
            Adresse email (identifiant de connexion et communication liée au
            compte).
          </li>
          <li>
            Nom d&apos;utilisateur (affichage public dans l&apos;interface).
          </li>
          <li>
            Mot de passe (stocké de manière hachée avec bcrypt, jamais en
            clair).
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Base légale & consentement</h2>
        <p>
          La création de compte nécessite votre consentement explicite via la
          case à cocher du formulaire d&apos;inscription. Sans ce consentement,
          le compte ne peut pas être créé.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Dans le cadre de ce projet, vous pouvez demander la modification ou la
          suppression de votre compte en contactant l&apos;enseignant ou
          l&apos;auteur du projet.
        </p>
      </section>
    </main>
  );
}
