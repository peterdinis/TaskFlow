import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Task, Priority } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Filter, Search, X, ChevronDown, Hash, Tag, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  tasks: any[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  projects?: Array<{ id: string; name: string; color: string }>;
}

type FilterType = 'all' | 'active' | 'completed' | 'priority' | 'today' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'createdAt' | 'title';

interface FilterState {
  type: FilterType;
  priority: Priority | 'all';
  projectId: string | 'all';
  tags: string[];
  searchQuery: string;
  sortBy: SortType;
  sortOrder: 'asc' | 'desc';
}

export function TaskList({ 
  tasks, 
  onToggle, 
  onDelete, 
  onUpdatePriority,
  projects = [] 
}: TaskListProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    priority: 'all',
    projectId: 'all',
    tags: [],
    searchQuery: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Extract all unique tags from tasks
  useEffect(() => {
    const allTags = tasks.flatMap(task => task.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    setAvailableTags(uniqueTags);
  }, [tasks]);

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.projectId !== 'all') count++;
    if (filters.tags.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== 'dueDate') count++;
    setActiveFilters(count);
  }, [filters]);

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      // Filter by type
      if (filters.type === 'active' && task.completed) return false;
      if (filters.type === 'completed' && !task.completed) return false;
      
      // Filter by priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      
      // Filter by project
      if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false;
      
      // Filter by tags
      if (filters.tags.length > 0) {
        const taskTags = task.tags || [];
        if (!filters.tags.every(tag => taskTags.includes(tag))) return false;
      }
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query) || false;
        const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        if (!matchesTitle && !matchesDescription && !matchesTags) return false;
      }
      
      // Filter by today
      if (filters.type === 'today' && task.dueDate) {
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return (
          dueDate.getDate() === today.getDate() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear()
        );
      }
      
      // Filter by overdue
      if (filters.type === 'overdue' && task.dueDate) {
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate < today && !task.completed;
      }
      
      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          compareValue = dateA - dateB;
          break;
          
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
          
        case 'createdAt':
          const createdAtA = new Date(a.createdAt).getTime();
          const createdAtB = new Date(b.createdAt).getTime();
          compareValue = createdAtA - createdAtB;
          break;
          
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      priority: 'all',
      projectId: 'all',
      tags: [],
      searchQuery: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  };

  const getFilterLabel = () => {
    switch (filters.type) {
      case 'today': return 'Today';
      case 'overdue': return 'Overdue';
      case 'priority': return 'Priority';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      default: return 'All Tasks';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-9 pr-10"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleFilterChange('searchQuery', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Filter Tabs */}
          <Tabs
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value as FilterType)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-6 h-9">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="priority">Priority</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Advanced Filters Button */}
          <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilters > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5"
                  >
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3">
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Priority Filter */}
              <DropdownMenuGroup>
                <p className="text-xs font-medium text-muted-foreground mb-1">Priority</p>
                <div className="flex flex-wrap gap-1">
                  {(['all', 'high', 'medium', 'low', 'none'] as const).map((p) => (
                    <Badge
                      key={p}
                      variant={filters.priority === p ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange('priority', p)}
                    >
                      {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                    </Badge>
                  ))}
                </div>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Project Filter */}
              {projects.length > 0 && (
                <>
                  <DropdownMenuGroup>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Project</p>
                    <div className="space-y-1">
                      <DropdownMenuItem
                        onClick={() => handleFilterChange('projectId', 'all')}
                        className={cn(
                          "cursor-pointer",
                          filters.projectId === 'all' && "bg-accent"
                        )}
                      >
                        <CheckCircle className={cn(
                          "w-3 h-3 mr-2",
                          filters.projectId === 'all' ? "opacity-100" : "opacity-0"
                        )} />
                        All Projects
                      </DropdownMenuItem>
                      {projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => handleFilterChange('projectId', project.id)}
                          className={cn(
                            "cursor-pointer",
                            filters.projectId === project.id && "bg-accent"
                          )}
                        >
                          <CheckCircle className={cn(
                            "w-3 h-3 mr-2",
                            filters.projectId === project.id ? "opacity-100" : "opacity-0"
                          )} />
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <DropdownMenuGroup>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {filters.tags.includes(tag) && (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </DropdownMenuGroup>
              )}

              <DropdownMenuSeparator />

              {/* Sort Options */}
              <DropdownMenuGroup>
                <p className="text-xs font-medium text-muted-foreground mb-1">Sort By</p>
                <div className="space-y-1">
                  {(['dueDate', 'priority', 'createdAt', 'title'] as const).map((sort) => (
                    <DropdownMenuItem
                      key={sort}
                      onClick={() => handleFilterChange('sortBy', sort)}
                      className={cn(
                        "cursor-pointer",
                        filters.sortBy === sort && "bg-accent"
                      )}
                    >
                      <CheckCircle className={cn(
                        "w-3 h-3 mr-2",
                        filters.sortBy === sort ? "opacity-100" : "opacity-0"
                      )} />
                      {sort === 'dueDate' ? 'Due Date' :
                       sort === 'priority' ? 'Priority' :
                       sort === 'createdAt' ? 'Date Created' : 'Title'}
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant={filters.sortOrder === 'asc' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('sortOrder', 'asc')}
                    className="flex-1 h-7"
                  >
                    Asc
                  </Button>
                  <Button
                    variant={filters.sortOrder === 'desc' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('sortOrder', 'desc')}
                    className="flex-1 h-7"
                  >
                    Desc
                  </Button>
                </div>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Clear Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full justify-center text-xs"
              >
                <X className="w-3 h-3 mr-2" />
                Clear All Filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active Filters Display */}
          {activeFilters > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="gap-1">
                {getFilterLabel()}
                <span className="text-xs opacity-70 ml-1">• {filteredTasks.length}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Task Count Summary */}
      {filteredTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-sm text-muted-foreground px-2"
        >
          <span>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
          <span className="text-xs">
            {incompleteTasks.length} active • {completedTasks.length} completed
          </span>
        </motion.div>
      )}

      {/* Task List */}
      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        <AnimatePresence mode="wait">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center space-y-3"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-medium">No tasks found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filters.searchQuery
                    ? `No tasks match "${filters.searchQuery}"`
                    : 'Try adjusting your filters'}
                </p>
              </div>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {/* Incomplete Tasks */}
              <AnimatePresence mode="popLayout">
                {incompleteTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 1
                    }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={() => onToggle(task.id)}
                      onDelete={() => onDelete(task.id)}
                      onUpdatePriority={(priority) => onUpdatePriority(task.id, priority)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && filters.type !== 'active' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-6"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-2 px-2"
                  >
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Completed ({completedTasks.length})
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </motion.div>
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={itemVariants}
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          mass: 1
                        }}
                      >
                        <TaskItem
                          task={task}
                          onToggle={() => onToggle(task.id)}
                          onDelete={() => onDelete(task.id)}
                          onUpdatePriority={(priority) => onUpdatePriority(task.id, priority)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}