import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flag, X } from 'lucide-react';
import { Priority } from '@/types/task';
import { cn } from '@/lib/utils';

interface AddTaskButtonProps {
  onAdd: (title: string, priority: Priority) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'P1', color: 'bg-priority-high' },
  { value: 'medium', label: 'P2', color: 'bg-priority-medium' },
  { value: 'low', label: 'P3', color: 'bg-priority-low' },
  { value: 'none', label: 'P4', color: 'bg-muted-foreground' },
];

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), priority);
      setTitle('');
      setPriority('none');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setTitle('');
      setPriority('none');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/5 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Input Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl floating-shadow-lg border border-border p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {priorityOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriority(option.value)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all',
                        priority === option.value
                          ? `${option.color} text-primary-foreground`
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Flag className="w-3 h-3" />
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!title.trim()}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    title.trim()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Add task
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full floating-shadow-lg flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </>
  );
}
