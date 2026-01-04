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

export interface Project {
	id: string;
	userId: string | null;
	name: string;
	type: "user" | "system";
	color?: string;
	icon?: string;
	createdAt?: number;
	updatedAt?: number;
	isShared?: boolean;
}

interface ProjectContextType {
	projects: Project[];
	systemProjects: Project[];
	userProjects: Project[];
	isLoading: boolean;
	error: string | null;
	createProject: (data: CreateProjectData) => Promise<void>;
	updateProject: (id: string, updates: UpdateProjectData) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;
	getProject: (id: string) => Project | undefined;
	getProjectsByType: (type: "user" | "system") => Project[];
	reloadProjects: () => void;
}

interface CreateProjectData {
	name: string;
	type: "user" | "system";
	color?: string;
	icon?: string;
}

interface UpdateProjectData {
	name?: string;
	color?: string;
	icon?: string;
	isShared?: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
	const { user,  } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Queries
	const rawProjects = useQuery(
		api.projects.getProjectsByUser,
		user ? { userId: user.id as Id<"users"> } : { userId: null }
	);

	// Mutations
	const createProjectMutation = useMutation(api.projects.createProject);
	const updateProjectMutation = useMutation(api.projects.updateProject);
	const deleteProjectMutation = useMutation(api.projects.deleteProject);

	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Transform raw projects to Project interface
	useEffect(() => {
		if (rawProjects !== undefined) {
			if (rawProjects === null) {
				setProjects([]);
			} else {
				const mapped: Project[] = rawProjects.map((p) => ({
					id: p._id,
					userId: p.userId,
					name: p.name,
					type: p.type,
					color: p.color,
					icon: p.icon,
					createdAt: p._creationTime,
					isShared: false, // This would need to come from your database schema
				}));
				setProjects(mapped);
			}
			setIsLoading(false);
			setError(null);
		}
	}, [rawProjects]);

	// Handle errors
	useEffect(() => {
		if (rawProjects === null) {
			setError("Failed to load projects");
		}
	}, [rawProjects]);

	// Separate system and user projects
	const systemProjects = useMemo(() => {
		return projects.filter(project => project.type === "system");
	}, [projects]);

	const userProjects = useMemo(() => {
		return projects.filter(project => project.type === "user");
	}, [projects]);

	// Get project by ID
	const getProject = (id: string) => {
		return projects.find(project => project.id === id);
	};

	// Get projects by type
	const getProjectsByType = (type: "user" | "system") => {
		return projects.filter(project => project.type === type);
	};

	// Create new project
	const createProject = async (data: CreateProjectData) => {
		if (!user) {
			throw new Error("User must be authenticated to create a project");
		}

		try {
			setError(null);
			await createProjectMutation({
				userId: user.id as Id<"users">,
				name: data.name,
				type: data.type,
				color: data.color || getRandomColor(),
				icon: data.icon,
			});
		} catch (error) {
			console.error("Failed to create project:", error);
			setError(error instanceof Error ? error.message : "Failed to create project");
			throw error;
		}
	};

	// Update project
	const updateProject = async (id: string, updates: UpdateProjectData) => {
		try {
			setError(null);
			await updateProjectMutation({
				id: id as Id<"projects">,
				...updates,
			});
		} catch (error) {
			console.error("Failed to update project:", error);
			setError(error instanceof Error ? error.message : "Failed to update project");
			throw error;
		}
	};

	// Delete project
	const deleteProject = async (id: string) => {
		try {
			setError(null);
			await deleteProjectMutation({ id: id as Id<"projects"> });
		} catch (error) {
			console.error("Failed to delete project:", error);
			setError(error instanceof Error ? error.message : "Failed to delete project");
			throw error;
		}
	};

	// Reload projects
	const reloadProjects = () => {
		setIsRefreshing(true);
		// This will trigger a re-fetch of the query
		setIsRefreshing(false);
	};

	// Get a random color for new projects
	const getRandomColor = () => {
		const colors = [
			"#3B82F6", // blue
			"#10B981", // green
			"#F59E0B", // yellow
			"#EF4444", // red
			"#8B5CF6", // purple
			"#EC4899", // pink
			"#06B6D4", // cyan
			"#84CC16", // lime
		];
		return colors[Math.floor(Math.random() * colors.length)];
	};

	// Default projects (for unauthenticated users)
	const defaultProjects: Project[] = [
		{
			id: "inbox",
			userId: null,
			name: "Inbox",
			type: "system",
			color: "#3B82F6",
			icon: "Inbox",
			isShared: false,
		},
		{
			id: "today",
			userId: null,
			name: "Today",
			type: "system",
			color: "#10B981",
			icon: "Calendar",
			isShared: false,
		},
		{
			id: "work",
			userId: null,
			name: "Work",
			type: "user",
			color: "#F59E0B",
			icon: "Briefcase",
			isShared: false,
		},
		{
			id: "personal",
			userId: null,
			name: "Personal",
			type: "user",
			color: "#EC4899",
			icon: "User",
			isShared: false,
		},
	];

	// Combine default projects with user projects for unauthenticated users
	const allProjects = useMemo(() => {
		if (!user) {
			return [...defaultProjects, ...userProjects];
		}
		return projects;
	}, [projects, userProjects, , user]);

	const value = {
		projects: allProjects,
		systemProjects,
		userProjects,
		isLoading: isLoading || isRefreshing,
		error,
		createProject,
		updateProject,
		deleteProject,
		getProject,
		getProjectsByType,
		reloadProjects,
	};

	return (
		<ProjectContext.Provider value={value}>
			{children}
		</ProjectContext.Provider>
	);
}

export function useProjects() {
	const context = useContext(ProjectContext);
	if (context === undefined) {
		throw new Error("useProjects must be used within a ProjectProvider");
	}
	return context;
}