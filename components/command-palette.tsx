"use client";

import { useRouter } from "next/navigation";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const router = useRouter();

  function go(path: string) {
    setIsOpen(false);
    router.push(path);
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>Home</CommandItem>
          <CommandItem onSelect={() => go("/chat")}>Chat</CommandItem>
          <CommandItem onSelect={() => go("/classroom")}>Classroom</CommandItem>
          <CommandItem onSelect={() => go("/knowledge")}>Knowledge</CommandItem>
          <CommandItem onSelect={() => go("/co-writer")}>Co-Writer</CommandItem>
          <CommandItem onSelect={() => go("/guide")}>Guide</CommandItem>
          <CommandItem onSelect={() => go("/notebook")}>Notebook</CommandItem>
          <CommandItem onSelect={() => go("/tutorbot")}>TutorBot</CommandItem>
          <CommandItem onSelect={() => go("/settings")}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
