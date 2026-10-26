import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <main style={{ padding: 40 }}>
      <Link to="/">← PAYLOCK home</Link>
      <h1>Create your merchant account</h1>
      <p>Registration form coming next.</p>
      <Link to="/login">Already have an account? Log in</Link>
    </main>
  );
}
