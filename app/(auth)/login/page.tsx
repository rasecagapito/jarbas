import { LoginForm } from "@/components/auth/login-form";
import { getLoginMessageFromCode } from "@/lib/auth/login";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-jarbas-bg px-6 py-10 text-jarbas-text">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <LoginForm message={getLoginMessageFromCode(message)} />
      </section>
    </main>
  );
}
