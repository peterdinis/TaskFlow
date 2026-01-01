import { motion } from "framer-motion";

export function PendingComponent() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center">
				<motion.div
					animate={{
						rotate: 360,
						scale: [1, 1.1, 1],
					}}
					transition={{
						rotate: {
							duration: 2,
							repeat: Infinity,
							ease: "linear",
						},
						scale: {
							duration: 1,
							repeat: Infinity,
							ease: "easeInOut",
						},
					}}
					className="w-16 h-16 mx-auto mb-4"
				>
					<div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
				</motion.div>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ repeat: Infinity, duration: 1.5 }}
					className="text-foreground"
				>
					Loading...
				</motion.p>
			</div>
		</div>
	);
}
