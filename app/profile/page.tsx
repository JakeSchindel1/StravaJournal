/**
 * Profile page - default redirect target after Strava auth.
 * Build out with user-specific content as needed.
 */

export default function ProfilePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="heading text-3xl text-[#231F20]">Your profile</h1>
      <p className="mt-3 text-base text-[#6B6B6B]">You&apos;re signed in. Add your profile content here.</p>
    </main>
  );
}
