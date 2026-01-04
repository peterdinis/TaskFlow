import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Query pre vyhľadávanie úloh podobných textu pomocou vektorovej podobnosti
export const searchTodos = query({
  args: {
    userId: v.id("users"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, query: searchQuery, limit = 10 } = args;

    // Ak je hľadaný reťazec príliš krátky, vráti prázdny výsledok
    if (searchQuery.trim().length < 2) {
      return [];
    }

    // Tu by mal byť kód na získanie vektoru z vstupného textu
    // Toto je len placeholder - v reálnom scenári by ste použili embedding API
    // Napríklad OpenAI Embeddings API s dimension 1536
    const queryEmbedding = await getEmbedding(searchQuery);

    // Hľadanie podobných úloh v hlavných úlohách
    const todos = await ctx.vectorSearch("todos", "by_embedding", {
      vector: queryEmbedding,
      limit: Math.floor(limit / 2), // Polovica limitu pre hlavné úlohy
      filter: (q) => q.eq("userId", userId),
    });

    // Hľadanie podobných úloh v podúlohách
    const subTodos = await ctx.vectorSearch("subTodos", "by_embedding", {
      vector: queryEmbedding,
      limit: Math.floor(limit / 2), // Polovica limitu pre podúlohy
      filter: (q) => q.eq("userId", userId),
    });

    // Spojenie a zoradenie výsledkov podľa relevance
    const allResults = [
      ...todos.map((todo) => ({
        ...todo,
        type: "todo" as const,
      })),
      ...subTodos.map((subTodo) => ({
        ...subTodo,
        type: "subTodo" as const,
      })),
    ];

    // Zoradenie podľa relevance (score)
    allResults.sort((a, b) => b._score - a._score);

    return allResults.slice(0, limit);
  },
});

