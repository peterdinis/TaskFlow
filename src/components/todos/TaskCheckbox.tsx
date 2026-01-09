import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Priority } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskCheckboxProps {
	checked: boolean;
	priority: Priority;
	onToggle: () => void;
}

const priorityColors = {
	high: "border-priority-high hover:bg-priority-high/10",
	medium: "border-priority-medium hover:bg-priority-medium/10",
	low: "border-priority-low hover:bg-priority-low/10",
	none: "border-priority-none hover:bg-muted",
};

const priorityCheckedColors = {
	high: "bg-priority-high border-priority-high",
	medium: "bg-priority-medium border-priority-medium",
	low: "bg-priority-low border-priority-low",
	none: "bg-muted-foreground border-muted-foreground",
};

export function TaskCheckbox({
	checked,
	priority,
	onToggle,
}: TaskCheckboxProps) {
	return (
		<motion.button
			onClick={onToggle}
			className={cn(
				"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
				checked ? priorityCheckedColors[priority] : priorityColors[priority],
			)}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
		>
			{checked && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 25 }}
				>
					<Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
				</motion.div>
			)}
		</motion.button>
	);
}
