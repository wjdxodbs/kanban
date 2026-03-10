export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">오프라인 상태입니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          네트워크 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      </section>
    </main>
  );
}
