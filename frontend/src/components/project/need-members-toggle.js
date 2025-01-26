import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


export function NeedMembersToggle({ projectId, initialState, onToggle }) {
  const [needsMembers, setNeedsMembers] = useState(initialState)

  const handleToggle = (checked) => {
    setNeedsMembers(checked)
    onToggle(projectId, checked)
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id={`need-members-${projectId}`} checked={needsMembers} onCheckedChange={handleToggle} />
      <Label htmlFor={`need-members-${projectId}`}>{needsMembers ? "Seeking Members" : "Team Complete"}</Label>
    </div>
  )
}

