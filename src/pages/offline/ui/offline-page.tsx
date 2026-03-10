"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date>(new Date());

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setCheckedAt(new Date());
      if (online) {
        router.replace("/");
      }
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [router]);

  const checkedTime = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(checkedAt),
    [checkedAt]
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground">오프라인 페이지</p>
        <h1 className="mt-1 text-xl font-semibold">네트워크 연결이 끊겼습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          인터넷 연결을 확인한 뒤 다시 시도해 주세요.
        </p>

        <div className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="font-medium">현재 상태:</span>{" "}
          <span className={isOnline ? "text-emerald-500" : "text-amber-500"}>
            {isOnline ? "온라인" : "오프라인"}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">마지막 확인: {checkedTime}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
