import React, { useId } from "react";
import { useActionState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  onLoginSuccess?: (token: string) => void;
}

export function LoginPage({ isRegistering = false, onLoginSuccess }: LoginPageProps) {
  const usernameInputId = useId();
  const passwordInputId = useId();
  const navigate = useNavigate();

  const [result, submit, isPending] = useActionState(
    async (_prevResult: string | null, formData: FormData) => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      try {
        const res = await fetch(`/auth/${isRegistering ? "register" : "login"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const err = await res.json();
          return err.error || "Something went wrong";
        }

        const { token } = await res.json();
        onLoginSuccess?.(token);
        navigate("/");
        return null;
      } catch {
        return "Network error";
      }
    },
    null
  );

  return (
    <div className="LoginPage">
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form
  className="LoginPage-form"
  onSubmit={(e) => {
    e.preventDefault(); // ← stop refresh
    submit(new FormData(e.currentTarget));
  }}
>

        <label htmlFor={usernameInputId}>Username</label>
        <input id={usernameInputId} name="username" required disabled={isPending} />

        <label htmlFor={passwordInputId}>Password</label>
        <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

        <input type="submit" value="Submit" disabled={isPending} />

        {result && (
          <p style={{ color: "red" }} aria-live="polite">
            {result}
          </p>
        )}
      </form>

      {!isRegistering && (
        <p>
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </div>
  );
}
