import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./AuthContext";
import { Id } from "../../convex/_generated/dataModel";

interface Task {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	priority: "high" | "medium" | "low" | "none";
	projectId: string;
	labelId: string;
	dueDate?: Date;
	createdAt?: Date;
}

interface Project {
	id: string;
	name: string;
	color?: string;
	icon?: string;
	type: "user" | "system";
}

interface Label {
	id: string;
	name: string;
	type: "user" | "system";
}

interface TodoContextType {
	tasks: Task[];
	projects: Project[];
	labels: Label[];
	isLoading: boolean;
	activeProject: string;
	setActiveProject: (id: string) => void;

	// Todo actions
	addTodo: (data: {
		taskName: string;
		description?: string;
		projectId: string;
		labelId: string;
		dueDate: number;
		priority?: Task["priority"];
	}) => Promise<string>;
	updateTodo: (id: string, updates: any) => Promise<void>;
	toggleTodo: (id: string) => Promise<void>;
	deleteTodo: (id: string) => Promise<void>;
	deleteCompletedTodos: () => Promise<void>;

	// Project actions
	addProject: (data: {
		name: string;
		type: "user" | "system";
		color?: string;
		icon?: string;
	}) => Promise<string>;
	updateProject: (id: string, updates: any) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;

	// Label actions
	addLabel: (data: {
		name: string;
		type: "user" | "system";
	}) => Promise<string>;

	// Derived state
	filteredTasks: Task[];
	taskCount: {
		total: number;
		completed: number;
	};
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [activeProject, setActiveProject] = useState<string>("inbox");

	// Queries
	const rawTasks = useQuery(
		api.todos.getTodosByUser,
		user ? { userId: user.id as Id<"users"> } : "skip",
	);
	const rawProjects = useQuery(
		api.projects.getProjectsByUser,
		user ? { userId: user.id as Id<"users"> } : "skip",
	);
	const rawLabels = useQuery(
		api.labels.getLabelsByUser,
		user ? { userId: user.id as Id<"users"> } : "skip",
	);

	// Mutations
	const createTodoMutation = useMutation(api.todos.createTodo);
	const updateTodoMutation = useMutation(api.todos.updateTodo);
	const toggleTodoMutation = useMutation(api.todos.toggleTodoCompletion);
	const deleteTodoMutation = useMutation(api.todos.deleteTodo);
	const clearCompletedMutation = useMutation(api.todos.deleteCompletedTodos);

	const createProjectMutation = useMutation(api.projects.createProject);
	const updateProjectMutation = useMutation(api.projects.updateProject);
	const deleteProjectMutation = useMutation(api.projects.deleteProject);

	const createLabelMutation = useMutation(api.labels.createLabel);

	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [labels, setLabels] = useState<Label[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (rawTasks && rawProjects && rawLabels) {
			// Map Convex todos to Task interface
			const mappedTasks: Task[] = rawTasks.map((t) => ({
				id: t._id,
				title: t.taskName,
				description: t.description,
				completed: t.isCompleted,
				priority: mapPriority(t.priority),
				projectId: t.projectId,
				labelId: t.labelId,
				dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
			}));
			setTasks(mappedTasks);

			// Map Convex projects
			const mappedProjects: Project[] = rawProjects.map((p) => ({
				id: p._id,
				name: p.name,
				color: p.color,
				icon: p.icon,
				type: p.type,
			}));
			setProjects(mappedProjects);

			// Map Convex labels
			const mappedLabels: Label[] = rawLabels.map((l) => ({
				id: l._id,
				name: l.name,
				type: l.type,
			}));
			setLabels(mappedLabels);

			setIsLoading(false);
		} else if (
			rawTasks === null ||
			rawProjects === null ||
			rawLabels === null
		) {
			setIsLoading(false);
		}
	}, [rawTasks, rawProjects, rawLabels]);

	const mapPriority = (p?: number): Task["priority"] => {
		if (p === 3) return "high";
		if (p === 2) return "medium";
		if (p === 1) return "low";
		return "none";
	};

	const reversePriority = (p: Task["priority"]): number => {
		if (p === "high") return 3;
		if (p === "medium") return 2;
		if (p === "low") return 1;
		return 0;
	};

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			if (activeProject === "inbox") return true;
			if (activeProject === "today") {
				const today = new Date();
				return task.dueDate?.toDateString() === today.toDateString();
			}
			return task.projectId === activeProject;
		});
	}, [tasks, activeProject]);

	const taskCount = useMemo(() => {
		return {
			total: filteredTasks.length,
			completed: filteredTasks.filter((t) => t.completed).length,
		};
	}, [filteredTasks]);

	// Actions
	const addTodo = async (data: {
		taskName: string;
		description?: string;
		projectId: string;
		labelId: string;
		dueDate: number;
		priority?: Task["priority"];
	}) => {
		if (!user) throw new Error("Not authenticated");
		return await createTodoMutation({
			...data,
			userId: user.id as Id<"users">,
			projectId: data.projectId as Id<"projects">,
			labelId: data.labelId as Id<"labels">,
			isCompleted: false,
			priority: data.priority ? reversePriority(data.priority) : 0,
		});
	};

	const updateTodo = async (id: string, updates: any) => {
		await updateTodoMutation({
			id: id as Id<"todos">,
			...updates,
		});
	};

	const toggleTodo = async (id: string) => {
		await toggleTodoMutation({ id: id as Id<"todos"> });
	};

	const deleteTodo = async (id: string) => {
		await deleteTodoMutation({ id: id as Id<"todos"> });
	};

	const deleteCompletedTodos = async () => {
		if (!user) return;
		await clearCompletedMutation({ userId: user.id as Id<"users"> });
	};

	const addProject = async (data: {
		name: string;
		type: "user" | "system";
		color?: string;
		icon?: string;
	}) => {
		if (!user) throw new Error("Not authenticated");
		return await createProjectMutation({
			...data,
			userId: user.id as Id<"users">,
		});
	};

	const updateProject = async (id: string, updates: any) => {
		await updateProjectMutation({
			id: id as Id<"projects">,
			...updates,
		});
	};

	const deleteProject = async (id: string) => {
		await deleteProjectMutation({ id: id as Id<"projects"> });
	};

	const addLabel = async (data: { name: string; type: "user" | "system" }) => {
		if (!user) throw new Error("Not authenticated");
		return await createLabelMutation({
			...data,
			userId: user.id as Id<"users">,
		});
	};

	const value = {
		tasks,
		projects,
		labels,
		isLoading,
		activeProject,
		setActiveProject,
		addTodo,
		updateTodo,
		toggleTodo,
		deleteTodo,
		deleteCompletedTodos,
		addProject,
		updateProject,
		deleteProject,
		addLabel,
		filteredTasks,
		taskCount,
	};

	return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo() {
	const context = useContext(TodoContext);
	if (context === undefined) {
		throw new Error("useTodo must be used within a TodoProvider");
	}
	return context;
}
