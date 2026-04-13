"use client";

import { useState } from "react";
import type { PBLData } from "@/lib/core/types";

interface PblRendererProps {
  data: PBLData;
}

export function PblRenderer({ data }: PblRendererProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    data.roles[0]?.id ?? ""
  );

  const selectedRole = data.roles.find((r) => r.id === selectedRoleId) ?? null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">{data.projectTitle}</h2>
        <p className="mt-1 text-muted-foreground">{data.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="role-select" className="text-sm font-semibold">
          Your Role
        </label>
        <select
          id="role-select"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {data.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {selectedRole && (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">
            {selectedRole.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Milestones</h3>
        <ul className="flex flex-col gap-2">
          {data.milestones.map((milestone) => (
            <li
              key={milestone.id}
              className="flex items-start gap-3 rounded-md border border-border p-3"
            >
              <input
                type="checkbox"
                checked={milestone.isCompleted}
                readOnly
                className="mt-1 shrink-0"
                aria-label={`Milestone: ${milestone.title}`}
              />
              <div>
                <p className="text-sm font-medium">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
