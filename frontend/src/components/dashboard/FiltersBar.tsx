"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { debounce } from "@/lib/utils";
import type { TaskFilters } from "@/types";

export interface FiltersBarProps {
  initial: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onClear: () => void;
}

export default function FiltersBar({ initial, onChange, onClear }: FiltersBarProps) {
  const [local, setLocal] = useState<TaskFilters>({ ...initial });

  // Debounce search to avoid spamming API
  const debouncedUpdate = useMemo(
    () => debounce((next: TaskFilters) => onChange(next), 400),
    [onChange]
  );

  const update = (patch: Partial<TaskFilters>, instant = false) => {
    const next = { ...local, ...patch, page: 1 }; // reset to first page on filter change
    setLocal(next);
    if (instant) onChange(next);
    else debouncedUpdate(next);
  };

  const clear = () => {
    const cleared: TaskFilters = { status: "all", priority: "all", search: "", page: 1, limit: 10, sort: "-createdAt" };
    setLocal(cleared);
    onClear();
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-6">
        <Input
          value={local.search || ""}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search tasks..."
          aria-label="Search tasks"
        />
      </div>

      <div className="lg:col-span-2">
        <Select
          value={String(local.status || "all")}
          onChange={(e) => update({ status: e.target.value })}
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      <div className="lg:col-span-2">
        <Select
          value={String(local.priority || "all")}
          onChange={(e) => update({ priority: e.target.value })}
          aria-label="Filter by priority"
        >
          <option value="all">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <div className="lg:col-span-2 flex gap-2">
        <Button type="button" variant="outline" className="w-full" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
