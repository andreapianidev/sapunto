'use client'

import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface RowAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  variant?: 'default' | 'destructive'
  separator?: boolean
}

interface RowActionsProps {
  actions: RowAction[]
}

export function RowActions({ actions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8" />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Azioni</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, i) => (
          <span key={i}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.variant}
              onClick={action.onClick}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
