import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main style={{ padding: 40 }}>
      <Link to="/">← PAYLOCK home</Link>
      <h1>Welcome back</h1>
      <p>Login form coming next.</p>
      <Link to="/register">Create a merchant account</Link>
    </main>
  );
}
