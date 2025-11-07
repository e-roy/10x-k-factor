"use client";

import { useRouter } from "next/navigation";

export function MetricsForm({ from, to }: { from: string; to: string }) {
  const router = useRouter();

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("from", e.target.value);
    router.push(`?${params.toString()}`);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("to", e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex gap-4 items-end">
      <div>
        <label htmlFor="from" className="block text-sm font-medium mb-1">
          From Date
        </label>
        <input
          id="from"
          type="date"
          defaultValue={from}
          className="px-3 py-2 border rounded-md"
          onChange={handleFromChange}
        />
      </div>
      <div>
        <label htmlFor="to" className="block text-sm font-medium mb-1">
          To Date
        </label>
        <input
          id="to"
          type="date"
          defaultValue={to}
          className="px-3 py-2 border rounded-md"
          onChange={handleToChange}
        />
      </div>
    </div>
  );
}

