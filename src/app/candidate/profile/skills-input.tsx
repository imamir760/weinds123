'use client';

import { useState, useRef, useCallback } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SkillsInputProps {
  allSkills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillsInput({ allSkills, selectedSkills, onSkillsChange }: SkillsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = useCallback((skill: string) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
    }
    setInputValue('');
    inputRef.current?.focus();
  }, [selectedSkills, onSkillsChange]);

  const handleRemove = (skill: string) => {
    onSkillsChange(selectedSkills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '' && selectedSkills.length > 0) {
          handleRemove(selectedSkills[selectedSkills.length - 1]);
        }
      }
      if (e.key === 'Enter' && input.value) {
        e.preventDefault();
        const newSkill = input.value.trim();
        if (newSkill && !selectedSkills.includes(newSkill)) {
          onSkillsChange([...selectedSkills, newSkill]);
          setInputValue('');
        }
      }
      if (e.key === 'Escape') {
        input.blur();
      }
    }
  };

  const filteredSkills = allSkills.filter(skill => 
    !selectedSkills.includes(skill) && 
    skill.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedSkills.map(skill => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <button
                type="button"
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleRemove(skill)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Add skills..."
            className="ml-2 flex-1 bg-transparent p-0 outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (filteredSkills.length > 0 || inputValue) && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandEmpty>
                {inputValue && !allSkills.includes(inputValue) 
                  ? <div className='p-2'>Press <kbd className='px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border rounded-md'>Enter</kbd> to add "{inputValue}"</div>
                  : "No skills found."}
              </CommandEmpty>
              {filteredSkills.map(skill => (
                <CommandItem
                  key={skill}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => handleSelect(skill)}
                  className="cursor-pointer"
                >
                  {skill}
                </CommandItem>
              ))}
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  );
}
