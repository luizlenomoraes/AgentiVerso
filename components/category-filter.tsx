"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Category {
    id: string
    name: string
    slug: string
}

interface CategoryFilterProps {
    categories: Category[]
    onFilterChange: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, onFilterChange }: CategoryFilterProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const handleCategoryClick = (categoryId: string | null) => {
        setActiveCategory(categoryId)
        onFilterChange(categoryId)
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Badge
                variant="outline"
                onClick={() => handleCategoryClick(null)}
                className={cn(
                    "cursor-pointer transition-all duration-200",
                    activeCategory === null
                        ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,249,0.3)]"
                        : "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                )}
            >
                Todos
            </Badge>

            {categories.map((category) => (
                <Badge
                    key={category.id}
                    variant="outline"
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                        "cursor-pointer transition-all duration-200",
                        activeCategory === category.id
                            ? "bg-accent/20 border-accent/50 text-accent shadow-[0_0_10px_rgba(255,0,193,0.3)]"
                            : "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                    )}
                >
                    {category.name}
                </Badge>
            ))}
        </div>
    )
}
