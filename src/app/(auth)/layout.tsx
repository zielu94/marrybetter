import Logo from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-surface-muted">
      <div className="flex-1 flex flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </div>

      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 px-8">
            <h2 className="text-3xl font-semibold text-text tracking-tight">Deine Traumhochzeit</h2>
            <p className="text-sm text-text-muted">
              Plane gemeinsam mit deinem Partner die perfekte Hochzeit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
