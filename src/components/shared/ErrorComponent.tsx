import { motion } from "framer-motion";

export function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
      >
        <div className="text-4xl">⚠️</div>
      </motion.div>
      
      <h1 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        We encountered an error while loading the application.
      </p>
      
      <div className="bg-muted/50 rounded-lg p-4 max-w-md mb-6">
        <code className="text-sm text-destructive">{error.message}</code>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Reload Page
      </button>
    </div>
  )
}