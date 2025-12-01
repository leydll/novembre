export default function Profile({ user }) {
  if (!user) return <p>Connectez-vous pour voir votre profil.</p>;

  return (
    <div>
      <h1>Profil</h1>
      <p>Nom d'utilisateur : {user.username}</p>
      <p>Email : {user.email}</p>
      <p>Rôle : {user.role}</p>
    </div>
  );
}
