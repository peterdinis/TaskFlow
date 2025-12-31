import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Clock, Calendar, Tag, CheckCircle, Hash, ArrowUpRight } from 'lucide-react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  onSelectTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  projects?: Array<{ id: string; name: string; color: string }>;
  onFilterByProject?: (projectId: string) => void;
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  tasks, 
  onSelectTask, 
  onDeleteTask,
  onToggleComplete,
  projects = [],
  onFilterByProject 
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'open' | 'completed'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'open', label: 'Open Tasks' },
    { id: 'completed', label: 'Completed' },
  ];

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(query.toLowerCase()) ||
                         task.description?.toLowerCase().includes(query.toLowerCase()) ||
                         task.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'open' && !task.completed) ||
                           (selectedCategory === 'completed' && task.completed);
    
    const matchesProject = selectedProject === 'all' || 
                          task.projectId === selectedProject;
    
    return matchesSearch && matchesCategory && matchesProject;
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
      
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (taskId: string) => {
    onSelectTask(taskId);
    onClose();
    setQuery('');
  };

  const handleQuickAction = (taskId: string, action: 'complete' | 'delete') => {
    if (action === 'complete' && onToggleComplete) {
      onToggleComplete(taskId);
    } else if (action === 'delete' && onDeleteTask) {
      onDeleteTask(taskId);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning-foreground border-warning/30';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterByProject = (projectId: string) => {
    setSelectedProject(projectId);
    if (onFilterByProject && projectId !== 'all') {
      onFilterByProject(projectId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <SearchIcon className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Search Tasks</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative">
                  <Command className="border-none shadow-none">
                    <CommandInput
                      ref={inputRef}
                      placeholder="Search by title, description, or tags..."
                      value={query}
                      onValueChange={setQuery}
                      className="h-12 text-base"
                    />
                  </Command>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter:</span>
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedCategory === category.id && "shadow-sm"
                        )}
                        onClick={() => setSelectedCategory(category.id as any)}
                      >
                        {category.label}
                      </Badge>
                    ))}
                  </div>

                  {projects.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1">
                          <Hash className="w-3 h-3" />
                          {selectedProject === 'all' ? 'All Projects' : 
                           projects.find(p => p.id === selectedProject)?.name || 'Select Project'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => handleFilterByProject('all')}>
                          All Projects
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {projects.map((project) => (
                          <DropdownMenuItem 
                            key={project.id}
                            onClick={() => handleFilterByProject(project.id)}
                            className="flex items-center gap-2"
                          >
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh]">
                {query ? (
                  <ScrollArea className="h-full">
                    {filteredTasks.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <SearchIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-medium text-foreground mb-2">No results found</h4>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                          No tasks match "{query}". Try searching with different keywords.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        <div className="px-4 py-2">
                          <p className="text-sm text-muted-foreground">
                            Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {filteredTasks.map((task: any) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "group relative px-4 py-3 rounded-lg mx-2 mb-1",
                              "hover:bg-muted/50 transition-all cursor-pointer",
                              "border border-transparent hover:border-border"
                            )}
                            onClick={() => handleSelect(task.id)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Task status */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onToggleComplete) handleQuickAction(task.id, 'complete');
                                }}
                                className={cn(
                                  "mt-1 w-5 h-5 rounded-full border transition-all shrink-0",
                                  task.completed
                                    ? "bg-primary border-primary flex items-center justify-center"
                                    : "border-muted-foreground/30 hover:border-primary"
                                )}
                              >
                                {task.completed && (
                                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                )}
                              </button>

                              {/* Task content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={cn(
                                    "font-medium text-foreground",
                                    task.completed && "line-through text-muted-foreground"
                                  )}>
                                    {task.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs font-normal",
                                      getPriorityColor(task.priority)
                                    )}
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {/* Metadata */}
                                <div className="flex items-center gap-3 mt-2">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(task.dueDate)}
                                    </div>
                                  )}
                                  
                                  {task.projectId && projects.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ 
                                          backgroundColor: projects.find(p => p.id === task.projectId)?.color 
                                        }}
                                      />
                                      <span className="text-muted-foreground">
                                        {projects.find(p => p.id === task.projectId)?.name}
                                      </span>
                                    </div>
                                  )}

                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Tag className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {task.tags.slice(0, 2).join(', ')}
                                        {task.tags.length > 2 && '...'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quick actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDeleteTask) handleQuickAction(task.id, 'delete');
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(task.id);
                                  }}
                                >
                                  <ArrowUpRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <SearchIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-medium text-foreground mb-2">Search Tasks</h4>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                      Search by task title, description, tags, or priority
                    </p>
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 rounded bg-muted font-mono">Ctrl</kbd>
                        <kbd className="px-2 py-1 rounded bg-muted font-mono">K</kbd>
                        <span>to open</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 rounded bg-muted font-mono">Esc</kbd>
                        <span>to close</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 rounded bg-muted font-mono">↓</kbd>
                        <kbd className="px-2 py-1 rounded bg-muted font-mono">↑</kbd>
                        <span>to navigate</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {query && filteredTasks.length > 0 && (
                    <span>
                      Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-muted">Enter</kbd> 
                      to select highlighted task
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tasks.length} total tasks
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}