// Query pre full-text vyhľadávanie v úlohách (bez vektorovej podobnosti)
export const searchTodosByText = query({
  args: {
    userId: v.id("users"),
    query: v.string(),
    limit: v.optional(v.number()),
    filter: v.optional(
      v.object({
        isCompleted: v.optional(v.boolean()),
        projectId: v.optional(v.id("projects")),
        labelId: v.optional(v.id("labels")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, query: searchQuery, limit = 10, filter = {} } = args;

    if (searchQuery.trim().length < 2) {
      return [];
    }

    // Získanie všetkých úloh pre daného používateľa
    let todosQuery = ctx.db
      .query("todos")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    // Aplikovanie filtrov
    if (filter.isCompleted !== undefined) {
      todosQuery = todosQuery.filter((q) => q.eq(q.field("isCompleted"), filter.isCompleted));
    }

    if (filter.projectId) {
      todosQuery = todosQuery.filter((q) => q.eq(q.field("projectId"), filter.projectId));
    }

    if (filter.labelId) {
      todosQuery = todosQuery.filter((q) => q.eq(q.field("labelId"), filter.labelId));
    }

    const todos = await todosQuery.collect();

    // Filtrovanie podľa textového vyhľadávania
    const searchLower = searchQuery.toLowerCase();
    const filteredTodos = todos.filter((todo) => {
      const matchesTaskName = todo.taskName.toLowerCase().includes(searchLower);
      const matchesDescription = todo.description?.toLowerCase().includes(searchLower) ?? false;
      const matchesTags = todo.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ?? false;
      
      return matchesTaskName || matchesDescription || matchesTags;
    });

    // Získanie všetkých podúloh pre daného používateľa
    let subTodosQuery = ctx.db
      .query("subTodos")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    // Aplikovanie filtrov pre podúlohy
    if (filter.isCompleted !== undefined) {
      subTodosQuery = subTodosQuery.filter((q) => q.eq(q.field("isCompleted"), filter.isCompleted));
    }

    if (filter.projectId) {
      subTodosQuery = subTodosQuery.filter((q) => q.eq(q.field("projectId"), filter.projectId));
    }

    if (filter.labelId) {
      subTodosQuery = subTodosQuery.filter((q) => q.eq(q.field("labelId"), filter.labelId));
    }

    const subTodos = await subTodosQuery.collect();

    // Filtrovanie podúloh podľa textového vyhľadávania
    const filteredSubTodos = subTodos.filter((subTodo) => {
      const matchesTaskName = subTodo.taskName.toLowerCase().includes(searchLower);
      const matchesDescription = subTodo.description?.toLowerCase().includes(searchLower) ?? false;
      const matchesTags = subTodo.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ?? false;
      
      return matchesTaskName || matchesDescription || matchesTags;
    });

    // Spojenie výsledkov
    const allResults = [
      ...filteredTodos.map((todo) => ({
        ...todo,
        type: "todo" as const,
        _score: calculateTextScore(todo, searchLower),
      })),
      ...filteredSubTodos.map((subTodo) => ({
        ...subTodo,
        type: "subTodo" as const,
        _score: calculateTextScore(subTodo, searchLower),
      })),
    ];

    // Zoradenie podľa relevance
    allResults.sort((a, b) => b._score - a._score);

    return allResults.slice(0, limit);
  },
});

// Mutation pre aktualizáciu embeddingov úloh
export const updateTodoEmbedding = mutation({
  args: {
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Generovanie embeddingu z textu úlohy
    const textToEmbed = `${todo.taskName} ${todo.description || ""} ${todo.tags?.join(" ") || ""}`;
    const embedding = await getEmbedding(textToEmbed);

    // Aktualizácia embeddingu
    await ctx.db.patch(args.todoId, {
      embedding,
    });

    return { success: true };
  },
});

// Mutation pre aktualizáciu embeddingov podúloh
export const updateSubTodoEmbedding = mutation({
  args: {
    subTodoId: v.id("subTodos"),
  },
  handler: async (ctx, args) => {
    const subTodo = await ctx.db.get(args.subTodoId);
    if (!subTodo) {
      throw new Error("Sub-todo not found");
    }

    // Generovanie embeddingu z textu podúlohy
    const textToEmbed = `${subTodo.taskName} ${subTodo.description || ""} ${subTodo.tags?.join(" ") || ""}`;
    const embedding = await getEmbedding(textToEmbed);

    // Aktualizácia embeddingu
    await ctx.db.patch(args.subTodoId, {
      embedding,
    });

    return { success: true };
  },
});

// Funkcia na získanie embeddingu z textu
// Toto je placeholder - v reálnom scenári by ste použili externé API
async function getEmbedding(text: string): Promise<number[]> {
  // TODO: Implementujte volanie embedding API (OpenAI, Cohere, etc.)
  // Pre teraz vrátime dummy vektor
  return Array(1536).fill(0).map(() => Math.random());
}

// Pomocná funkcia pre výpočet skóre v textovom vyhľadávaní
function calculateTextScore(item: any, searchLower: string): number {
  let score = 0;
  
  // Väčšia váha pre zhodu v názve
  if (item.taskName.toLowerCase().includes(searchLower)) {
    score += 3;
  }
  
  // Stredná váha pre zhodu v popise
  if (item.description?.toLowerCase().includes(searchLower)) {
    score += 2;
  }
  
  // Menšia váha pre zhodu v tagoch
  if (item.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))) {
    score += 1;
  }
  
  return score;
}

// Query pre vyhľadávanie úloh podľa dátumu
export const searchTodosByDate = query({
  args: {
    userId: v.id("users"),
    date: v.number(), // Unix timestamp
    range: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const { userId, date, range = "day" } = args;
    
    // Výpočet časového rozsahu
    const startDate = date;
    let endDate = date;
    
    switch (range) {
      case "day":
        endDate = date + 86400000; // +1 deň
        break;
      case "week":
        endDate = date + 604800000; // +1 týždeň
        break;
      case "month":
        endDate = date + 2592000000; // +30 dní
        break;
    }

    // Hľadanie úloh v danom rozsahu
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("dueDate"), startDate),
          q.lt(q.field("dueDate"), endDate)
        )
      )
      .collect();

    // Hľadanie podúloh v danom rozsahu
    const subTodos = await ctx.db
      .query("subTodos")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("dueDate"), startDate),
          q.lt(q.field("dueDate"), endDate)
        )
      )
      .collect();

    return {
      todos,
      subTodos,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },
});