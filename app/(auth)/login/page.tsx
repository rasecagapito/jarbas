import { LoginExperience } from "@/components/auth/login-experience";
import { LoginForm } from "@/components/auth/login-form";
import { getLoginMessageFromCode } from "@/lib/auth/login";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const loginMessage = getLoginMessageFromCode(message);

  return (
    <LoginExperience
      loginForm={<LoginForm message={loginMessage} />}
      showLoginInitially={Boolean(loginMessage)}
    />
  );
}
