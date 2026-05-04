import { useEffect, useState } from 'react';
import { getSupabaseClient, getUserRole, signInWithEmail, signOut } from '../lib/supabaseClient';

function AuthPanel({ onSessionChange }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const client = getSupabaseClient();
      const { data: { user } } = await client.auth.getUser();
      if (!mounted) return;
      setUser(user || null);
      if (user) {
        onSessionChange && onSessionChange(user, { role: getUserRole(user) });
      } else {
        onSessionChange && onSessionChange(null, null);
      }
    }

    const sub = getSupabaseClient().auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      onSessionChange && onSessionChange(u, u ? { role: getUserRole(u) } : null);
    });

    load();
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setError(res.error.message || 'Erro ao logar');
      }
    } catch (err) {
      setError('Erro ao logar');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  if (user) {
    return (
      <div className="auth-panel">
        <small>Logado como {user.email}</small>
        <button className="btn btn--ghost" onClick={handleSignOut}>Sair</button>
      </div>
    );
  }

  return (
    <form className="auth-panel" onSubmit={handleSignIn}>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      {error && <div className="feedback feedback--error">{error}</div>}
    </form>
  );
}

export default AuthPanel;
