import { login } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={login} className="card p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Admin login</h1>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field" autoComplete="username" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="field" autoComplete="current-password" />
        </div>
        {error === "weak" ? (
          <p className="text-red-600 text-sm">
            The admin password set on the server is too weak. Set ADMIN_PASSWORD (10 characters or more) in the
            hosting settings.
          </p>
        ) : error === "locked" ? (
          <p className="text-red-600 text-sm">Too many wrong attempts. Please wait 15 minutes and try again.</p>
        ) : (
          error && <p className="text-red-600 text-sm">Wrong email or password.</p>
        )}
        <button className="btn w-full">Log in</button>
      </form>
    </div>
  );
}
